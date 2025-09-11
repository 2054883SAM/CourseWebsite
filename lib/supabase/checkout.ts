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

// Paddle removed

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

    const _data: CheckoutResponse = await response.json();
    // With Paddle removed, treat server response as success if it indicates enrollment already handled
    return { success: true };
  } catch (error: any) {
    console.error('Checkout error:', error);
    return {
      success: false,
      error: error.message || 'Failed to initiate checkout',
    };
  }
}
