import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createRouteHandlerClient } from '@/lib/supabase/server';

/**
 * POST /api/video/generate-chapter-flashcard
 * Body: { courseId: string | number, startTime: number, duration?: number }
 * - Downloads `${courseId}/captions.vtt` from Supabase storage bucket `translations`
 * - Extracts caption cues overlapping [startTime, startTime+duration) window
 * - Sends that segment to OpenAI to generate ONE flashcard (kid-friendly, neurodiversity-inclusive)
 * Returns: { flashcard: { id: number, question: string, choices: string[], correctAnswer: string }, raw?: string }
 */
export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }

    const body = await req.json().catch(() => null) as null | {
      courseId?: string | number;
      startTime?: number;
      duration?: number;
    };
    const courseId = body?.courseId;
    const startTime = typeof body?.startTime === 'number' ? body!.startTime : undefined;
    const duration = typeof body?.duration === 'number' ? body!.duration : undefined;
    if (!courseId || startTime === undefined) {
      return NextResponse.json({ error: 'Missing courseId or startTime' }, { status: 400 });
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

    // Window of interest
    const endTime = duration && duration > 0 ? startTime + duration : undefined;

    // Extract relevant cues from VTT (simple parser)
    const timecodeRegex = /(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s+-->\s+(\d{2}):(\d{2}):(\d{2})\.(\d{3})/;
    const toSeconds = (h: string, m: string, s: string, ms: string) =>
      Number(h) * 3600 + Number(m) * 60 + Number(s) + Number(ms) / 1000;

    const lines = captionsVtt.split(/\r?\n/);
    let i = 0;
    const collected: string[] = [];
    while (i < lines.length) {
      const line = lines[i];
      const match = timecodeRegex.exec(line);
      if (!match) {
        i++;
        continue;
      }
      const cueStart = toSeconds(match[1], match[2], match[3], match[4]);
      const cueEnd = toSeconds(match[5], match[6], match[7], match[8]);

      const overlaps = endTime === undefined
        ? cueEnd > startTime
        : cueStart < endTime && cueEnd > startTime;

      // Collect all subsequent text lines until blank line
      const cueText: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== '') {
        cueText.push(lines[i]);
        i++;
      }
      // Skip the blank separator
      while (i < lines.length && lines[i].trim() === '') i++;

      if (overlaps && cueText.length > 0) {
        collected.push(cueText.join('\n'));
      }
    }

    const segmentText = collected.join('\n').trim();
    if (!segmentText) {
      return NextResponse.json({ error: 'No captions found for the specified window' }, { status: 422 });
    }

    const openai = new OpenAI({ apiKey });

    const system = [
      'You generate a single educational multiple-choice flashcard from a short transcript segment (WebVTT text lines).',
      'Audience: children in elementary school (approximately ages 7–11).',
      'Accessibility: Make content engaging and inclusive for neurodivergent learners.',
      'Return ONLY a valid JSON object, no code fences or prose.',
      'Object shape: { "id": number, "question": string, "choices": string[], "correctAnswer": string }',
      'Rules:',
      '- Use the same language as the transcript segment.',
      '- Base the question on a key fact or concept present in the segment.',
      '- Reading level: Grade 2–5. Short sentences and simple words.',
      '- Be friendly and encouraging; avoid sarcasm, idioms, and metaphors.',
      '- Choices should be plausible (3–5 options) with exactly one correct answer.',
      '- Sensory-friendly wording.',
      '- Do not include explanations, metadata, or commentary.'
    ].join('\n');

    const user = [
      'Create ONE flashcard from this transcript segment. Output ONLY the JSON object described.',
      segmentText.length > 20000 ? segmentText.slice(0, 20000) : segmentText,
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

    // Attempt to parse strict JSON object
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (_) {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {}
      }
    }

    type Flashcard = { id: number; question: string; choices: string[]; correctAnswer: string };
    const sanitize = (obj: any, fallbackId = 1): Flashcard | null => {
      const id = Number(obj?.id ?? fallbackId);
      const question = String(obj?.question || '').trim();
      const choices = Array.isArray(obj?.choices) ? obj.choices.map((c: any) => String(c)).slice(0, 6) : [];
      const correctAnswer = String(obj?.correctAnswer || '').trim();
      if (!id || !question || choices.length < 3 || !correctAnswer || !choices.includes(correctAnswer)) return null;
      return { id, question, choices, correctAnswer };
    };

    const flashcard = sanitize(parsed);
    if (!flashcard) {
      return NextResponse.json({ error: 'Model did not return a valid flashcard', raw }, { status: 502 });
    }

    return NextResponse.json({ flashcard }, { status: 200 });
  } catch (err) {
    console.error('[generate-chapter-flashcard] Error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}


