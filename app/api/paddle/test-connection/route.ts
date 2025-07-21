import { NextRequest, NextResponse } from 'next/server';
import { getPaddleClient } from '@/lib/paddle';

/**
 * API endpoint to test Paddle API connection
 * This endpoint is protected and only accessible by admins
 */
export async function GET(req: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // In a real implementation, verify the token and check admin role
    // For now, we'll use a simple check against environment variable
    if (token !== process.env.ADMIN_API_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the Paddle client and test connection
    const paddleClient = getPaddleClient();
    const result = await paddleClient.testConnection();

    // Return success response with vendor details
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error testing Paddle connection:', error);
    return NextResponse.json(
      { error: 'Failed to connect to Paddle API', message: (error as Error).message },
      { status: 500 }
    );
  }
}
