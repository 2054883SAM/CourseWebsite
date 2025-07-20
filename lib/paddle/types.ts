/**
 * Paddle API Types
 * Based on Paddle V2 Billing API: https://developer.paddle.com/api-reference/overview
 */

// Paddle Subscription Status Types
export enum PaddleSubscriptionStatus {
  ACTIVE = 'active',
  TRIALING = 'trialing',
  PAST_DUE = 'past_due',
  PAUSED = 'paused',
  CANCELED = 'canceled',
}

// Webhook event types
export type PaddleWebhookEventType =
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.canceled'
  | 'subscription.activated'
  | 'subscription.payment_succeeded'
  | 'subscription.payment_failed';

// Subscription interfaces
export interface PaddlePrice {
  id: string;
  unit_price: {
    amount: string;
    currency_code: string;
  };
}

export interface PaddleSubscription {
  id: string;
  status: string;
  customer_id: string;
  product_id: string;
  create_time: string;
  update_time: string;
  next_billed_at?: string;
  price?: PaddlePrice;
}

export interface PaddleWebhookEvent {
  event_type: PaddleWebhookEventType;
  data: {
    subscription?: PaddleSubscription;
    [key: string]: any;
  };
}

// Basic validation function to ensure a subscription object has required fields
export function validatePaddleSubscription(subscription: any): boolean {
  if (!subscription) return false;

  const requiredFields = [
    'id',
    'status',
    'customer_id',
    'product_id',
    'create_time',
    'update_time',
  ];

  // Check if all required fields exist
  for (const field of requiredFields) {
    if (!subscription[field]) {
      return false;
    }
  }

  // Check if status is valid
  const validStatuses = Object.values(PaddleSubscriptionStatus);
  if (!validStatuses.includes(subscription.status)) {
    return false;
  }

  return true;
}

// Client configuration interface
export interface PaddleConfig {
  apiKey: string;
  vendorId: string;
  publicKey: string;
  webhookSecret: string;
  sandboxMode: boolean;
}
