import { loadPaddleJs } from '@/lib/paddle/client';
import { supabase } from '@/lib/supabase/client';

/**
 * Interface for checkout response data
 */
interface CheckoutResponse {
  success: boolean;
  error?: string;
  alreadyEnrolled?: boolean;
  checkoutData?: {
    priceId: string;
    title: string;
    courseId: string;
    price: number;
    clientReferenceId: string;
    userId: string;
    passthrough: string;
    successUrl: string;
    cancelUrl: string;
  };
  paddleConfig?: {
    sellerId: string;
    sandboxMode: boolean;
  };
}

/**
 * Interface for checkout result
 */
interface CheckoutResult {
  success: boolean;
  error?: string;
  alreadyEnrolled?: boolean;
}

// Track if Paddle has been loaded and initialized
let paddleInitialized = false;

/**
 * Loads and initializes the Paddle SDK following the payment-test-client pattern
 * @returns Promise that resolves when Paddle is ready to use
 */
async function loadAndInitializePaddle(): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('Cannot load Paddle in a server environment');
  }

  if (paddleInitialized && window.Paddle) {
    console.log('Paddle already initialized');
    return;
  }

  try {
    console.log('Setting up Paddle...');

    // Step 1: Load the script
    // Define a function to load and initialize Paddle
    const initializePaddle = async () => {
      return new Promise((resolve, reject) => {
        // Check if Paddle is already loaded
        if (window.Paddle) {
          console.log('Paddle script already loaded');
          resolve(window.Paddle);
          return;
        }

        // Create and append the script
        const script = document.createElement('script');
        script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
        script.async = true;
        script.defer = true;

        script.onload = () => {
          console.log('Paddle script loaded');
          resolve(window.Paddle);
        };

        script.onerror = () => {
          console.error('Failed to load Paddle script');
          reject(new Error('Failed to load Paddle script'));
        };

        document.head.appendChild(script);
      });
    };

    // Step 2: Initialize after script loading
    await initializePaddle();

    if (!window.Paddle) {
      console.error('Paddle failed to initialize - window.Paddle is undefined');
      throw new Error('Paddle failed to load properly');
    }

    console.log('Setting up Paddle configuration');

    // Set environment to sandbox if needed
    const isSandbox = process.env.NEXT_PUBLIC_PADDLE_SANDBOX_MODE === 'true';
    if (isSandbox) {
      console.log('Setting sandbox environment');
      window.Paddle.Environment.set('sandbox');
    }

    // Hard-coding sellerId for reliability (same as payment-test-client)
    // This approach is proven to work in the payment-test-client
    const sellerId = Number(34619);

    console.log('Initializing Paddle with seller ID:', sellerId);

    // Initialize Paddle
    window.Paddle.Initialize({
      seller: sellerId,
    });

    console.log('Paddle setup complete');
    paddleInitialized = true;
  } catch (error) {
    console.error('Error setting up Paddle:', error);
    throw error;
  }
}

/**
 * Initiates checkout process for a course
 *
 * @param courseId - ID of the course to enroll in
 * @returns CheckoutResult object indicating success/failure
 */
export async function initiateCheckout(courseId: string): Promise<CheckoutResult> {
  try {
    // First, ensure Paddle is loaded and initialized
    await loadAndInitializePaddle();

    // Call the checkout API endpoint
    const response = await fetch(`/api/checkout/${courseId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // This ensures cookies are sent with the request
    });

    if (!response.ok) {
      const errorData = await response.json();

      // If unauthorized, return error for the component to handle
      if (response.status === 401) {
        console.error('Authentication error from API:', errorData.error);
        return {
          success: false,
          error: 'Authentication required. Please log in before enrolling.',
        };
      }

      // Handle already enrolled case
      if (response.status === 409) {
        return {
          success: false,
          alreadyEnrolled: true,
          error: errorData.error || 'You are already enrolled in this course',
        };
      }

      // Handle other errors
      throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
    }

    const checkoutData: CheckoutResponse = await response.json();

    if (!checkoutData.success || !checkoutData.checkoutData) {
      throw new Error(checkoutData.error || 'Failed to create checkout session');
    }

    // Open the Paddle checkout using the successful pattern from payment-test-client
    return await openPaddleCheckout(checkoutData.checkoutData.priceId);
  } catch (error: any) {
    console.error('Checkout error:', error);
    return {
      success: false,
      error: error.message || 'Failed to initiate checkout',
    };
  }
}

/**
 * Opens the Paddle checkout overlay using the exact pattern from payment-test-client
 *
 * @param priceId - Paddle price ID
 * @returns Promise resolving to checkout result
 */
function openPaddleCheckout(priceId: string): Promise<CheckoutResult> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.Paddle) {
      resolve({
        success: false,
        error: 'Paddle is not available',
      });
      return;
    }

    try {
      // Log the product ID to verify it's not undefined
      console.log('Opening checkout with product ID:', priceId);

      window.Paddle.Checkout.open({
        settings: {
          displayMode: 'overlay',
          theme: 'light',
        },
        items: [
          {
            priceId: priceId,
            quantity: 1,
          },
        ],
        onComplete: (data: any) => {
          console.log('Payment successful', data);
          resolve({
            success: true,
          });
        },
        onClose: () => {
          console.log('Checkout was closed');
          resolve({
            success: false,
            error: 'Checkout was cancelled',
          });
        },
        onError: (error: any) => {
          console.error('Paddle checkout error:', error);
          resolve({
            success: false,
            error: error.message || 'An error occurred during checkout',
          });
        },
      });
    } catch (error: any) {
      console.error('Error opening checkout:', error);
      resolve({
        success: false,
        error: error.message || 'Failed to open checkout',
      });
    }
  });
}

// Add TypeScript declaration for Paddle
declare global {
  interface Window {
    Paddle: any;
  }
}
