import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripeServerClient, getStripeWebhookSecret } from '@/lib/stripe/server';
import { updateUserMembershipAdmin, updateUserCustomerIdAdmin } from '@/lib/supabase/admin';

// We use REST with service role to avoid cookie/session in webhook context
async function setUserMembership(userId: string, membership: 'free' | 'subscribed') {
  return updateUserMembershipAdmin(userId, membership);
}

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripeServerClient();
    const sig = req.headers.get('stripe-signature');
    if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

    const rawBody = await req.text();
    const secret = getStripeWebhookSecret();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, secret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err?.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle subscription lifecycle events
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = (session.metadata && (session.metadata as any).userId) || null;
      const customerId = (session.customer as string) || null;
      if (userId) {
        await setUserMembership(userId, 'subscribed');
        try {
          if (customerId) {
            await updateUserCustomerIdAdmin(userId, customerId);
          } else {
            // Fallback: attempt to find customer by email from session
            const emailFromSession =
              (session.customer_details && session.customer_details.email) || undefined;
            if (emailFromSession) {
              const stripe = getStripeServerClient();
              const found = await stripe.customers.list({ email: emailFromSession, limit: 1 });
              const fallbackCustomer = found.data?.[0]?.id;
              if (fallbackCustomer) {
                await updateUserCustomerIdAdmin(userId, fallbackCustomer);
              }
            }
          }
        } catch (e) {
          console.error('Failed to store customer_id on checkout.session.completed:', e);
        }
      }
    }

    if (
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.created'
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = (subscription.metadata && (subscription.metadata as any).userId) || null;
      const customerId = (subscription.customer as string) || null;
      // If metadata not present on subscription, try retrieving from latest invoice/checkout not covered here
      if (userId) {
        if (subscription.status === 'active' || subscription.status === 'trialing') {
          await setUserMembership(userId, 'subscribed');
        }
        if (
          subscription.status === 'canceled' ||
          subscription.status === 'unpaid' ||
          subscription.status === 'incomplete_expired' ||
          subscription.status === 'past_due'
        ) {
          // Optional: downgrade on non-active states except trialing/active
          // For now, only downgrade on canceled
          if (subscription.status === 'canceled') {
            await setUserMembership(userId, 'free');
          }
        }
        if (customerId) {
          try {
            await updateUserCustomerIdAdmin(userId, customerId);
          } catch (e) {
            console.error('Failed to store customer_id on subscription event:', e);
          }
        }
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = (subscription.metadata && (subscription.metadata as any).userId) || null;
      if (userId) {
        await setUserMembership(userId, 'free');
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Stripe webhook error:', err);
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
