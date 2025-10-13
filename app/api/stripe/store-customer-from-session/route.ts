import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { getStripeServerClient } from '@/lib/stripe/server';
import { updateUserCustomerIdAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json().catch(() => ({ sessionId: undefined }));
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
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

    const stripe = getStripeServerClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Try to get customer id directly, otherwise fallback by email
    let customerId = (session.customer as string) || null;
    if (!customerId) {
      const emailFromSession =
        (session.customer_details && session.customer_details.email) || undefined;
      if (emailFromSession) {
        const found = await stripe.customers.list({ email: emailFromSession, limit: 1 });
        customerId = found.data?.[0]?.id || null;
      }
    }

    if (!customerId) {
      return NextResponse.json({ error: 'Customer not found for session' }, { status: 404 });
    }

    // Persist to users.customer_id (prod) or users.customer_id_dev (dev) using admin service role
    await updateUserCustomerIdAdmin(user.id, customerId);

    return NextResponse.json({ success: true, customerId });
  } catch (e: any) {
    console.error('store-customer-from-session error:', e);
    return NextResponse.json(
      { error: e?.message || 'Failed to store customer id from session' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
