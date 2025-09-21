import { NextRequest, NextResponse } from 'next/server';
import { getStripeServerClient } from '@/lib/stripe/server';
import { getBaseUrl } from '@/lib/utils/url';
import { createRouteHandlerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripe = getStripeServerClient();

    const customerEmail = user.email || undefined;
    if (!customerEmail) {
      return NextResponse.json({ error: 'Missing customer email' }, { status: 400 });
    }

    // Find existing Stripe customer by email (created during checkout), or create if missing
    const existing = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customerId = existing.data[0]?.id;
    if (!customerId) {
      const created = await stripe.customers.create({
        email: customerEmail,
        metadata: { userId: user.id, app: 'CourseWebsite' },
      });
      customerId = created.id;
    }

    const origin = getBaseUrl();
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/profile`,
    });

    return NextResponse.json({ url: portal.url }, { status: 200 });
  } catch (err: any) {
    console.error('Stripe billing portal error:', err);
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
