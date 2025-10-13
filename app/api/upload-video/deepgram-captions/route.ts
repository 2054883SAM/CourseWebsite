import { NextResponse } from 'next/server';
import { getDeepgramClient } from '@/lib/deepgram/client';
import { createRouteHandlerClient } from '@/lib/supabase/server';

/**
 * POST /api/upload-video/deepgram-captions
 * Accepts multipart/form-data only:
 * - { file: File (audio/video e.g. mp4/mov), format?: 'vtt'|'srt', language?: 'en'|'fr'|'es', courseId?: string, videoId?: string }
 * Returns: { captions: string, format: 'vtt' | 'srt' }
 */
export async function POST(req: Request) {
  try {
    console.log('[Deepgram Captions] Received request');
    const contentType = req.headers.get('content-type') || '';
    console.log('[Deepgram Captions] Content-Type:', contentType);
    const deepgram = getDeepgramClient();
    console.log(
      '[Deepgram Captions] Client created. API key present:',
      !!process.env.DEEPGRAM_API_KEY
    );

    let format: 'vtt' | 'srt' = 'vtt';
    let language: string | undefined;
    let courseId: string | undefined;
    let sectionId: string | undefined;
    let videoId: string | undefined;
    let dgResult: any | undefined;

    if (contentType.includes('application/json')) {
      // URL mode: accept a URL pointing to the media file to avoid large uploads
      const body = await req.json();
      const url = String(body.url || '').trim();
      const formatField = (body.format as string) || 'vtt';
      const langField = (body.language as string) || undefined;
      courseId = (body.courseId as string) || undefined;
      sectionId = (body.sectionId as string) || undefined;
      videoId = (body.videoId as string) || undefined;
      format = formatField === 'srt' ? 'srt' : 'vtt';
      language = langField;
      if (!url) {
        return NextResponse.json({ error: 'Missing url' }, { status: 400 });
      }
      const options: Record<string, any> = { smart_format: true, utterances: true };
      if (language && typeof language === 'string') options.language = language;
      console.log('[Deepgram Captions] TranscribeUrl options:', { ...options, url });
      const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(url, options);
      if (error) {
        console.error('[Deepgram Captions] transcribeUrl error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
      }
      dgResult = result;
      const uCount = (dgResult as any)?.results?.utterances?.length || 0;
      console.log('[Deepgram Captions] transcribeUrl success. utterances:', uCount);
    } else if (contentType.includes('multipart/form-data')) {
      console.log('[Deepgram Captions] Using multipart/form-data (file) mode');
      // File upload path
      const form = await req.formData();
      const file = form.get('file') as File | null;
      const formatField = (form.get('format') as string) || 'vtt';
      const langField = (form.get('language') as string) || undefined;
      courseId = (form.get('courseId') as string) || undefined;
      sectionId = (form.get('sectionId') as string) || undefined; // New parameter for section-specific storage
      videoId = (form.get('videoId') as string) || undefined;
      format = formatField === 'srt' ? 'srt' : 'vtt';
      language = langField;
      console.log('[Deepgram Captions] multipart inputs:', {
        hasFile: !!file,
        fileType: file?.type,
        fileSize: file ? `${file.size} bytes` : 'n/a',
        format,
        language,
        courseId,
        sectionId,
        videoId,
      });
      if (!file) {
        return NextResponse.json({ error: 'Missing file' }, { status: 400 });
      }
      // Accept common audio/video formats directly (Deepgram supports mp4 and others)
      const arrayBuffer = await file.arrayBuffer();
      const inputBuffer = Buffer.from(arrayBuffer);
      console.log(
        '[Deepgram Captions] Input buffer size:',
        inputBuffer.length,
        'type:',
        file.type,
        'name:',
        (file as any).name
      );

      const options: Record<string, any> = { smart_format: true, utterances: true };
      if (language && typeof language === 'string') options.language = language;
      console.log('[Deepgram Captions] TranscribeFile options:', options);
      const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
        inputBuffer,
        options
      );
      if (error) {
        console.error('[Deepgram Captions] transcribeFile error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
      }
      dgResult = result;
      const uCount = (dgResult as any)?.results?.utterances?.length || 0;
      console.log('[Deepgram Captions] transcribeFile success. utterances:', uCount);
    } else {
      console.warn(
        '[Deepgram Captions] Unsupported content-type. Expected application/json (url) or multipart/form-data (file).'
      );
      return NextResponse.json({ error: 'Unsupported content-type' }, { status: 400 });
    }

    // dgResult is set above; if not, something went wrong in branches

    console.log('[Deepgram Captions] Transcription received. Building captions as', format);
    const dg = await import('@deepgram/sdk');
    let captions: string | undefined;
    try {
      captions = format === 'vtt' ? dg.webvtt(dgResult) : dg.srt(dgResult);
    } catch (e) {
      console.warn(
        '[Deepgram Captions] Helper conversion failed, attempting fallback from utterances. Error:',
        e
      );
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
          captions =
            'WEBVTT\n\n' +
            utterances
              .map(
                (u: any) =>
                  `${toTime(u.start)} --> ${toTime(u.end)}\n${(u.transcript || '').trim()}\n`
              )
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
        console.error(
          '[Deepgram Captions] No utterances present in transcript. keys:',
          Object.keys((dgResult as any) || {})
        );
        return NextResponse.json(
          { error: 'Transcript missing utterances; cannot build captions.' },
          { status: 500 }
        );
      }
    }
    console.log('[Deepgram Captions] Captions length:', captions?.length);

    // If VTT and courseId provided, store file in Supabase Storage bucket 'translations'
    // Updated: store under section-level path only: <sectionId>/captions.vtt
    let storedPath: string | undefined;
    if (captions && format === 'vtt' && courseId) {
      try {
        const supabase = await createRouteHandlerClient();
        // New storage scheme: only use sectionId folder
        const filePath = sectionId ? `${sectionId}/captions.vtt` : undefined;
        if (!filePath) {
          console.warn(
            '[Deepgram Captions] Missing sectionId; cannot store section-scoped captions'
          );
        }
        const body = new Blob([captions], { type: 'text/vtt' });
        if (filePath) {
          const { error: uploadError } = await supabase.storage
            .from('translations')
            .upload(filePath, body, { upsert: true, contentType: 'text/vtt' });
          if (uploadError) {
            console.warn('[Deepgram Captions] Storage upload failed:', uploadError.message);
          } else {
            storedPath = filePath;
            console.log('[Deepgram Captions] Stored captions at', filePath);
          }
        }
      } catch (storageErr) {
        console.warn('[Deepgram Captions] Error storing captions to Supabase:', storageErr);
      }
    }

    // If we have a videoId and VTT captions (and a language), publish original to VdoCipher
    if (captions && format === 'vtt' && language && videoId) {
      try {
        const API_SECRET = process.env.VDO_API_SECRET;
        if (!API_SECRET) {
          console.error('[Deepgram Captions] Missing VDO_API_SECRET; skipping VdoCipher upload');
        } else {
          const fd = new FormData();
          const fileObj = new File([captions], 'captions.vtt', { type: 'text/vtt' });
          fd.append('file', fileObj);
          const url = `https://dev.vdocipher.com/api/videos/${encodeURIComponent(videoId)}/files?language=${encodeURIComponent(language)}`;
          console.log('[Deepgram Captions] Uploading original captions to VdoCipher', { url });
          const vdoRes = await fetch(url, {
            method: 'POST',
            headers: { Authorization: `Apisecret ${API_SECRET}` },
            body: fd,
          });
          if (!vdoRes.ok) {
            const txt = await vdoRes.text();
            console.warn('[Deepgram Captions] VdoCipher upload failed', vdoRes.status, txt);
          } else {
            console.log('[Deepgram Captions] VdoCipher upload success');
          }
        }
      } catch (vdoErr) {
        console.warn('[Deepgram Captions] Error uploading original captions to VdoCipher:', vdoErr);
      }
    }

    return NextResponse.json({ captions, format, storedPath }, { status: 200 });
  } catch (err) {
    console.error('[Deepgram Captions] Unexpected error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
      },
    }
  );
}
