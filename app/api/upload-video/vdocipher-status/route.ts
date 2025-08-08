import { NextResponse } from 'next/server';

/**
 * API route to check VdoCipher video upload status
 * Step 3 of VdoCipher upload process
 */
export async function GET(req: Request) {
  console.log('📊 [VdoCipher Status] API route called');
  
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get('videoId');

    console.log('📊 [VdoCipher Status] Request data:', { videoId });

    if (!videoId) {
      console.log('❌ [VdoCipher Status] Missing videoId');
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    const API_SECRET = process.env.VDO_API_SECRET;

    if (!API_SECRET) {
      console.error('❌ [VdoCipher Status] VDO_API_SECRET environment variable is not set');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    console.log('📊 [VdoCipher Status] Checking video status from VdoCipher API...');

    // Check video status from VdoCipher API
    const vdoCipherUrl = `https://dev.vdocipher.com/api/videos/${videoId}`;
    console.log('📊 [VdoCipher Status] VdoCipher URL:', vdoCipherUrl);

    const apiResponse = await fetch(vdoCipherUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Apisecret ${API_SECRET}`,
      },
    });

    console.log('📊 [VdoCipher Status] VdoCipher API response status:', apiResponse.status);

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('❌ [VdoCipher Status] VdoCipher API error:', apiResponse.status, errorText);
      throw new Error(`VdoCipher API error: ${apiResponse.status} ${apiResponse.statusText}`);
    }

    const videoData = await apiResponse.json();
    const statusRaw = videoData.status ?? '';
    const statusNormalized = String(statusRaw).toLowerCase();
    console.log('📊 [VdoCipher Status] VdoCipher API response:', {
      id: videoData.id,
      title: videoData.title,
      status: statusRaw,
      duration: videoData.length,
      uploadTime: videoData.uploadTime,
      hasPostImage: !!videoData.poster
    });

    // Treat 'VideoReady', 'Ready', and 'ready' (any casing) as ready
    const isReady = statusNormalized === 'videoready' || statusNormalized === 'ready';
    console.log('📊 [VdoCipher Status] Video ready status:', isReady);
    
    // Return video status and details
    return NextResponse.json({
      videoId: videoData.id,
      title: videoData.title,
      status: videoData.status,
      duration: videoData.length,
      uploadTime: videoData.uploadTime,
      posterImage: videoData.poster,
      // Check if video is ready for playback
      isReady,
    }, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('❌ [VdoCipher Status] Error checking video status:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
