import Stripe from 'stripe';

// Server-side singleton Stripe client
let stripeSingleton: Stripe | null = null;

export function getStripeServerClient(): Stripe {
  const isProduction = process.env.NODE_ENV === 'production';
  console.log(isProduction);
  const secretKey = isProduction
    ? process.env.STRIPE_SECRET_KEY
    : process.env.STRIPE_SECRET_KEY_TEST;
  if (!secretKey) {
    throw new Error(
      isProduction ? 'STRIPE_SECRET_KEY is not set' : 'STRIPE_SECRET_KEY_TEST is not set'
    );
  }

  if (!stripeSingleton) {
    // Use SDK default API version for compatibility
    stripeSingleton = new Stripe(secretKey);
  }

  return stripeSingleton;
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  return secret;
}
