import Stripe from 'stripe';

// Server-side singleton Stripe client (keyed by secret to avoid reusing the wrong instance)
let stripeSingleton: Stripe | null = null;
let stripeSingletonKey: string | null = null;

export function getStripeServerClient(): Stripe {
  const isProduction = process.env.NODE_ENV === 'production';
  const secretKey = isProduction
    ? process.env.STRIPE_SECRET_KEY
    : process.env.STRIPE_SECRET_KEY_TEST;
  if (!secretKey) {
    throw new Error(
      isProduction ? 'STRIPE_SECRET_KEY is not set' : 'STRIPE_SECRET_KEY_TEST is not set'
    );
  }

  if (!stripeSingleton || stripeSingletonKey !== secretKey) {
    // Use SDK default API version for compatibility
    stripeSingleton = new Stripe(secretKey);
    stripeSingletonKey = secretKey;
  }

  return stripeSingleton;
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  return secret;
}
