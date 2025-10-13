import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { getStripeServerClient } from '@/lib/stripe/server';
import { updateUserMembershipAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    // Auth: require validated user
    const supabase = await createRouteHandlerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch membership and customer ids
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('membership, customer_id, customer_id_dev')
      .eq('id', user.id)
      .single();
    if (dbError) {
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const effectiveCustomerId = isProduction
      ? (dbUser as any)?.customer_id
      : (dbUser as any)?.customer_id_dev;

    // Only check if currently marked as subscribed and we have a customer id
    if (!effectiveCustomerId) {
      const alreadyFree = (dbUser as any)?.membership === 'free';
      if (!alreadyFree) {
        await updateUserMembershipAdmin(user.id, 'free');
      }
      return NextResponse.json({ status: 'no_customer', updated: !alreadyFree });
    }

    const stripe = getStripeServerClient();
    const targetPriceId = isProduction
      ? process.env.STRIPE_PRICE_ID || process.env.STRIPE_TEST_PRICE_ID
      : process.env.STRIPE_TEST_PRICE_ID;

    if (!targetPriceId) {
      return NextResponse.json({ error: 'Missing Stripe price ID' }, { status: 500 });
    }

    // List subscriptions for this customer and find the one matching our price id
    const subs = await stripe.subscriptions.list({ customer: effectiveCustomerId, limit: 10 });

    const matching = subs.data.find((s) =>
      s.items.data.some((it) => it.price?.id === targetPriceId)
    );

    if (!matching) {
      // No matching subscription found; ensure membership is set to free
      const alreadyFree = (dbUser as any)?.membership === 'free';
      if (!alreadyFree) {
        await updateUserMembershipAdmin(user.id, 'free');
      }
      return NextResponse.json({ status: 'not_found', updated: !alreadyFree });
    }

    if (matching.status === 'canceled') {
      await updateUserMembershipAdmin(user.id, 'free');
      return NextResponse.json({ status: 'canceled', updated: true });
    }

    // Active (or other states) => no change
    return NextResponse.json({ status: matching.status, updated: false });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Failed to check membership' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
