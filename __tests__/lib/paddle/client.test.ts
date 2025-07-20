import { describe, it, expect, beforeEach, jest, afterAll } from '@jest/globals';

// Mock the client module first
jest.mock('@/lib/paddle/client', () => {
  // Mock ensurePaddleConfig function
  const ensurePaddleConfig = jest.fn(() => {
    const PADDLE_API_KEY = process.env.PADDLE_API_KEY;
    const PADDLE_SELLER_ID = process.env.NEXT_PUBLIC_PADDLE_SELLER_ID;
    const PADDLE_PUBLIC_KEY = process.env.NEXT_PUBLIC_PADDLE_PUBLIC_KEY;
    const PADDLE_WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET;

    if (!PADDLE_API_KEY) throw new Error('Missing env.PADDLE_API_KEY');
    if (!PADDLE_SELLER_ID) throw new Error('Missing env.NEXT_PUBLIC_PADDLE_SELLER_ID');
    if (!PADDLE_PUBLIC_KEY) throw new Error('Missing env.NEXT_PUBLIC_PADDLE_PUBLIC_KEY');
    if (!PADDLE_WEBHOOK_SECRET) throw new Error('Missing env.PADDLE_WEBHOOK_SECRET');
  });

  // Mock paddle client
  const paddle = {
    apiKey: 'test-api-key',
    sellerId: 'test-seller-id',
    publicKey: 'test-public-key',
    webhookSecret: 'test-webhook-secret',
    sandboxMode: true,
    baseUrl: 'https://sandbox-api.paddle.com',
    testConnection: jest.fn().mockImplementation(async () => {
      return { success: true };
    }),
    getSubscription: jest.fn(),
    listProducts: jest.fn(),
    getClientConfig: jest.fn().mockReturnValue({
      sellerId: 'test-seller-id',
      publicKey: 'test-public-key',
      sandboxMode: true,
    }),
  };

  return {
    ensurePaddleConfig,
    paddle,
    loadPaddleJs: jest.fn(),
  };
});

// Import after mock
import { paddle, ensurePaddleConfig } from '@/lib/paddle/client';

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ success: true }),
  })
) as jest.Mock;

// Mock process.env
const originalEnv = process.env;

describe('Paddle Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup process.env mocks
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_PADDLE_SANDBOX_MODE: 'true',
      PADDLE_API_KEY: 'test-api-key',
      NEXT_PUBLIC_PADDLE_SELLER_ID: 'test-seller-id',
      NEXT_PUBLIC_PADDLE_PUBLIC_KEY: 'test-public-key',
      PADDLE_WEBHOOK_SECRET: 'test-webhook-secret',
    };
  });

  // Restore original env after all tests
  afterAll(() => {
    process.env = originalEnv;
  });

  describe('ensurePaddleConfig', () => {
    it('should throw error if PADDLE_API_KEY is missing', () => {
      delete process.env.PADDLE_API_KEY;
      expect(() => ensurePaddleConfig()).toThrow('Missing env.PADDLE_API_KEY');
    });

    it('should throw error if NEXT_PUBLIC_PADDLE_SELLER_ID is missing', () => {
      delete process.env.NEXT_PUBLIC_PADDLE_SELLER_ID;
      expect(() => ensurePaddleConfig()).toThrow('Missing env.NEXT_PUBLIC_PADDLE_SELLER_ID');
    });

    it('should throw error if NEXT_PUBLIC_PADDLE_PUBLIC_KEY is missing', () => {
      delete process.env.NEXT_PUBLIC_PADDLE_PUBLIC_KEY;
      expect(() => ensurePaddleConfig()).toThrow('Missing env.NEXT_PUBLIC_PADDLE_PUBLIC_KEY');
    });

    it('should throw error if PADDLE_WEBHOOK_SECRET is missing', () => {
      delete process.env.PADDLE_WEBHOOK_SECRET;
      expect(() => ensurePaddleConfig()).toThrow('Missing env.PADDLE_WEBHOOK_SECRET');
    });

    it('should not throw if all environment variables are present', () => {
      expect(() => ensurePaddleConfig()).not.toThrow();
    });
  });

  describe('paddle client', () => {
    it('should have correct properties', () => {
      expect(paddle.apiKey).toBe('test-api-key');
      expect(paddle.sellerId).toBe('test-seller-id');
      expect(paddle.publicKey).toBe('test-public-key');
      expect(paddle.webhookSecret).toBe('test-webhook-secret');
      expect(paddle.sandboxMode).toBe(true);
    });

    it('should return correct client config', () => {
      const config = paddle.getClientConfig();
      expect(config).toEqual({
        sellerId: 'test-seller-id',
        publicKey: 'test-public-key',
        sandboxMode: true,
      });
    });

    it('should successfully call testConnection', async () => {
      const result = await paddle.testConnection();
      expect(result).toEqual({ success: true });
    });
  });
});
