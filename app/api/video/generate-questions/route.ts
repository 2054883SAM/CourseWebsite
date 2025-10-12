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

type VttCue = { start: number; end: number; text: string };

function parseTimestampToSeconds(ts: string): number {
  // Supports hh:mm:ss.mmm or mm:ss.mmm (mmm optional)
  const parts = ts.trim().split(':');
  let h = 0,
    m = 0,
    s = 0;
  if (parts.length === 3) {
    h = Number(parts[0]);
    m = Number(parts[1]);
    s = Number(parts[2].replace(',', '.'));
  } else if (parts.length === 2) {
    m = Number(parts[0]);
    s = Number(parts[1].replace(',', '.'));
  }
  if (Number.isNaN(h)) h = 0;
  if (Number.isNaN(m)) m = 0;
  if (Number.isNaN(s)) s = 0;
  return h * 3600 + m * 60 + s;
}

function parseWebVtt(vtt: string): VttCue[] {
  const lines = vtt.split(/\r?\n/);
  const cues: VttCue[] = [];
  let i = 0;
  // Skip header if present
  if (lines[i] && /^WEBVTT/i.test(lines[i])) {
    i++;
  }
  while (i < lines.length) {
    // Skip empty and numeric identifier lines
    while (i < lines.length && lines[i].trim() === '') i++;
    // Optional cue identifier
    if (i < lines.length && lines[i].match(/^[A-Za-z0-9\-_. ]+$/) && !lines[i].includes('-->')) {
      i++;
    }
    if (i >= lines.length) break;
    const timeLine = lines[i++];
    if (!timeLine || !timeLine.includes('-->')) continue;
    const [startStr, endStr] = timeLine.split('-->').map((s) => s.trim());
    const start = parseTimestampToSeconds(startStr);
    const end = parseTimestampToSeconds((endStr || '').split(' ')[0]);
    const textParts: string[] = [];
    while (i < lines.length && lines[i].trim() !== '') {
      textParts.push(lines[i]);
      i++;
    }
    const text = textParts.join(' ').trim();
    if (!Number.isNaN(start) && !Number.isNaN(end) && end > start) {
      cues.push({ start, end, text });
    }
  }
  return cues;
}

function normalizeForMatch(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9àâäçéèêëîïôöùûüñ\s]/gi, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4);
}

function shuffleArrayInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

function attachTimestampsToQuestions(cues: VttCue[], questions: AnyQuestion[]): AnyQuestion[] {
  if (!Array.isArray(cues) || cues.length === 0) return questions;

  const cueTokens: string[][] = cues.map((c) => normalizeForMatch(c.text));

  const getQuestionTokens = (q: AnyQuestion): string[] => {
    if (q.type === 'flashcard') {
      return normalizeForMatch(`${q.question} ${q.correctAnswer}`);
    }
    if (q.type === 'fillBlank') {
      return normalizeForMatch(`${q.sentence} ${q.correctAnswer}`);
    }
    // matchingGame
    const mg = q as MatchingGameQuestion;
    const pairsText = mg.pairs.map((p) => `${p.left} ${p.right}`).join(' ');
    return normalizeForMatch(`${mg.title || ''} ${mg.instructions || ''} ${pairsText}`);
  };

  const annotated = questions.map((q, idx) => {
    const qTokens = new Set(getQuestionTokens(q));
    let bestIdx = -1;
    let bestScore = -1;
    for (let i = 0; i < cues.length; i++) {
      const tokens = cueTokens[i];
      if (!tokens || tokens.length === 0) continue;
      let score = 0;
      for (const t of tokens) {
        if (qTokens.has(t)) score++;
      }
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }
    // Fallback: distribute evenly if no reasonable match
    if (bestIdx === -1 || bestScore === 0) {
      bestIdx = Math.min(
        cues.length - 1,
        Math.floor(((idx + 1) / (questions.length + 1)) * cues.length)
      );
    }
    const chosen = cues[bestIdx];
    // Attach non-breaking fields using type assertion to avoid changing API contract
    (q as any).startTime = chosen.start;
    (q as any).endTime = chosen.end;
    return q;
  });

  return annotated;
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }

    const body = (await req.json().catch(() => null)) as null | {
      courseId?: string | number;
      sectionId?: string | number;
      maxQuestions?: number;
      language?: 'fr' | 'en' | 'es' | string;
    };
    const sectionId = body?.sectionId;
    const maxQuestions = Math.min(8, Math.max(1, Number(body?.maxQuestions ?? 8)));
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
    const cues = parseWebVtt(captionsVtt);

    const openai = new OpenAI({ apiKey });

    const system = [
      'You generate a VARIED set of learning questions for children (ages 7–11) from a WebVTT transcript.',
      'Return ONLY a valid JSON array of up to N items. No prose, no code fences.',
      'Allowed types and strict shapes:',
      '- flashcard: { "id": number, "type": "flashcard", "question": string, "choices": string[3-6], "correctAnswer": string }',
      '- fillBlank: { "id": number, "type": "fillBlank", "title"?: string, "instructions"?: string, "sentence": string (contains exactly one "____"), "choices": string[3-6], "correctAnswer": string, "feedback"?: { "correct"?: string, "incorrect"?: string } }',
      '- matchingGame: { "id": number, "type": "matchingGame", "title"?: string, "instructions"?: string, "pairs": Array<{"left": string, "right": string}> (3-8), "feedback"?: { "correct"?: string, "incorrect"?: string } }',
      'Rules:',
      '- Use the same language as the transcript.',
      '- Keep wording simple, friendly, and sensory-friendly. Grade 2–5 reading level.',
      '- Each item should test a single clear idea from the transcript.',
      '- Mix the three types to keep engagement high; avoid duplicates.',
      '- Ensure every flashcard has exactly one correct answer present in choices.',
      '- For fillBlank, sentence MUST include exactly one ____ and correctAnswer MUST be one of choices.',
      '- For matchingGame, provide meaningful left/right pairs based on transcript facts.',
    ].join('\n');

    const user = [
      `Create up to ${maxQuestions} mixed-type questions (flashcard, fillBlank, matchingGame) from this WebVTT transcript. Output ONLY the JSON array described.`,
      captionsVtt.length > 120000 ? captionsVtt.slice(0, 120000) : captionsVtt,
    ].join('\n');

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL_ID || 'gpt-4o-mini',
      temperature: 0.4,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content?.trim() || '';

    // Attempt to parse strict JSON array
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
      if (!id || id <= 0 || !allowedTypes.has(type)) return null;

      if (type === 'flashcard') {
        const question = String(item?.question || '').trim();
        const choices = Array.isArray(item?.choices)
          ? item.choices.map((c: any) => String(c)).slice(0, 6)
          : [];
        const correctAnswer = String(item?.correctAnswer || '').trim();
        if (!question || choices.length < 3 || !correctAnswer || !choices.includes(correctAnswer))
          return null;
        const shuffledChoices = shuffleArrayInPlace([...choices]);
        return { id, type: 'flashcard', question, choices: shuffledChoices, correctAnswer };
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
        const shuffledChoices = shuffleArrayInPlace([...choices]);
        return {
          id,
          type: 'fillBlank',
          title,
          instructions,
          sentence,
          choices: shuffledChoices,
          correctAnswer,
          feedback,
        };
      }

      if (type === 'matchingGame') {
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
        const shuffledPairs = shuffleArrayInPlace([...pairs]);
        return { id, type: 'matchingGame', title, instructions, pairs: shuffledPairs, feedback };
      }

      return null;
    };

    let cleaned: AnyQuestion[] = (parsed as any[])
      .map(sanitize)
      .filter((q: AnyQuestion | null): q is AnyQuestion => q !== null)
      .slice(0, maxQuestions);

    if (cleaned.length === 0) {
      return NextResponse.json({ error: 'No valid questions parsed', raw }, { status: 502 });
    }

    // Randomize overall order of questions to avoid predictable positions
    cleaned = shuffleArrayInPlace([...cleaned]);

    // Attach timestamps from cues for better alignment with the video
    cleaned = attachTimestampsToQuestions(cues, cleaned);

    return NextResponse.json({ questions: cleaned }, { status: 200 });
  } catch (err) {
    console.error('[generate-questions] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
