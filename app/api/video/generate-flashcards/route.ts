import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createRouteHandlerClient } from '@/lib/supabase/server';

/**
 * POST /api/video/generate-flashcards
 * Body: { courseId: string | number }
 * - Downloads `${courseId}/captions.vtt` from Supabase storage bucket `translations`
 * - Sends captions to OpenAI to generate flashcards matching flashcard-json-structure.txt
 * Returns: { flashcards: Array<{ id: number, question: string, choices: string[], correctAnswer: string }>, raw?: string }
 */
export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }

    const body = await req.json().catch(() => null) as null | { courseId?: string | number };
    const courseId = body?.courseId;
    if (!courseId) {
      return NextResponse.json({ error: 'Missing courseId' }, { status: 400 });
    }

    // Download captions.vtt from Supabase storage
    const supabase = await createRouteHandlerClient();
    const path = `${courseId}/captions.vtt`;
    const { data: vttBlob, error: downloadError } = await supabase.storage
      .from('translations')
      .download(path);
    if (downloadError || !vttBlob) {
      return NextResponse.json({ error: `Unable to download captions: ${downloadError?.message || 'not found'}` }, { status: 404 });
    }
    const captionsVtt = await vttBlob.text();

    if (!captionsVtt || captionsVtt.trim().length === 0) {
      return NextResponse.json({ error: 'captions.vtt is empty' }, { status: 422 });
    }

    // Prepare OpenAI prompt
    const openai = new OpenAI({ apiKey });

    const system = [
      'You are an assistant that generates educational multiple-choice flashcards from a transcript (WebVTT).',
      'Audience: children in elementary school (approximately ages 7–11).',
      'Accessibility: Make content engaging and inclusive for neurodivergent learners.',
      'Return ONLY a valid JSON array, no code fences or prose.',
      'Each item must be an object with: "id" (number), "question" (string), "choices" (array of 3-6 short strings), and "correctAnswer" (string that exactly matches one of the choices).',
      'Rules:',
      '- Use the same language as the transcript.',
      '- Base questions on key facts or concepts present in the transcript.',
      '- Reading level: Grade 2–5. Use short sentences and simple words.',
      '- Be friendly and encouraging; avoid sarcasm, idioms, and metaphors.',
      '- Keep one clear idea per question. Avoid trick questions.',
      '- Choices should be plausible, similar length, and clearly distinct; include exactly one correct answer.',
      '- Sensory-friendly wording: avoid intense or overwhelming language.',
      '- Ensure 5–20 items depending on transcript length.',
      '- Do not include explanations, metadata, or commentary.'
    ].join('\n');

    const user = [
      'Generate kid-friendly (elementary school) and neurodiversity-inclusive flashcards from this WebVTT transcript. Output ONLY the JSON array described.',
      captionsVtt.length > 120000 ? captionsVtt.slice(0, 120000) : captionsVtt,
    ].join('\n');

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL_ID || 'gpt-4o-mini',
      temperature: 0.3,
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
    } catch (_) {
      const match = raw.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {}
      }
    }

    if (!Array.isArray(parsed)) {
      return NextResponse.json({ error: 'Model did not return a JSON array', raw }, { status: 502 });
    }

    // Sanitize to desired shape
    type Flashcard = { id: number; question: string; choices: string[]; correctAnswer: string };
    const flashcards: Flashcard[] = (parsed as any[])
      .map((fc, idx) => {
        const id = Number(fc?.id ?? idx + 1);
        const question = String(fc?.question || '').trim();
        const choices = Array.isArray(fc?.choices) ? fc.choices.map((c: any) => String(c)).slice(0, 6) : [];
        const correctAnswer = String(fc?.correctAnswer || '').trim();
        return { id, question, choices, correctAnswer } as Flashcard;
      })
      .filter((fc) => fc.id > 0 && fc.question && Array.isArray(fc.choices) && fc.choices.length >= 3 && fc.correctAnswer && fc.choices.includes(fc.correctAnswer));

    if (flashcards.length === 0) {
      return NextResponse.json({ error: 'No valid flashcards parsed', raw }, { status: 502 });
    }

    return NextResponse.json({ flashcards }, { status: 200 });
  } catch (err) {
    console.error('[generate-flashcards] Error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}


