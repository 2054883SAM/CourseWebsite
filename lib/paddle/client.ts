import { PaddleConfig } from './types';

// API Base URLs
const PADDLE_API_SANDBOX = 'https://sandbox-api.paddle.com';
const PADDLE_API_PRODUCTION = 'https://api.paddle.com';

// Validate required environment variables
export function ensurePaddleConfig(): void {
  const PADDLE_API_KEY = process.env.PADDLE_API_KEY;
  const PADDLE_SELLER_ID = process.env.NEXT_PUBLIC_PADDLE_SELLER_ID;
  const PADDLE_PUBLIC_KEY = process.env.NEXT_PUBLIC_PADDLE_PUBLIC_KEY;
  const PADDLE_WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET;

  if (!PADDLE_API_KEY) throw new Error('Missing env.PADDLE_API_KEY');
  if (!PADDLE_SELLER_ID) throw new Error('Missing env.NEXT_PUBLIC_PADDLE_SELLER_ID');
  if (!PADDLE_PUBLIC_KEY) throw new Error('Missing env.NEXT_PUBLIC_PADDLE_PUBLIC_KEY');
  if (!PADDLE_WEBHOOK_SECRET) throw new Error('Missing env.PADDLE_WEBHOOK_SECRET');
}

class PaddleClient {
  apiKey: string;
  sellerId: string;
  publicKey: string;
  webhookSecret: string;
  sandboxMode: boolean;
  baseUrl: string;

  constructor() {
    // Get environment variables
    this.apiKey = process.env.PADDLE_API_KEY || '';
    this.sellerId = process.env.NEXT_PUBLIC_PADDLE_SELLER_ID || '';
    this.publicKey = process.env.NEXT_PUBLIC_PADDLE_PUBLIC_KEY || '';
    this.webhookSecret = process.env.PADDLE_WEBHOOK_SECRET || '';

    // Check if sandbox mode is enabled
    this.sandboxMode = process.env.NEXT_PUBLIC_PADDLE_SANDBOX_MODE === 'true';

    // Set the base URL based on sandbox mode
    this.baseUrl = this.sandboxMode ? PADDLE_API_SANDBOX : PADDLE_API_PRODUCTION;

    // Validate configuration
    ensurePaddleConfig();
  }

  /**
   * Test the connection to Paddle API
   * Makes a request to get seller details to verify API credentials
   */
  async testConnection() {
    const url = `${this.baseUrl}/sellers/${this.sellerId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Paddle API request failed with status ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get subscription details by ID
   */
  async getSubscription(subscriptionId: string) {
    const url = `${this.baseUrl}/subscriptions/${subscriptionId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get subscription: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * List all products
   */
  async listProducts() {
    const url = `${this.baseUrl}/products`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to list products: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get client configuration for frontend use
   * This excludes sensitive data like API keys
   */
  getClientConfig() {
    return {
      sellerId: this.sellerId,
      publicKey: this.publicKey,
      sandboxMode: this.sandboxMode,
    };
  }
}

// Create and export a singleton instance
export const paddle = new PaddleClient();

/**
 * Helper method to use in frontend components to load Paddle.js
 */
export function loadPaddleJs() {
  if (typeof window !== 'undefined') {
    // Only run in browser environment
    const paddleScript = document.createElement('script');
    paddleScript.src = 'https://cdn.paddle.com/paddle/paddle.js';
    paddleScript.async = true;
    paddleScript.onload = () => {
      // Initialize Paddle with the seller ID
      // @ts-ignore - Paddle is loaded via script tag
      window.Paddle.Setup({
        seller: paddle.sellerId,
        environment: paddle.sandboxMode ? 'sandbox' : 'production',
      });
    };
    document.head.appendChild(paddleScript);
  }
}
