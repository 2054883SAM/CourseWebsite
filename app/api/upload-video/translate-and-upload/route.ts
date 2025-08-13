import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { translateWebVtt } from '@/lib/deepl/client';

/**
 * POST /api/upload-video/translate-and-upload
 * Body: { courseId: number|string, videoId: string, sourceLanguage: 'fr'|'en'|'es' }
 * - Reads original VTT from Supabase storage bucket 'translations' at `${courseId}/captions.vtt`
 * - Translates to the two other languages using DeepL
 * - Uploads both translated files to VdoCipher via files API
 */
export async function POST(req: Request) {
  try {
    const { courseId, videoId, sourceLanguage } = await req.json();

    if (!courseId || !videoId || !sourceLanguage) {
      return NextResponse.json({ error: 'Missing courseId, videoId or sourceLanguage' }, { status: 400 });
    }

    const API_SECRET = process.env.VDO_API_SECRET;
    if (!API_SECRET) {
      return NextResponse.json({ error: 'VDO_API_SECRET not configured' }, { status: 500 });
    }

    const supabase = await createRouteHandlerClient();
    const path = `${courseId}/captions.vtt`;
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('translations')
      .download(path);
    if (downloadError || !downloadData) {
      return NextResponse.json({ error: `Unable to download original captions: ${downloadError?.message || 'unknown'}` }, { status: 404 });
    }
    const originalVtt = await downloadData.text();

    const allLangs: Array<'fr' | 'en' | 'es'> = ['fr', 'en', 'es'];
    const targets = allLangs.filter((l) => l !== sourceLanguage);

    const translatedMap: Record<string, string> = {};
    for (const lang of targets) {
      const translated = await translateWebVtt(originalVtt, sourceLanguage, lang);
      translatedMap[lang] = translated;
    }

    const results: any[] = [];
    for (const lang of targets) {
      const formData = new FormData();
      const file = new File([translatedMap[lang]], 'captions.vtt', { type: 'text/vtt' });
      formData.append('file', file);
      const url = `https://dev.vdocipher.com/api/videos/${encodeURIComponent(videoId)}/files?language=${encodeURIComponent(lang)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Apisecret ${API_SECRET}` },
        body: formData,
      });
      if (!res.ok) {
        const body = await res.text();
        return NextResponse.json({ error: `VdoCipher upload failed for ${lang}: ${res.status} ${body}` }, { status: 502 });
      }
      const json = await res.json();
      results.push({ lang, data: json });
    }

    return NextResponse.json({ success: true, uploaded: results }, { status: 200 });
  } catch (err) {
    console.error('[Translate and Upload] Unexpected error', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}


