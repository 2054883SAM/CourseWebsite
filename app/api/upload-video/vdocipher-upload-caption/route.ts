import { NextResponse } from 'next/server';

/**
 * POST /api/upload-video/vdocipher-upload-caption
 * Body: { videoId: string, captions: string, language?: string }
 * Uploads a WebVTT (.vtt) caption string to VdoCipher.
 */
export async function POST(req: Request) {
  try {
    console.log('[VdoCipher Upload Caption] Received request');
    const { videoId, captions, language = 'en' } = await req.json();
    console.log('[VdoCipher Upload Caption] Inputs:', {
      videoId,
      hasCaptions: typeof captions === 'string' && captions.length > 0,
      captionsLength: typeof captions === 'string' ? captions.length : 0,
      language,
    });

    if (!videoId || typeof videoId !== 'string') {
      return NextResponse.json({ error: 'Missing videoId' }, { status: 400 });
    }
    if (!captions || typeof captions !== 'string') {
      return NextResponse.json({ error: 'Missing captions string' }, { status: 400 });
    }

    const API_SECRET = process.env.VDO_API_SECRET;
    if (!API_SECRET) {
      console.error('[VdoCipher Upload Caption] Missing VDO_API_SECRET');
      return NextResponse.json({ error: 'VDO_API_SECRET not configured' }, { status: 500 });
    }

    // Prepare multipart form-data with a .vtt file
    const formData = new FormData();
    const filename = 'captions.vtt';
    const file = new File([captions], filename, { type: 'text/vtt' });
    console.log('[VdoCipher Upload Caption] Built FormData file entry:', { filename, type: 'text/vtt' });
    formData.append('file', file);

    const url = `https://dev.vdocipher.com/api/videos/${videoId}/files?language=${encodeURIComponent(language)}`;
    console.log('[VdoCipher Upload Caption] POST', url);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Apisecret ${API_SECRET}`,
      },
      body: formData,
    });

    console.log('[VdoCipher Upload Caption] Response status:', response.status, response.statusText);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[VdoCipher Upload Caption] Error body:', errorText);
      return NextResponse.json({ error: `VdoCipher error: ${response.status} ${errorText}` }, { status: 502 });
    }

    const data = await response.json();
    console.log('[VdoCipher Upload Caption] Success body keys:', Object.keys(data || {}));
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    console.error('[VdoCipher Upload Caption] Unexpected error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS' } });
}


