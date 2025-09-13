import Stripe from 'stripe';

// Server-side singleton Stripe client
let stripeSingleton: Stripe | null = null;

export function getStripeServerClient(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }

  if (!stripeSingleton) {
    // Use SDK default API version for compatibility
    stripeSingleton = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  return stripeSingleton;
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  return secret;
}
