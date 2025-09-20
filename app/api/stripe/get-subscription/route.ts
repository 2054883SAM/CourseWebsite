import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { getStripeServerClient } from '@/lib/stripe/server';

export async function GET(req: NextRequest) {
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

    // Vérifier le statut membership dans la base de données
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('membership')
      .eq('id', user.id)
      .single();

    if (dbError) {
      console.error('Error fetching user membership:', dbError);
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }

    // Si l'utilisateur n'est pas marqué comme abonné, retourner null
    if (dbUser?.membership !== 'subscribed') {
      return NextResponse.json({ priceId: null, status: 'not_subscribed' });
    }

    // Récupérer les abonnements Stripe de l'utilisateur
    const stripe = getStripeServerClient();

    // Récupérer le customer Stripe de l'utilisateur
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return NextResponse.json({ priceId: null, status: 'no_customer' });
    }

    const customer = customers.data[0];

    // Récupérer les abonnements actifs du customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ priceId: null, status: 'no_active_subscription' });
    }

    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0]?.price?.id;
    // Handle Stripe API/SDK type variations for period end
    const currentPeriodEnd =
      (subscription as any).current_period_end ??
      (subscription as any).current_period_ends_at ??
      null;

    return NextResponse.json({
      priceId,
      status: 'active',
      subscriptionId: subscription.id,
      currentPeriodEnd,
    });
  } catch (err: any) {
    console.error('Error fetching subscription:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
