import { NextResponse } from 'next/server';

/**
 * API route to obtain VdoCipher upload credentials
 * Step 1 of VdoCipher upload process
 */
export async function PUT(req: Request) {
  console.log('🔑 [VdoCipher Credentials] API route called');
  
  try {
    const { title, folderId = 'root' } = await req.json();
    console.log('🔑 [VdoCipher Credentials] Request data:', { title, folderId });

    if (!title) {
      console.log('❌ [VdoCipher Credentials] Missing title');
      return NextResponse.json(
        { error: 'Video title is required' },
        { status: 400 }
      );
    }

    const API_SECRET = process.env.VDO_API_SECRET;

    if (!API_SECRET) {
      console.error('❌ [VdoCipher Credentials] VDO_API_SECRET environment variable is not set');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    console.log('🔑 [VdoCipher Credentials] API secret found, making request to VdoCipher...');

    // Step 1: Obtain upload credentials from VdoCipher API
    const vdoCipherUrl = `https://dev.vdocipher.com/api/videos?title=${encodeURIComponent(title)}&folderId=${folderId}`;
    console.log('🔑 [VdoCipher Credentials] VdoCipher URL:', vdoCipherUrl);

    const apiResponse = await fetch(vdoCipherUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Apisecret ${API_SECRET}`,
      },
    });

    console.log('🔑 [VdoCipher Credentials] VdoCipher API response status:', apiResponse.status);

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('❌ [VdoCipher Credentials] VdoCipher API error:', apiResponse.status, errorText);
      throw new Error(`VdoCipher API error: ${apiResponse.status} ${apiResponse.statusText}`);
    }

    const data = await apiResponse.json();
    console.log('✅ [VdoCipher Credentials] VdoCipher API success:', {
      hasClientPayload: !!data.clientPayload,
      videoId: data.videoId,
      uploadLink: data.clientPayload?.uploadLink
    });
    
    // Return the upload credentials and video ID
    return NextResponse.json({
      clientPayload: data.clientPayload,
      videoId: data.videoId,
    }, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('❌ [VdoCipher Credentials] Error obtaining upload credentials:', error);
    
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
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
