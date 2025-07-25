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

/**
 * Initiates checkout process for a course
 * 
 * @param courseId - ID of the course to enroll in
 * @returns CheckoutResult object indicating success/failure
 */
export async function initiateCheckout(courseId: string): Promise<CheckoutResult> {
  try {
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

    // Make sure Paddle.js is loaded
    ensurePaddleLoaded();

    // Open the Paddle checkout
    return await openPaddleCheckout(checkoutData.checkoutData);
  } catch (error: any) {
    console.error('Checkout error:', error);
    return {
      success: false,
      error: error.message || 'Failed to initiate checkout',
    };
  }
}

/**
 * Make sure Paddle.js is loaded before opening checkout
 */
function ensurePaddleLoaded(): void {
  // If window.Paddle doesn't exist, load Paddle.js
  if (typeof window !== 'undefined' && !window.Paddle) {
    loadPaddleJs();
    
    // Give Paddle time to initialize (in a real app, you'd use a more robust approach)
    throw new Error('Paddle.js is not loaded. Please try again in a few seconds.');
  }
}

/**
 * Opens the Paddle checkout overlay
 * 
 * @param checkoutData - Data needed for checkout
 * @returns Promise resolving to checkout result
 */
function openPaddleCheckout(checkoutData: CheckoutResponse['checkoutData']): Promise<CheckoutResult> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.Paddle) {
      resolve({
        success: false,
        error: 'Paddle.js is not loaded',
      });
      return;
    }

    try {
      window.Paddle.Checkout.open({
        settings: {
          displayMode: 'overlay',
          theme: 'light',
          successUrl: checkoutData?.successUrl,
          cancelUrl: checkoutData?.cancelUrl,
        },
        items: [{
          priceId: checkoutData?.priceId,
          quantity: 1,
        }],
        customData: {
          courseId: checkoutData?.courseId,
          userId: checkoutData?.userId,
          clientReferenceId: checkoutData?.clientReferenceId,
        },
        passthrough: checkoutData?.passthrough,
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
      });
    } catch (error: any) {
      console.error('Error opening Paddle checkout:', error);
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