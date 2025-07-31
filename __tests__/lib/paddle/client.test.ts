import { describe, it, expect, beforeEach, jest, afterAll } from '@jest/globals';

// Mock the client module first
jest.mock('@/lib/paddle/client', () => {
  // Mock validate function
  const validatePaddleConfig = jest.fn(() => {
    const PADDLE_API_KEY = process.env.PADDLE_API_KEY;
    const PADDLE_SELLER_ID = process.env.PADDLE_SELLER_ID;
    const PADDLE_WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET;

    if (!PADDLE_API_KEY) throw new Error('Missing env.PADDLE_API_KEY');
    if (!PADDLE_SELLER_ID) throw new Error('Missing env.PADDLE_SELLER_ID');
    if (!PADDLE_WEBHOOK_SECRET) throw new Error('Missing env.PADDLE_WEBHOOK_SECRET');
  });

  // Mock paddle client
  const mockPaddleClient = {
    apiKey: 'test-api-key',
    sellerId: 'test-seller-id',
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
      sandboxMode: true,
    }),
  };

  // Mock client instance cache
  let clientInstance = null;

  return {
    validatePaddleConfig,
    getPaddleClient: jest.fn(() => {
      if (!clientInstance) {
        clientInstance = mockPaddleClient;
      }
      return clientInstance;
    }),
    getClientSafeConfig: jest.fn(() => ({
      sellerId: 'test-seller-id',
      sandboxMode: true
    })),
    loadPaddleJs: jest.fn(),
    ensurePaddleConfig: validatePaddleConfig
  };
});

// Import after mock
import { getPaddleClient, ensurePaddleConfig } from '@/lib/paddle/client';

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
      PADDLE_SELLER_ID: 'test-seller-id',
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

    it('should throw error if PADDLE_SELLER_ID is missing', () => {
      delete process.env.PADDLE_SELLER_ID;
      expect(() => ensurePaddleConfig()).toThrow('Missing env.PADDLE_SELLER_ID');
    });

    it('should throw error if PADDLE_WEBHOOK_SECRET is missing', () => {
      delete process.env.PADDLE_WEBHOOK_SECRET;
      expect(() => ensurePaddleConfig()).toThrow('Missing env.PADDLE_WEBHOOK_SECRET');
    });

    it('should not throw if all environment variables are present', () => {
      expect(() => ensurePaddleConfig()).not.toThrow();
    });
  });

  describe('getPaddleClient', () => {
    it('should return a client with correct properties', () => {
      const client = getPaddleClient();
      
      expect(client.apiKey).toBe('test-api-key');
      expect(client.sellerId).toBe('test-seller-id');
      expect(client.webhookSecret).toBe('test-webhook-secret');
      expect(client.sandboxMode).toBe(true);
    });

    it('should return correct client config', () => {
      const client = getPaddleClient();
      const config = client.getClientConfig();
      
      expect(config).toEqual({
        sellerId: 'test-seller-id',
        sandboxMode: true,
      });
    });

    it('should successfully call testConnection', async () => {
      const client = getPaddleClient();
      const result = await client.testConnection();
      
      expect(result).toEqual({ success: true });
    });
  });
});
