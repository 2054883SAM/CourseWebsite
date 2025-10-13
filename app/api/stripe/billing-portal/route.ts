import { NextRequest, NextResponse } from 'next/server';
import { getStripeServerClient } from '@/lib/stripe/server';
import { getBaseUrl } from '@/lib/utils/url';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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

    const customerEmail = user.email || undefined;
    let customerId: string | undefined;

    // Prefer customer lookup by metadata userId if available (more reliable than email)
    const search = await stripe.customers
      .search({
        // Escapes handled by Stripe; using metadata filter for exact match
        query: `metadata['userId']:'${user.id}'`,
        limit: 1,
      })
      .catch(() => null);
    if (search && search.data[0]?.id) {
      customerId = search.data[0].id;
    }
    // Fallback to email search if no metadata match and email exists
    if (!customerId && customerEmail) {
      const existing = await stripe.customers.list({ email: customerEmail, limit: 1 });
      customerId = existing.data[0]?.id;
    }
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
