import { NextRequest, NextResponse } from 'next/server';
import { getStripeServerClient } from '@/lib/stripe/server';
import { getBaseUrl } from '@/lib/utils/url';
import { createRouteHandlerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripeServerClient();

    // Ensure we have a price id for the subscription and optionally a courseId to return to
    const { priceId, trialDays, courseId } = await req
      .json()
      .catch(() => ({ priceId: undefined, trialDays: undefined, courseId: undefined }));
    const defaultPriceId = process.env.STRIPE_TEST_PRICE_ID;
    const resolvedPriceId = priceId || defaultPriceId;
    if (!resolvedPriceId) {
      return NextResponse.json({ error: 'Missing Stripe price ID' }, { status: 400 });
    }

    // Auth: require validated user
    const supabase = await createRouteHandlerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;
    const customerEmail = user.email || undefined;

    // Build absolute URLs based on environment; in production uses URL_LINK
    const origin = getBaseUrl();

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      allow_promotion_codes: true,
      payment_method_types: ['card'],
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}${courseId ? `&courseId=${encodeURIComponent(courseId)}` : ''}`,
      cancel_url: `${origin}/payment/cancel`,
      customer_email: customerEmail,
      line_items: [
        {
          price: resolvedPriceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: trialDays ? Number(trialDays) || undefined : undefined,
        metadata: {
          userId,
          ...(courseId ? { courseId } : {}),
        },
      },
      metadata: {
        userId,
        app: 'CourseWebsite',
        ...(courseId ? { courseId } : {}),
      },
    });

    return NextResponse.json({ id: session.id, url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error('Stripe session error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
