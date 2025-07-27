'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { Course, Section } from '@/lib/supabase/types';
import EnrollButton from '@/components/courses/EnrollButton';
import { useState, useEffect } from 'react';
import { verifyEnrollmentEligibility } from '@/lib/supabase/enrollments';
import { initiateCheckout } from '@/lib/supabase/checkout';

interface CourseActionsProps {
  course: Course;
  sections: Section[];
}

export function CourseActions({ course, sections }: CourseActionsProps) {
  const { user, dbUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [enrollmentStatus, setEnrollmentStatus] = useState<
    'not-enrolled' | 'processing' | 'enrolled'
  >('not-enrolled');
  const [isEnrollmentChecked, setIsEnrollmentChecked] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paddleLoaded, setPaddleLoaded] = useState(false);

  // Load Paddle.js when component mounts - using the approach from payment-test-client.tsx
  useEffect(() => {
    const initializePaddle = async () => {
      return new Promise((resolve, reject) => {
        // Check if Paddle is already loaded
        if (window.Paddle) {
          console.log('Paddle already loaded');
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

    // Function to configure Paddle after it's loaded
    const setupPaddle = async () => {
      try {
        // Load Paddle script and wait for it
        await initializePaddle();

        if (!window.Paddle) {
          console.error('Paddle failed to initialize - window.Paddle is undefined');
          return;
        }

        console.log('Setting up Paddle');

        // Set environment to sandbox if needed
        const isSandbox = process.env.NEXT_PUBLIC_PADDLE_SANDBOX_MODE === 'true';
        if (isSandbox) {
          console.log('Setting sandbox environment');
          window.Paddle.Environment.set('sandbox');
        }

        // Hard-coding sellerId for reliability
        const sellerId = Number(34619); // Your seller ID from .env

        console.log('Initializing Paddle with seller ID:', sellerId);

        // Initialize Paddle
        window.Paddle.Initialize({
          seller: sellerId,
        });

        console.log('Paddle setup complete');
        setPaddleLoaded(true);
      } catch (error) {
        console.error('Error setting up Paddle:', error);
        setErrorMessage('Payment system could not be initialized. Please try again later.');
      }
    };

    // Run the setup when in browser environment
    if (typeof window !== 'undefined') {
      setupPaddle();
    }

    // No cleanup needed
  }, []);

  // Check enrollment eligibility when user or course changes
  useEffect(() => {
    const checkEligibility = async () => {
      if (!course?.id) return;

      const { status, message } = await verifyEnrollmentEligibility(
        user?.id,
        dbUser?.role,
        course.id
      );

      // Update button state based on eligibility status
      if (status === 'enrolled') {
        setEnrollmentStatus('enrolled');
      } else {
        setEnrollmentStatus('not-enrolled');
      }

      // Update tooltip message
      setTooltipMessage(message);
      setIsEnrollmentChecked(true);
    };

    if (!authLoading) {
      checkEligibility();
    }
  }, [user, dbUser, course.id, authLoading]);

  // Create an enrollment record in the database
  const createEnrollmentRecord = async (paddleTransactionId: string) => {
    try {
      console.log('Creating enrollment record with transaction ID:', paddleTransactionId);

      const response = await fetch('/api/enrollments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course.id,
          paddleTransactionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create enrollment record');
      }

      console.log('Enrollment record created successfully:', data);
      return true;
    } catch (error: any) {
      console.error('Error creating enrollment record:', error);
      setErrorMessage(`Enrollment failed: ${error.message}. Please contact support.`);
      return false;
    }
  };

  const handleEnrollClick = async () => {
    // Clear any previous errors
    setErrorMessage(null);

    // Verify Paddle is loaded
    if (!paddleLoaded) {
      console.error('Paddle is not loaded yet');
      setErrorMessage('Payment system is not ready yet. Please try again in a moment.');
      return;
    }

    if (!user) {
      // Store the current course URL in session storage for redirect after login
      sessionStorage.setItem('redirectAfterLogin', `/courses/${course.id}`);
      router.push('/signin');
      return;
    }

    // Check role eligibility
    if (
      !dbUser?.role ||
      (dbUser.role !== 'admin' && dbUser.role !== 'creator' && dbUser.role !== 'student')
    ) {
      setErrorMessage('Your account does not have permission to enroll in courses');
      console.error('Your account does not have permission to enroll in courses');
      return;
    }

    // Set processing state
    setEnrollmentStatus('processing');

    try {
      console.log('Initiating checkout for course:', course.id);

      // Check if we have a direct paddle_price_id available
      if (course.paddle_price_id) {
        console.log('Using direct Paddle checkout with price ID:', course.paddle_price_id);

        // Open Paddle checkout directly using the price ID from the course
        if (typeof window !== 'undefined' && window.Paddle) {
          window.Paddle.Checkout.open({
            settings: {
              displayMode: 'overlay',
              theme: 'light',
            },
            items: [
              {
                priceId: course.paddle_price_id,
                quantity: 1,
              },
            ],
            onComplete: async (data: any) => {
              console.log('Payment successful', data);

              // Extract the transaction ID from the Paddle response
              const transactionId = data.transactionId || data.order?.id || `paddle_${Date.now()}`;
              console.log('Transaction ID:', transactionId);

              // Create the enrollment record with the transaction ID
              const enrollmentCreated = await createEnrollmentRecord(transactionId);

              if (enrollmentCreated) {
                // Update UI to reflect successful enrollment
                setEnrollmentStatus('enrolled');
                setTooltipMessage("You're enrolled in this course");

                // Optional: Refresh the page to show enrolled content
                setTimeout(() => {
                  router.refresh();
                }, 1000);
              } else {
                // Handle enrollment creation failure
                setEnrollmentStatus('not-enrolled');
                if (!errorMessage) {
                  setErrorMessage(
                    'Payment was successful, but enrollment failed. Please contact support.'
                  );
                }
              }
            },
            onClose: () => {
              console.log('Checkout was closed');
              setEnrollmentStatus('not-enrolled');
              setTooltipMessage('Click to try enrolling again');
            },
            onError: (error: any) => {
              console.error('Paddle checkout error:', error);
              setEnrollmentStatus('not-enrolled');
              setErrorMessage(error.message || 'An error occurred during checkout');
              setTooltipMessage('Click to try enrolling again');
            },
          });
          return;
        }
      }

      // Fall back to the API-based checkout if no paddle_price_id is available
      const result = await initiateCheckout(course.id);
      console.log('Checkout result:', result);

      if (result.success) {
        // Successful payment and enrollment
        setEnrollmentStatus('enrolled');
        setTooltipMessage("You're enrolled in this course");
      } else if (result.alreadyEnrolled) {
        // User is already enrolled
        setEnrollmentStatus('enrolled');
        setTooltipMessage("You're already enrolled in this course");
      } else if (result.error?.includes('Authentication required')) {
        // Authentication error, user session might have expired
        console.log('Authentication error detected, redirecting to login');

        // Store the current page URL for redirect after login
        const currentUrl = `/courses/${course.id}`;
        sessionStorage.setItem('redirectAfterLogin', currentUrl);

        // Redirect to sign-in page
        router.push(`/signin?redirectTo=${encodeURIComponent(currentUrl)}`);
      } else {
        // Handle other checkout errors
        setEnrollmentStatus('not-enrolled');
        setErrorMessage(result.error || 'Failed to complete enrollment');
        setTooltipMessage('Click to try enrolling again');
      }
    } catch (error: any) {
      console.error('Enrollment error:', error);

      // Check if it's an authentication error
      if (error.message && error.message.includes('Authentication required')) {
        console.log('Authentication error detected in catch block, redirecting to login');
        // Store redirect and navigate to login
        const currentUrl = `/courses/${course.id}`;
        sessionStorage.setItem('redirectAfterLogin', currentUrl);
        router.push(`/signin?redirectTo=${encodeURIComponent(currentUrl)}`);
      } else {
        // Handle other errors
        setEnrollmentStatus('not-enrolled');
        setErrorMessage(error.message || 'An error occurred during enrollment');
        setTooltipMessage('Click to try enrolling again');
      }
    }
  };

  // Calculate total duration from sections
  const totalDuration = Math.round(
    sections.reduce((total, section) => total + (section.duration || 0), 0) / 60
  );

  // Don't show anything until enrollment is checked to prevent UI flickering
  if (!isEnrollmentChecked && !authLoading) {
    return (
      <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-6 shadow-md">
        <div className="mb-4 h-7 w-1/3 rounded bg-gray-200"></div>
        <div className="mb-4 h-10 rounded bg-gray-200"></div>
        <div className="space-y-3">
          <div className="h-4 rounded bg-gray-200"></div>
          <div className="h-4 rounded bg-gray-200"></div>
          <div className="h-4 rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
      <div className="mb-4 text-2xl font-bold">${course.price.toFixed(2)}</div>

      {/* Error message display */}
      {errorMessage && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <p>{errorMessage}</p>
        </div>
      )}

      <div className="mb-4 w-full">
        <EnrollButton
          status={enrollmentStatus}
          onClick={handleEnrollClick}
          disabled={authLoading || enrollmentStatus === 'enrolled' || !paddleLoaded}
          tooltipText={!paddleLoaded ? 'Payment system is loading...' : tooltipMessage}
          className="w-full"
        />
      </div>

      <div className="space-y-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Sections totales :</span>
          <span className="font-semibold">{sections.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Durée totale :</span>
          <span className="font-semibold">{totalDuration} min</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Créé par :</span>
          <span className="font-semibold">{course.creator?.name || 'Inconnu'}</span>
        </div>
        {course.playback_id && (
          <div className="flex justify-between">
            <span className="text-gray-600">Statut vidéo :</span>
            <span className="font-semibold text-green-600">Disponible</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Add TypeScript declaration for Paddle
declare global {
  interface Window {
    Paddle: any;
  }
}
