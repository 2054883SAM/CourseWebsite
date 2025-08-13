import { NextResponse } from 'next/server';
import { getDeepgramClient } from '@/lib/deepgram/client';
// Server now requires MP3 input. Client converts video → mp3 before calling this route.

/**
 * POST /api/upload-video/deepgram-captions
 * Accepts multipart/form-data only:
 * - { file: File (audio/mp3), format?: 'vtt'|'srt', language?: 'en'|'fr'|'es' }
 * Returns: { captions: string, format: 'vtt' | 'srt' }
 */
export async function POST(req: Request) {
  try {
    console.log('[Deepgram Captions] Received request');
    const contentType = req.headers.get('content-type') || '';
    console.log('[Deepgram Captions] Content-Type:', contentType);
    const deepgram = getDeepgramClient();
    console.log('[Deepgram Captions] Client created. API key present:', !!process.env.DEEPGRAM_API_KEY);

    let format: 'vtt' | 'srt' = 'vtt';
    let language: string | undefined;
    let dgResult: any | undefined;

    if (!contentType.includes('multipart/form-data')) {
      console.warn('[Deepgram Captions] Unsupported content-type. Expected multipart/form-data with file.');
      return NextResponse.json({ error: 'Use multipart/form-data with file' }, { status: 400 });
    }

    console.log('[Deepgram Captions] Using multipart/form-data (file) mode');
    // File upload path
    const form = await req.formData();
    const file = form.get('file') as File | null;
    const formatField = (form.get('format') as string) || 'vtt';
    const langField = (form.get('language') as string) || undefined;
    format = (formatField === 'srt' ? 'srt' : 'vtt');
    language = langField;
    console.log('[Deepgram Captions] multipart inputs:', {
      hasFile: !!file,
      fileType: file?.type,
      fileSize: file ? `${file.size} bytes` : 'n/a',
      format,
      language,
    });
    if (!file) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }
    // Accept common audio/video formats directly (Deepgram supports mp4 and others)
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);
    console.log('[Deepgram Captions] Input buffer size:', inputBuffer.length, 'type:', file.type, 'name:', (file as any).name);

    const options: Record<string, any> = { smart_format: true, utterances: true };
    if (language && typeof language === 'string') options.language = language;
    console.log('[Deepgram Captions] TranscribeFile options:', options);
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(inputBuffer, options);
    if (error) {
      console.error('[Deepgram Captions] transcribeFile error:', error);
      return NextResponse.json({ error: String(error) }, { status: 500 });
    }
    dgResult = result;
    const uCount = (dgResult as any)?.results?.utterances?.length || 0;
    console.log('[Deepgram Captions] transcribeFile success. utterances:', uCount);

    // dgResult is set above; if not, something went wrong in branches

    console.log('[Deepgram Captions] Transcription received. Building captions as', format);
    const dg = await import('@deepgram/sdk');
    let captions: string | undefined;
    try {
      captions = format === 'vtt' ? dg.webvtt(dgResult) : dg.srt(dgResult);
    } catch (e) {
      console.warn('[Deepgram Captions] Helper conversion failed, attempting fallback from utterances. Error:', e);
      // Fallback: build captions from utterances if available
      const utterances = (dgResult as any)?.results?.utterances;
      if (Array.isArray(utterances) && utterances.length > 0) {
        const toTime = (secs: number) => {
          const totalMs = Math.max(0, Math.floor(secs * 1000));
          const hours = Math.floor(totalMs / 3600000);
          const minutes = Math.floor((totalMs % 3600000) / 60000);
          const seconds = Math.floor((totalMs % 60000) / 1000);
          const ms = totalMs % 1000;
          const pad = (n: number, w = 2) => String(n).padStart(w, '0');
          return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${String(ms).padStart(3, '0')}`;
        };
        if (format === 'vtt') {
          captions = 'WEBVTT\n\n' + utterances
            .map((u: any) => `${toTime(u.start)} --> ${toTime(u.end)}\n${(u.transcript || '').trim()}\n`)
            .join('\n');
        } else {
          // SRT fallback
          captions = utterances
            .map((u: any, i: number) => {
              const toSrtTime = (secs: number) => toTime(secs).replace('.', ',');
              return `${i + 1}\n${toSrtTime(u.start)} --> ${toSrtTime(u.end)}\n${(u.transcript || '').trim()}\n`;
            })
            .join('\n');
        }
      } else {
        console.error('[Deepgram Captions] No utterances present in transcript. keys:', Object.keys((dgResult as any) || {}));
        return NextResponse.json({ error: 'Transcript missing utterances; cannot build captions.' }, { status: 500 });
      }
    }
    console.log('[Deepgram Captions] Captions length:', captions?.length);

    return NextResponse.json({ captions, format }, { status: 200 });
  } catch (err) {
    console.error('[Deepgram Captions] Unexpected error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS' } });
}


