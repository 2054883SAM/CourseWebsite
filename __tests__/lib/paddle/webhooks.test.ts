import { describe, it, expect, jest } from '@jest/globals';
import { verifyWebhookSignature, processSubscriptionWebhook } from '@/lib/paddle/webhooks';
import { paddle } from '@/lib/paddle/client';

// Mock crypto module
jest.mock('crypto', () => ({
  createHmac: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    digest: jest
      .fn()
      .mockReturnValue('e0241c6c40ebd61c736b78c838c36d8059f05e7d1b51c491dac9120377d93c6d'),
  }),
  timingSafeEqual: jest.fn().mockReturnValue(true),
}));

// Mock paddle client
jest.mock('@/lib/paddle/client', () => ({
  paddle: {
    webhookSecret: 'test-webhook-secret',
  },
}));

describe('Paddle Webhooks', () => {
  describe('verifyWebhookSignature', () => {
    it('should return true for valid signature', () => {
      // This is a pre-computed valid signature for test data and secret
      const validSignature = 'e0241c6c40ebd61c736b78c838c36d8059f05e7d1b51c491dac9120377d93c6d';
      const payload = JSON.stringify({ event_type: 'test', data: { foo: 'bar' } });

      expect(verifyWebhookSignature(payload, validSignature)).toBe(true);
    });

    it('should return false for invalid signature', () => {
      // Mock crypto for this test to return false
      const crypto = require('crypto');
      crypto.timingSafeEqual.mockReturnValueOnce(false);

      const invalidSignature = 'invalid-signature';
      const payload = JSON.stringify({ event_type: 'test', data: { foo: 'bar' } });

      expect(verifyWebhookSignature(payload, invalidSignature)).toBe(false);
    });
  });

  describe('processSubscriptionWebhook', () => {
    const mockDb = {
      enrollUser: jest.fn(),
      updateSubscriptionStatus: jest.fn(),
      removeUserEnrollment: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should process subscription_created events', async () => {
      const webhookData = {
        event_type: 'subscription.created',
        data: {
          subscription: {
            id: 'sub_123',
            status: 'active',
            customer_id: 'cus_123',
            product_id: 'prod_123',
          },
        },
      };

      await processSubscriptionWebhook(webhookData, mockDb);

      expect(mockDb.enrollUser).toHaveBeenCalledWith('cus_123', 'prod_123', 'sub_123');
      expect(mockDb.updateSubscriptionStatus).toHaveBeenCalledWith('sub_123', 'active');
    });

    it('should process subscription_updated events', async () => {
      const webhookData = {
        event_type: 'subscription.updated',
        data: {
          subscription: {
            id: 'sub_123',
            status: 'past_due',
            customer_id: 'cus_123',
            product_id: 'prod_123',
          },
        },
      };

      await processSubscriptionWebhook(webhookData, mockDb);

      expect(mockDb.updateSubscriptionStatus).toHaveBeenCalledWith('sub_123', 'past_due');
    });

    it('should process subscription_canceled events', async () => {
      const webhookData = {
        event_type: 'subscription.canceled',
        data: {
          subscription: {
            id: 'sub_123',
            status: 'canceled',
            customer_id: 'cus_123',
            product_id: 'prod_123',
          },
        },
      };

      await processSubscriptionWebhook(webhookData, mockDb);

      expect(mockDb.updateSubscriptionStatus).toHaveBeenCalledWith('sub_123', 'canceled');
      expect(mockDb.removeUserEnrollment).toHaveBeenCalledWith('cus_123', 'prod_123');
    });

    it('should handle unknown event types', async () => {
      const webhookData = {
        event_type: 'unknown_event',
        data: {},
      };

      await processSubscriptionWebhook(webhookData, mockDb);

      expect(mockDb.enrollUser).not.toHaveBeenCalled();
      expect(mockDb.updateSubscriptionStatus).not.toHaveBeenCalled();
      expect(mockDb.removeUserEnrollment).not.toHaveBeenCalled();
    });
  });
});
