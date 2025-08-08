import { NextRequest, NextResponse } from 'next/server';
import { getPaddleClient } from '@/lib/paddle/client';

// Static Paddle Billing product ID for courses
const COURSE_PRODUCT_ID = 'pro_01k1ecw6k8f776gn8krzt79km1' as const;

/**
 * Create a Paddle one-time price for a course and return the price ID.
 * Uses PADDLE_COURSE_PRODUCT_ID for the product relation.
 *
 * Body:
 * - amountCents: number | string (integer, cents)
 * - currency: string (ISO 4217, e.g., 'USD')
 * - courseTitle?: string (used for internal description/name)
 */
export async function POST(req: NextRequest) {
  try {
    const { amountCents, currency, courseTitle } = await req.json();

    if (!amountCents || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields: amountCents, currency' },
        { status: 400 }
      );
    }

    const productId = COURSE_PRODUCT_ID;

    // Get Paddle client for server-side credentials and base URL
    const paddle = getPaddleClient();

    // Prefer a server-side sandbox toggle; fallback to public var
    const isSandbox =
      process.env.PADDLE_SANDBOX_MODE === 'true' ||
      process.env.NEXT_PUBLIC_PADDLE_SANDBOX_MODE === 'true';
    const baseUrl = isSandbox ? 'https://sandbox-api.paddle.com' : paddle.baseUrl;
    console.log('Resolved Paddle baseUrl', baseUrl, 'isSandbox', isSandbox);

    // Preflight: verify the product is visible to this API key/environment
    try {
      console.log('paddle.baseUrl', paddle.baseUrl);
      console.log('productId', productId);
      const productResp = await fetch(`${baseUrl}/products/${productId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${paddle.apiKey}`,
        },
      });
      const productJson = await productResp.json().catch(() => ({}));
      if (!productResp.ok) {
        const requestId = productJson?.meta?.request_id;
        console.error('Paddle product fetch failed', { status: productResp.status, productJson, requestId });
        return NextResponse.json(
          {
            error:
              'Product is not accessible with current API key/environment. Verify PADDLE_COURSE_PRODUCT_ID matches the API environment and account.',
            requestId,
          },
          { status: 502 }
        );
      }
    } catch (e) {
      console.error('Paddle product fetch threw', e);
      return NextResponse.json(
        { error: 'Unable to verify Paddle product accessibility' },
        { status: 502 }
      );
    }

    const payload = {
      description: `Course price${courseTitle ? `: ${courseTitle}` : ''}`.slice(0, 200),
      name: 'One-time purchase',
      product_id: productId,
      unit_price: {
        amount: String(amountCents),
        currency_code: currency,
      },
      // Omit billing_cycle for one-time price
      tax_mode: 'account_setting',
    } as const;

    const response = await fetch(`${baseUrl}/prices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${paddle.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const json = await response.json();
    if (!response.ok) {
      const requestId = json?.meta?.request_id;
      const message = json?.error || `Paddle create price failed (${response.status})`;
      console.error('Paddle create price error:', { json, requestId, status: response.status });
      return NextResponse.json({ error: message, requestId }, { status: 502 });
    }

    const priceId = json?.data?.id;
    if (!priceId) {
      const requestId = json?.meta?.request_id;
      return NextResponse.json(
        { error: 'Missing price ID in Paddle response', requestId },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, priceId });
  } catch (error: any) {
    console.error('Error creating Paddle price:', error);
    return NextResponse.json(
      { error: error?.message || 'Unexpected error creating price' },
      { status: 500 }
    );
  }
}


