import { PaddleConfig } from './types';
import dotenv from 'dotenv';
dotenv.config();

// API Base URLs
const PADDLE_API_SANDBOX = 'https://sandbox-api.paddle.com';
const PADDLE_API_PRODUCTION = 'https://api.paddle.com';

// Moved to inside the getPaddleClient function
// No more top-level environment variable access
class PaddleClient {
  apiKey: string;
  sellerId: string;
  webhookSecret: string;
  sandboxMode: boolean;
  baseUrl: string;

  constructor() {
    // Get environment variables
    this.apiKey = process.env.NEXT_PUBLIC_PADDLE_API_KEY || '';
    this.sellerId = process.env.NEXT_PUBLIC_PADDLE_SELLER_ID || '';
    this.webhookSecret = process.env.NEXT_PUBLIC_PADDLE_WEBHOOK_SECRET || '';

    // Check if sandbox mode is enabled
    this.sandboxMode = process.env.NEXT_PUBLIC_PADDLE_SANDBOX_MODE === 'true';

    // Set the base URL based on sandbox mode
    this.baseUrl = this.sandboxMode ? PADDLE_API_SANDBOX : PADDLE_API_PRODUCTION;
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
      sandboxMode: this.sandboxMode,
    };
  }
}

// Create a cache for the singleton instance
let paddleClientInstance: PaddleClient | null = null;

// Validate required environment variables only when actually used
function validatePaddleConfig(): void {
  const PADDLE_API_KEY = process.env.NEXT_PUBLIC_PADDLE_API_KEY;
  const PADDLE_SELLER_ID = process.env.NEXT_PUBLIC_PADDLE_SELLER_ID;
  const PADDLE_WEBHOOK_SECRET = process.env.NEXT_PUBLIC_PADDLE_WEBHOOK_SECRET;

  if (!PADDLE_API_KEY) throw new Error('Missing env.NEXT_PUBLIC_PADDLE_API_KEY');
  if (!PADDLE_SELLER_ID) throw new Error('Missing env.NEXT_PUBLIC_PADDLE_SELLER_ID');
  if (!PADDLE_WEBHOOK_SECRET) throw new Error('Missing env.NEXT_PUBLIC_PADDLE_WEBHOOK_SECRET');
}

/**
 * Server-only function to get the Paddle client
 * Only instantiates the client when needed
 */
export function getPaddleClient(): PaddleClient {
  // We can now use this on client-side since we're using NEXT_PUBLIC vars
  // Remove the client-side check since we're explicitly using public env vars
  
  if (!paddleClientInstance) {
    // Validate config before instantiating
    validatePaddleConfig();
    paddleClientInstance = new PaddleClient();
  }
  
  return paddleClientInstance;
}

/**
 * Get client-safe configuration for Paddle
 * Only returns public environment variables safe for client use
 */
export function getClientSafeConfig() {
  return {
    sellerId: process.env.NEXT_PUBLIC_PADDLE_SELLER_ID || '',
    sandboxMode: process.env.NEXT_PUBLIC_PADDLE_SANDBOX_MODE === 'true',
    clientToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '',
  };
}

/**
 * Helper method to use in frontend components to load Paddle.js
 */
export function loadPaddleJs() {
  if (typeof window !== 'undefined') {
    // Get the client-safe config
    const config = getClientSafeConfig();
    
    // Debug: Log environment variables
    console.log('Paddle environment variables:');
    console.log('- NEXT_PUBLIC_PADDLE_SELLER_ID:', process.env.NEXT_PUBLIC_PADDLE_SELLER_ID);
    console.log('- NEXT_PUBLIC_PADDLE_SANDBOX_MODE:', process.env.NEXT_PUBLIC_PADDLE_SANDBOX_MODE);
    console.log('- NEXT_PUBLIC_PADDLE_CLIENT_TOKEN exists:', !!process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN);
    
    // Only run in browser environment
    const paddleScript = document.createElement('script');
    paddleScript.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    paddleScript.async = true;
    paddleScript.onload = () => {
      console.log('Paddle.js loaded successfully');
      // Initialize Paddle
      if (window.Paddle) {
        try {
          if (config.sandboxMode) {
            console.log('Setting Paddle environment to sandbox');
            window.Paddle.Environment.set('sandbox');
          }
          
          // Use the new Paddle.Initialize() method for Paddle V2
          console.log('Config values:', { 
            sellerId: config.sellerId, 
            hasClientToken: !!config.clientToken,
            sandboxMode: config.sandboxMode
          });
          
          // Make sure we have a valid seller ID or token
          if (!config.clientToken && !config.sellerId) {
            console.error('Missing both client token and seller ID. At least one is required.');
          }
          
          // Ensure the seller ID is a number if used
          let initOptions;
          if (config.clientToken) {
            initOptions = { token: config.clientToken };
          } else {
            // Convert sellerId to a number and ensure it's valid
            const sellerIdNum = Number(config.sellerId);
            if (isNaN(sellerIdNum) || sellerIdNum <= 0) {
              console.error('Invalid seller ID:', config.sellerId);
            } else {
              initOptions = { sellerId: sellerIdNum };
            }
          }
          
          // Log what we're actually passing to Paddle.Initialize
          console.log('Paddle init options:', initOptions);
          
          if (initOptions) {
            window.Paddle.Initialize(initOptions);
            console.log('Paddle initialized successfully');
          } else {
            console.error('Cannot initialize Paddle: missing valid configuration');
          }
        } catch (error) {
          console.error('Error setting up Paddle:', error);
        }
      } else {
        console.error('Paddle.js loaded but window.Paddle is undefined');
      }
    };
    document.head.appendChild(paddleScript);
  }
}

// Re-export validation function for use in other modules
export { validatePaddleConfig as ensurePaddleConfig };
