import { NextResponse } from 'next/server';

// Authentication handling for VdoCipher OTP API
export async function POST(req: Request) {
  try {
    const { videoId } = await req.json();

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    const API_SECRET = process.env.VDO_API_SECRET;

    if (!API_SECRET) {
      console.error('VDO_API_SECRET environment variable is not set');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    // We'll specify the TTL directly in the request body
    // The video ID is now part of the URL

    // No need for HMAC signature with this API endpoint

    // Get OTP from VdoCipher API
    const apiResponse = await fetch(`https://dev.vdocipher.com/api/videos/${videoId}/otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Apisecret ${API_SECRET}`,
      },
      body: JSON.stringify({
        ttl: 3600, // 1 hour validity
      }),
    });

    if (!apiResponse.ok) {
      throw new Error(`VdoCipher API error: ${apiResponse.status} ${apiResponse.statusText}`);
    }

    const data = await apiResponse.json();
    
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', 
      },
    });
  } catch (error) {
    console.error('Error generating VdoCipher OTP:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}