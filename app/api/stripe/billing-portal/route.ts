import { NextRequest, NextResponse } from 'next/server';
import { getStripeServerClient } from '@/lib/stripe/server';
import { getBaseUrl } from '@/lib/utils/url';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { updateUserCustomerIdAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignore if called from a server component context
          }
        },
      },
    });
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripe = getStripeServerClient();

    // Use stored customer_id when available; otherwise, find or create and persist
    const customerEmail = user.email || undefined;
    let customerId: string | undefined;

    // Fetch current user's stored customer id (env-aware)
    const { data: userRow } = await supabase
      .from('users')
      .select('customer_id, customer_id_dev')
      .eq('id', user.id)
      .single();
    const isProduction = process.env.NODE_ENV === 'production';
    customerId = isProduction
      ? (userRow as any)?.customer_id || undefined
      : (userRow as any)?.customer_id_dev || undefined;

    // If we have a stored customer_id, validate it exists in Stripe
    if (customerId) {
      try {
        await stripe.customers.retrieve(customerId);
      } catch {
        // If invalid/missing on Stripe, reset to recreate
        customerId = undefined;
      }
    }

    // If not present, try to find by metadata userId first
    if (!customerId) {
      const search = await stripe.customers
        .search({ query: `metadata['userId']:'${user.id}'`, limit: 1 })
        .catch(() => null);
      if (search && search.data[0]?.id) {
        customerId = search.data[0].id;
      }
    }

    // If still not found, create a new customer, then persist customer_id
    if (!customerId) {
      const created = await stripe.customers.create({
        email: customerEmail,
        metadata: { userId: user.id, app: 'CourseWebsite' },
      });
      customerId = created.id;
    }

    // Ensure users.customer_id is synced
    try {
      if (customerId) {
        await updateUserCustomerIdAdmin(user.id, customerId);
      }
    } catch (e) {
      // Non-fatal: log and continue
      console.error('Failed to sync customer_id to users:', e);
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
