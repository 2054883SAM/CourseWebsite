import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { getPaddleClient } from '@/lib/paddle/client';

// PATCH /api/paddle/prices/[priceId]
// Body (subset of Paddle update price): { unit_price: { amount: string, currency_code: string }, ... }
export async function PATCH(req: NextRequest, context: { params: { priceId: string } }) {
  try {
    const supabase = await createRouteHandlerClient();

    // AuthN
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // AuthZ: admin only
    const { data: dbUser, error: dbErr } = await supabase
      .from('users')
      .select('role')
      .eq('id', authData.user.id)
      .single();
    if (dbErr || !dbUser || dbUser.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { priceId } = context.params;
    if (!priceId) {
      return NextResponse.json({ error: 'Missing priceId' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    }

    const paddle = getPaddleClient();
    const isSandbox =
      process.env.PADDLE_SANDBOX_MODE === 'true' ||
      process.env.NEXT_PUBLIC_PADDLE_SANDBOX_MODE === 'true';
    const baseUrl = isSandbox ? 'https://sandbox-api.paddle.com' : paddle.baseUrl;

    const response = await fetch(`${baseUrl}/prices/${priceId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${paddle.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      const requestId = json?.meta?.request_id;
      console.error('Paddle Update Price failed', { status: response.status, json, requestId });
      return NextResponse.json(
        { error: json?.error || 'Failed to update Paddle price', requestId },
        { status: response.status || 502 }
      );
    }

    return NextResponse.json({ success: true, data: json?.data || json });
  } catch (e) {
    console.error('Unexpected error updating Paddle price:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


