import { NextResponse } from 'next/server';
import OpenAI from 'openai';

type ChapterDraft = {
  title: string;
  startTime: number;
  duration?: number;
  description?: string;
};

// --- VTT Condenser Utilities ---
function parseTimeToSeconds(t: string): number | null {
  // Supports HH:MM:SS.mmm or MM:SS.mmm or HH:MM:SS
  const m = t.match(/^(\d{1,2}):(\d{2}):(\d{2})(?:[\.,](\d{1,3}))?$/) || t.match(/^(\d{1,2}):(\d{2})(?:[\.,](\d{1,3}))?$/);
  if (!m) return null;
  if (m.length === 5) {
    const hh = Number(m[1]);
    const mm = Number(m[2]);
    const ss = Number(m[3]);
    return hh * 3600 + mm * 60 + ss;
  }
  const mm = Number(m[1]);
  const ss = Number(m[2]);
  return mm * 60 + ss;
}

function formatSecondsToMMSS(total: number): string {
  const mm = Math.floor(total / 60);
  const ss = Math.floor(total % 60);
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

type VttCue = { start: number; end: number; text: string };

function extractCuesFromVtt(vtt: string): VttCue[] {
  const blocks = vtt.split(/\n\n+/);
  const cues: VttCue[] = [];
  for (const block of blocks) {
    if (/^WEBVTT/i.test(block.trim())) continue;
    const timing = block.match(/(\d{1,2}:\d{2}(?::\d{2})?(?:[\.,]\d{1,3})?)\s*-->\s*(\d{1,2}:\d{2}(?::\d{2})?(?:[\.,]\d{1,3})?)/);
    if (!timing) continue;
    const start = parseTimeToSeconds(timing[1]);
    const end = parseTimeToSeconds(timing[2]);
    if (start == null || end == null) continue;
    const text = block
      .split('\n')
      .slice(1) // drop timing line or ID line
      .join(' ')
      // Remove speaker tags and markup: <v Name> or <b>, <i>
      .replace(/<[^>]+>/g, ' ')
      // Remove bracketed/asides: [MUSIC], (applause)
      .replace(/[\[\(][^\]\)]*[\)\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!text) continue;
    // Skip common non-speech noises after cleaning
    if (/^(music|applause|silence|noise)$/i.test(text)) continue;
    cues.push({ start, end, text });
  }
  return cues;
}

function condenseVttToTimeline(vtt: string, opts?: { maxChars?: number; maxWindows?: number }): string {
  const { maxChars = 32000, maxWindows = 1200 } = opts || {};
  const cues = extractCuesFromVtt(vtt);
  if (cues.length === 0) {
    // Fallback to trimmed raw content if parsing fails
    return vtt.slice(0, Math.max(8000, Math.min(maxChars, 20000)));
  }

  const duration = Math.max(...cues.map(c => c.end));
  // Determine window size to keep number of windows within maxWindows
  const minWindow = 30; // seconds
  const windowSec = Math.max(minWindow, Math.ceil(duration / Math.max(1, maxWindows)));

  const windows: Array<{ t: number; text: string[] }> = [];
  let t = 0;
  while (t <= duration) {
    windows.push({ t, text: [] });
    t += windowSec;
  }

  // Assign cues to windows
  for (const cue of cues) {
    const idx = Math.min(windows.length - 1, Math.floor(cue.start / windowSec));
    windows[idx].text.push(cue.text);
  }

  // Build condensed lines with time anchors and trimmed text per window
  const lines: string[] = [];
  for (const w of windows) {
    if (w.text.length === 0) continue;
    // Deduplicate short repeats
    const seen = new Set<string>();
    const merged: string[] = [];
    for (const s of w.text) {
      const key = s.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(s);
      if (merged.join(' ').length > 300) break; // cap per window
    }
    const line = `${formatSecondsToMMSS(w.t)} ${merged.join(' ')}`.trim();
    lines.push(line);
    if (lines.join('\n').length > maxChars) break;
  }

  // Ensure we don't exceed maxChars; if exceeded, sample every other line
  let condensed = lines.join('\n');
  if (condensed.length > maxChars) {
    const sampled: string[] = [];
    for (let i = 0; i < lines.length; i += 2) sampled.push(lines[i]);
    condensed = sampled.join('\n').slice(0, maxChars);
  }

  // Prefix a simple header to clarify format
  return `TIMELINE\n${condensed}`;
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
    }

    const body = await req.json().catch(() => null) as null | {
      captions?: string;
      language?: 'fr' | 'en' | 'es';
      targetChapterCount?: number;
    };

    if (!body || !body.captions) {
      return NextResponse.json({ error: 'Missing captions in request body' }, { status: 400 });
    }

    const { captions, language = 'fr', targetChapterCount } = body;

    const openai = new OpenAI({ apiKey });

    const system = [
      'You are an assistant that creates structured video chapters from a transcript or caption file.',
      'The output must be ONLY a valid JSON array of chapter objects, nothing else. No code fences, no prose.',
      'Each chapter object must have: "title" (string), "startTime" (number, seconds).',
      'Optional fields: "duration" (number, seconds), "description" (string).',
      'Rules:',
      '- Use the transcript timing to choose reasonable chapter boundaries.',
      '- Ensure startTime values are increasing and start at 0 or the first meaningful point.',
      '- If duration is provided, ensure it is positive and non-overlapping with the next chapter.',
      '- Keep titles short and descriptive; use the transcript language.',
      '- If no clear structure, create 4-8 logical chapters depending on length.',
      '- If targetChapterCount is provided, aim for that many chapters (but keep quality).'
    ].join('\n');

    // Condense the VTT to a time-anchored timeline to fit long videos (8h+)
    const condensed = condenseVttToTimeline(captions, { maxChars: 32000, maxWindows: 1200 });

    const user = [
      `Language: ${language}`,
      targetChapterCount ? `Target chapters: ${targetChapterCount}` : 'Target chapters: auto',
      'Input is a condensed timeline with time anchors in the format "MM:SS text" (one per window).',
      'Use the anchors and content to infer global chapter boundaries and titles. Return absolute startTime in seconds.',
      'Return ONLY the JSON array as specified. Do not include comments or explanations.',
      '```',
      condensed,
      '```'
    ].join('\n');

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL_ID || 'gpt-4o-mini',
      temperature: 0.3,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ]
    });

    const raw = completion.choices?.[0]?.message?.content?.trim() || '';

    // Defensive parse: try direct JSON parse, otherwise extract first JSON array
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (_) {
      const match = raw.match(/\[[\s\S]*\]/);
      if (match) {
        parsed = JSON.parse(match[0]);
      }
    }

    if (!Array.isArray(parsed)) {
      return NextResponse.json({ error: 'Model did not return a JSON array', raw }, { status: 502 });
    }

    // Sanitize and coerce
    const chapters: ChapterDraft[] = (parsed as any[])
      .map((c) => ({
        title: String(c?.title || '').slice(0, 200).trim(),
        startTime: Number(c?.startTime),
        duration: c?.duration != null ? Number(c.duration) : undefined,
        description: c?.description != null ? String(c.description).slice(0, 500).trim() : undefined,
      }))
      .filter((c) => c.title && Number.isFinite(c.startTime) && c.startTime >= 0)
      .sort((a, b) => a.startTime - b.startTime);

    if (chapters.length === 0) {
      return NextResponse.json({ error: 'No valid chapters parsed', raw }, { status: 502 });
    }

    // Ensure strictly increasing start times
    for (let i = 1; i < chapters.length; i++) {
      if (chapters[i].startTime <= chapters[i - 1].startTime) {
        chapters[i].startTime = chapters[i - 1].startTime + 1;
      }
    }

    return NextResponse.json({ chapters }, { status: 200 });
  } catch (err) {
    console.error('[generate-chapters] Error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}


