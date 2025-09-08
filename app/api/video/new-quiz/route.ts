import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createRouteHandlerClient } from '@/lib/supabase/server';

type FlashcardQuestion = {
  id: number;
  type: 'flashcard';
  question: string;
  choices: string[];
  correctAnswer: string;
};

type FillBlankQuestion = {
  id: number;
  type: 'fillBlank';
  title?: string;
  instructions?: string;
  sentence: string; // single blank indicated by ____
  choices: string[]; // 3-6 short options
  correctAnswer: string; // must be one of choices
  feedback?: { correct?: string; incorrect?: string };
};

type MatchingPair = { left: string; right: string };
type MatchingGameQuestion = {
  id: number;
  type: 'matchingGame';
  title?: string;
  instructions?: string;
  pairs: MatchingPair[]; // 3-8 pairs
  feedback?: { correct?: string; incorrect?: string };
};

type AnyQuestion = FlashcardQuestion | FillBlankQuestion | MatchingGameQuestion;

/**
 * POST /api/video/new-quiz
 * Body: {
 *   sectionId: string | number,
 *   maxQuestions?: number,
 *   previous?: Array<FlashcardQuestion|FillBlankQuestion|MatchingGameQuestion>
 * }
 * - Downloads `${sectionId}/captions.vtt` from Supabase storage bucket `translations`
 * - Asks OpenAI to generate a new, VARIED set of questions from captions that are NOT duplicates
 *   of provided `previous` questions (avoid same wording and exact facts). Mix types.
 * Returns: { questions: AnyQuestion[], raw?: string }
 */
export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }

    const body = (await req.json().catch(() => null)) as null | {
      sectionId?: string | number;
      maxQuestions?: number;
      previous?: AnyQuestion[];
      language?: 'fr' | 'en' | 'es' | string;
    };

    const sectionId = body?.sectionId;
    const maxQuestions = Math.min(8, Math.max(1, Number(body?.maxQuestions ?? 8)));
    const previous = Array.isArray(body?.previous) ? body?.previous : [];

    if (!sectionId) {
      return NextResponse.json({ error: 'Missing sectionId' }, { status: 400 });
    }

    // Download captions.vtt from Supabase storage
    const supabase = await createRouteHandlerClient();
    const normalizedSectionId = String(sectionId);
    const path = `${normalizedSectionId}/captions.vtt`;
    const { data: vttBlob, error: downloadError } = await supabase.storage
      .from('translations')
      .download(path);
    if (downloadError || !vttBlob) {
      return NextResponse.json(
        { error: `Unable to download captions: ${downloadError?.message || 'not found'}` },
        { status: 404 }
      );
    }
    const captionsVtt = await vttBlob.text();
    if (!captionsVtt || captionsVtt.trim().length === 0) {
      return NextResponse.json({ error: 'Empty captions' }, { status: 422 });
    }

    const openai = new OpenAI({ apiKey });

    const system = [
      'You generate a VARIED set of kid-friendly learning questions (ages 7–11) from a WebVTT transcript.',
      'Return ONLY a valid JSON array of up to N items. No prose, no code fences.',
      'Allowed types and strict shapes:',
      '- flashcard: { "id": number, "type": "flashcard", "question": string, "choices": string[3-6], "correctAnswer": string }',
      '- fillBlank: { "id": number, "type": "fillBlank", "title"?: string, "instructions"?: string, "sentence": string (contains exactly one "____"), "choices": string[3-6], "correctAnswer": string, "feedback"?: { "correct"?: string, "incorrect"?: string } }',
      '- matchingGame: { "id": number, "type": "matchingGame", "title"?: string, "instructions"?: string, "pairs": Array<{"left": string, "right": string}> (3-8), "feedback"?: { "correct"?: string, "incorrect"?: string } }',
      'Rules:',
      '- Use the same language as the transcript.',
      '- Keep wording simple, friendly, and sensory-friendly (Grade 2–5).',
      '- Each item should test a single clear idea from the transcript.',
      '- Mix the three types to keep engagement high; avoid duplicates.',
      '- Ensure every flashcard has exactly one correct answer present in choices.',
      '- For fillBlank, sentence MUST include exactly one ____ and correctAnswer MUST be one of choices.',
      '- For matchingGame, provide meaningful left/right pairs based on transcript facts.',
      '- IMPORTANT: Avoid repeating or paraphrasing any of the provided previous questions, answers, or exact facts; generate new coverage or different angles.',
    ].join('\n');

    const previousBrief = previous
      .slice(0, 12)
      .map((q) => {
        if ((q as any).type === 'flashcard') {
          return {
            type: 'flashcard',
            question: (q as any).question,
            choices: (q as any).choices,
            correctAnswer: (q as any).correctAnswer,
          };
        }
        if ((q as any).type === 'fillBlank') {
          return {
            type: 'fillBlank',
            title: (q as any).title,
            sentence: (q as any).sentence,
            choices: (q as any).choices,
            correctAnswer: (q as any).correctAnswer,
          };
        }
        if ((q as any).type === 'matchingGame' || (q as any).type === 'matching') {
          return {
            type: 'matchingGame',
            title: (q as any).title,
            pairs: (q as any).pairs,
          };
        }
        return null;
      })
      .filter(Boolean);

    const user = [
      `Create up to ${maxQuestions} NEW, different questions (flashcard, fillBlank, matchingGame) from this WebVTT transcript.`,
      'Avoid duplicating or paraphrasing the following previous questions (and their ideas):',
      JSON.stringify(previousBrief, null, 2),
      'Output ONLY the JSON array described above.',
      captionsVtt.length > 120000 ? captionsVtt.slice(0, 120000) : captionsVtt,
    ].join('\n');

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL_ID || 'gpt-4o-mini',
      temperature: 0.6,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content?.trim() || '';

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON from model', raw }, { status: 502 });
    }

    if (!Array.isArray(parsed)) {
      return NextResponse.json({ error: 'Model did not return an array', raw }, { status: 502 });
    }

    const allowedTypes = new Set(['flashcard', 'fillBlank', 'matchingGame']);
    const sanitize = (item: any, idx: number): AnyQuestion | null => {
      const id = Number(item?.id ?? idx + 1);
      const type = String(item?.type || '').trim();
      if (!id || id <= 0) return null;

      if (type === 'flashcard') {
        const question = String(item?.question || '').trim();
        const choices = Array.isArray(item?.choices)
          ? item.choices.map((c: any) => String(c)).slice(0, 6)
          : [];
        const correctAnswer = String(item?.correctAnswer || '').trim();
        if (!question || choices.length < 3 || !correctAnswer || !choices.includes(correctAnswer))
          return null;
        return { id, type: 'flashcard', question, choices, correctAnswer } as FlashcardQuestion;
      }

      if (type === 'fillBlank') {
        const title = item?.title != null ? String(item.title) : undefined;
        const instructions = item?.instructions != null ? String(item.instructions) : undefined;
        const sentence = String(item?.sentence || '').trim();
        const choices = Array.isArray(item?.choices)
          ? item.choices.map((c: any) => String(c)).slice(0, 6)
          : [];
        const correctAnswer = String(item?.correctAnswer || item?.correct_answer || '').trim();
        const feedback =
          item?.feedback && typeof item.feedback === 'object'
            ? {
                correct: item.feedback.correct != null ? String(item.feedback.correct) : undefined,
                incorrect:
                  item.feedback.incorrect != null ? String(item.feedback.incorrect) : undefined,
              }
            : undefined;
        const blanks = (sentence.match(/____/g) || []).length;
        if (
          !sentence ||
          blanks !== 1 ||
          choices.length < 3 ||
          !correctAnswer ||
          !choices.includes(correctAnswer)
        )
          return null;
        return {
          id,
          type: 'fillBlank',
          title,
          instructions,
          sentence,
          choices,
          correctAnswer,
          feedback,
        } as FillBlankQuestion;
      }

      if (type === 'matchingGame' || (!allowedTypes.has(type) && type === 'matching')) {
        const title = item?.title != null ? String(item.title) : undefined;
        const instructions = item?.instructions != null ? String(item.instructions) : undefined;
        const rawPairs = Array.isArray(item?.pairs) ? item.pairs : [];
        const pairs: MatchingPair[] = rawPairs
          .map((p: any) => ({
            left: String(p?.left || '').trim(),
            right: String(p?.right || '').trim(),
          }))
          .filter((p: MatchingPair) => p.left && p.right)
          .slice(0, 8);
        const feedback =
          item?.feedback && typeof item.feedback === 'object'
            ? {
                correct: item.feedback.correct != null ? String(item.feedback.correct) : undefined,
                incorrect:
                  item.feedback.incorrect != null ? String(item.feedback.incorrect) : undefined,
              }
            : undefined;
        if (pairs.length < 3) return null;
        return {
          id,
          type: 'matchingGame',
          title,
          instructions,
          pairs,
          feedback,
        } as MatchingGameQuestion;
      }

      return null;
    };

    const cleaned: AnyQuestion[] = (parsed as any[])
      .map(sanitize)
      .filter((q: AnyQuestion | null): q is AnyQuestion => q !== null)
      .slice(0, maxQuestions);

    if (cleaned.length === 0) {
      return NextResponse.json({ error: 'No valid questions parsed', raw }, { status: 502 });
    }

    return NextResponse.json({ questions: cleaned }, { status: 200 });
  } catch (err) {
    console.error('[new-quiz] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
