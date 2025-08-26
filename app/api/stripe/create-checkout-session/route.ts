import { NextRequest, NextResponse } from 'next/server';
import { getStripeServerClient } from '@/lib/stripe/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripeServerClient();

    // Ensure we have a price id for the subscription
    const { priceId, trialDays } = await req.json().catch(() => ({ priceId: undefined, trialDays: undefined }));
    const defaultPriceId = process.env.NEXT_PUBLIC_STRIPE_TEST_PRICE_ID;
    const resolvedPriceId = priceId || defaultPriceId;
    if (!resolvedPriceId) {
      return NextResponse.json({ error: 'Missing Stripe price ID' }, { status: 400 });
    }

    // Auth: require session
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = data.session.user.id;
    const customerEmail = data.session.user.email || undefined;

    const origin = req.nextUrl.origin;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      allow_promotion_codes: true,
      payment_method_types: ['card'],
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
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
        },
      },
      metadata: {
        userId,
        app: 'CourseWebsite',
      },
    });

    return NextResponse.json({ id: session.id, url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error('Stripe session error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}


