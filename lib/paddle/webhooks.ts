import crypto from 'crypto';
import { getPaddleClient } from './client';
import { PaddleWebhookEvent, PaddleSubscriptionStatus } from './types';

/**
 * Verify webhook signature using Paddle's signing mechanism
 * @param payload - The raw webhook payload as JSON string
 * @param signature - The Paddle-Signature header value
 * @returns boolean indicating if signature is valid
 */
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  try {
    // Get Paddle client to access webhook secret
    const paddleClient = getPaddleClient();
    
    // Create HMAC using webhook secret
    const hmac = crypto.createHmac('sha256', paddleClient.webhookSecret);

    // Update HMAC with the payload
    hmac.update(payload);

    // Get the computed signature
    const computedSignature = hmac.digest('hex');

    // Compare signatures using a constant-time comparison
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computedSignature));
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Interface for database operations needed by the webhook processor
 */
interface DbOperations {
  enrollUser: (customerId: string, productId: string, subscriptionId: string) => Promise<void>;
  updateSubscriptionStatus: (subscriptionId: string, status: string) => Promise<void>;
  removeUserEnrollment: (customerId: string, productId: string) => Promise<void>;
}

/**
 * Process subscription related webhook events
 * @param webhookData - The parsed webhook payload
 * @param db - Database operations interface
 */
export async function processSubscriptionWebhook(
  webhookData: PaddleWebhookEvent,
  db: DbOperations
): Promise<void> {
  const { event_type, data } = webhookData;

  if (!data.subscription) {
    console.warn(`No subscription data in webhook event: ${event_type}`);
    return;
  }

  const { id: subscriptionId, status, customer_id, product_id } = data.subscription;

  switch (event_type) {
    case 'subscription.created':
      // Handle new subscription: enroll user and update status
      await db.enrollUser(customer_id, product_id, subscriptionId);
      await db.updateSubscriptionStatus(subscriptionId, status);
      console.log(
        `User ${customer_id} enrolled in product ${product_id} with subscription ${subscriptionId}`
      );
      break;

    case 'subscription.updated':
      // Handle subscription status updates
      await db.updateSubscriptionStatus(subscriptionId, status);
      console.log(`Subscription ${subscriptionId} updated to status: ${status}`);
      break;

    case 'subscription.canceled':
      // Handle cancellation: update status and remove enrollment
      await db.updateSubscriptionStatus(subscriptionId, status);
      await db.removeUserEnrollment(customer_id, product_id);
      console.log(`Subscription ${subscriptionId} canceled, enrollment removed`);
      break;

    case 'subscription.payment_succeeded':
      // Handle successful payment
      await db.updateSubscriptionStatus(subscriptionId, PaddleSubscriptionStatus.ACTIVE);
      console.log(`Payment succeeded for subscription ${subscriptionId}`);
      break;

    case 'subscription.payment_failed':
      // Handle payment failure
      await db.updateSubscriptionStatus(subscriptionId, PaddleSubscriptionStatus.PAST_DUE);
      console.log(`Payment failed for subscription ${subscriptionId}`);
      break;

    default:
      console.log(`Unhandled webhook event type: ${event_type}`);
  }
}
