'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { Course } from '@/lib/supabase/types';
import EnrollButton from '@/components/courses/EnrollButton';
import { useState, useEffect, useRef } from 'react';
import { verifyEnrollmentEligibility, checkEnrollmentStatus } from '@/lib/supabase/enrollments';
import { initiateCheckout } from '@/lib/supabase/checkout';

interface CourseActionsProps {
  course: Course;
  initialEnrollmentStatus?: 'enrolled' | 'not-enrolled' | 'processing';
}

export function CourseActions({ course, initialEnrollmentStatus = 'not-enrolled' }: CourseActionsProps) {
  const { user, dbUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [enrollmentStatus, setEnrollmentStatus] = useState<
    'not-enrolled' | 'processing' | 'enrolled'
  >(initialEnrollmentStatus);
  const [isEnrollmentChecked, setIsEnrollmentChecked] = useState(!!initialEnrollmentStatus);
  const [tooltipMessage, setTooltipMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paddleLoaded, setPaddleLoaded] = useState(false);
  const [showEnrollmentProgress, setShowEnrollmentProgress] = useState(false);
  const [showEnrollmentSuccess, setShowEnrollmentSuccess] = useState(false);
  const finalizingRef = useRef(false);

  // Sync status and tooltip with parent-provided enrollment status
  useEffect(() => {
    setEnrollmentStatus(initialEnrollmentStatus);
    if (initialEnrollmentStatus === 'enrolled') {
      setTooltipMessage('Click to watch this course');
    } else if (initialEnrollmentStatus === 'processing') {
      setTooltipMessage('Processing your enrollment...');
    } else {
      setTooltipMessage('Click to enroll in this course');
    }
  }, [initialEnrollmentStatus]);

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

        // Initialize Paddle with event callback for Paddle Billing (v2)
        window.Paddle.Initialize({
          seller: sellerId,
          eventCallback: function(data: any) {
            console.log('Paddle event:', data);
            
            // Handle checkout:completed event
            if (data.name === 'checkout.completed') {
              console.log('Checkout completed event received:', data);
              
              // Extract transaction ID for Paddle Billing v2 format
              // The transaction ID in Paddle Billing v2 is in data.checkout.transaction_id or data.id
              const transactionId = 
                data?.checkout?.transaction_id || 
                data?.data?.checkout?.transaction_id || 
                data?.data?.id || 
                data?.id || 
                `paddle_${Date.now()}`;
              console.log('Transaction ID from event:', transactionId);

              // Prevent duplicate handling
              if (finalizingRef.current) {
                return;
              }
              finalizingRef.current = true;
              setEnrollmentStatus('processing');
              setTooltipMessage('Finalizing your enrollment...');

              // After 2s, close checkout and begin enrollment record creation with a progress UI
              setTimeout(() => {
                try {
                  if (typeof window !== 'undefined' && window.Paddle?.Checkout?.close) {
                    window.Paddle.Checkout.close();
                  }
                } catch (e) {
                  console.warn('Failed to programmatically close Paddle checkout:', e);
                }
                setShowEnrollmentProgress(true);

                createEnrollmentRecord(transactionId)
                  .then(success => {
                    setShowEnrollmentProgress(false);
                    if (success) {
                      setEnrollmentStatus('enrolled');
                      setTooltipMessage("You're enrolled in this course");
                      setShowEnrollmentSuccess(true);
                    } else {
                      setEnrollmentStatus('not-enrolled');
                      setErrorMessage('We could not finalize your enrollment. Please try again.');
                      setTooltipMessage('Click to try enrolling again');
                    }
                  })
                  .catch(error => {
                    console.error('Error creating enrollment from event:', error);
                    setShowEnrollmentProgress(false);
                    setEnrollmentStatus('not-enrolled');
                    setErrorMessage('An error occurred while finalizing your enrollment.');
                    setTooltipMessage('Click to try enrolling again');
                  })
                  .finally(() => {
                    finalizingRef.current = false;
                  });
              }, 2000);
            }
            
            // Handle checkout:closed event
            if (data.name === 'checkout.closed') {
              console.log('Checkout closed event received');
              // If we closed it programmatically to finalize enrollment, don't override state
              if (finalizingRef.current || showEnrollmentProgress) {
                return;
              }
              setEnrollmentStatus('not-enrolled');
              setTooltipMessage('Click to try enrolling again');
            }
            
            // Handle checkout:error event
            if (data.name === 'checkout.error') {
              console.error('Checkout error event received:', data);
              setEnrollmentStatus('not-enrolled');
              setErrorMessage('An error occurred during checkout. Please try again.');
              setTooltipMessage('Click to try enrolling again');
            }
          }
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

  // Check enrollment eligibility when user or course changes, but only if initialEnrollmentStatus is not provided
  useEffect(() => {
    // If we already have the enrollment status from the parent, skip this check
    if (initialEnrollmentStatus && isEnrollmentChecked) {
      return;
    }
    
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
  }, [user, dbUser, course.id, authLoading, initialEnrollmentStatus, isEnrollmentChecked]);

  // Create an enrollment record in the database
  const createEnrollmentRecord = async (_transactionId: string) => {
    try {
      console.log('Creating enrollment record...');

      const response = await fetch('/api/enrollments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course.id,
        }),
      });

      const data = await response.json();

      // If API responded with non-2xx, double-check for idempotent success cases
      if (!response.ok) {
        console.warn('API response not OK. Inspecting payload for success-like states:', response.status, data);
        if (data?.success || data?.alreadyEnrolled) {
          console.log('Treating non-OK response as success due to payload flags');
          return true;
        }

        // As a safety net, verify enrollment status directly before surfacing an error
        try {
          const { isEnrolled } = await checkEnrollmentStatus(user?.id, course.id);
          if (isEnrolled) {
            console.log('Enrollment verified despite non-OK response. Treating as success.');
            return true;
          }
        } catch (verifyErr) {
          console.warn('Failed to verify enrollment after non-OK response:', verifyErr);
        }

        console.error('API response error:', response.status, data);
        throw new Error(data?.error || 'Failed to create enrollment record');
      }

      console.log('Enrollment record created successfully:', data);
      
      // Handle both standard success and "already enrolled" success case
      if (data.success) {
        if (data.alreadyEnrolled) {
          console.log('User was already enrolled in this course');
        }
        return true;
      } else {
        // As a final safeguard, verify actual enrollment before throwing
        try {
          const { isEnrolled } = await checkEnrollmentStatus(user?.id, course.id);
          if (isEnrolled) {
            console.log('Post-success-flag missing, but enrollment verified. Treating as success.');
            return true;
          }
        } catch (verifyErr) {
          console.warn('Verification after ambiguous response failed:', verifyErr);
        }
        throw new Error(data?.error || 'Unknown error during enrollment');
      }
    } catch (error: any) {
      console.error('Error creating enrollment record:', error);
      // Before surfacing error, verify enrollment status in case backend succeeded but returned an error
      try {
        const { isEnrolled } = await checkEnrollmentStatus(user?.id, course.id);
        if (isEnrolled) {
          console.log('Enrollment exists despite caught error. Treating as success.');
          return true;
        }
      } catch (verifyErr) {
        console.warn('Verification after catch failed:', verifyErr);
      }
      setErrorMessage(`Enrollment failed: ${error.message}. Please contact support.`);
      return false;
    }
  };

  const handleEnrollClick = async () => {
    // Prevent enrollment when using mock data or invalid course id (not a UUID)
    const usingMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
    const looksLikeUuid = typeof course.id === 'string' && /^[0-9a-fA-F-]{36}$/.test(course.id);
    if (usingMock || !looksLikeUuid) {
      setErrorMessage('Enrollment is disabled in mock mode or for invalid course id.');
      setTooltipMessage('Mock data mode detected');
      return;
    }

    // If user is already enrolled, navigate to the course content
    if (enrollmentStatus === 'enrolled') {
      // Navigate to the course content page
      router.push(`/learning/${course.id}`);
      return;
    }

    // Clear any previous errors
    setErrorMessage(null);

    // Membership-based gating:
    // Free membership: redirect to payment page to subscribe
    if (dbUser?.membership === 'free') {
      router.push('/payment');
      return;
    }

    // If user is subscribed, enroll directly without payment
    if (dbUser?.membership === 'subscribed') {
      try {
        setEnrollmentStatus('processing');
        const success = await createEnrollmentRecord('subscription');
        if (success) {
          setEnrollmentStatus('enrolled');
          setTooltipMessage("You're enrolled in this course");
          router.refresh();
        } else {
          setEnrollmentStatus('not-enrolled');
          setErrorMessage('Could not finalize your enrollment. Please try again.');
        }
      } catch (e: any) {
        setEnrollmentStatus('not-enrolled');
        setErrorMessage(e?.message || 'An error occurred while enrolling');
      }
      return;
    }

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
      (dbUser.role !== 'admin' && dbUser.role !== 'teacher' && dbUser.role !== 'student')
    ) {
      setErrorMessage('Your account does not have permission to enroll in courses');
      console.error('Your account does not have permission to enroll in courses');
      return;
    }

    // Set processing state
    setEnrollmentStatus('processing');

    try {
      console.log('Initiating checkout for course:', course.id);

      // Check if we have a global Paddle price ID available
      const configuredPriceId = process.env.NEXT_PUBLIC_PADDLE_COURSE_PRICE_ID;
      if (configuredPriceId) {
        console.log('Using Paddle checkout with configured price ID:', configuredPriceId);

        // Open Paddle checkout directly using the price ID from the course
        if (typeof window !== 'undefined' && window.Paddle) {
          console.log('Paddle is loaded');
          console.log('Paddle object:', window.Paddle);
          
          // Setup a fallback mechanism to check enrollment status after a delay
          const checkAfterDelay = () => {
            console.log('Setting up fallback enrollment check');
            setTimeout(async () => {
              console.log('Running fallback enrollment check');
              try {
                const { status, message } = await verifyEnrollmentEligibility(
                  user?.id,
                  dbUser?.role,
                  course.id
                );
                
                if (status === 'enrolled') {
                  console.log('Fallback check: User is enrolled');
                  setEnrollmentStatus('enrolled');
                  setTooltipMessage("You're enrolled in this course");
                  router.refresh();
                }
              } catch (err) {
                console.error('Error in fallback enrollment check:', err);
              }
            }, 5000); // Give webhook 5 seconds to process
          };

          // Set up checkout options using Paddle Billing v2 approach
          window.Paddle.Checkout.open({
            settings: {
              displayMode: 'overlay',
              theme: 'light',
              frameTarget: 'paddle-checkout',
              frameInitialHeight: 416
            },
            items: [
              {
                priceId: configuredPriceId,
                quantity: 1,
              },
            ]
          });
          
          // Add a fallback check as safety net
          checkAfterDelay();
          
          return;
        }
      }

      // Fall back to the API-based checkout if no configured price ID is available
      const result = await initiateCheckout(course.id);
      console.log('Checkout result:', result);

      if (result.success) {
        // Successful payment and enrollment
        console.log('Enrollment successful');
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

  // Derive total duration from course if available (fallback 0)
  const totalDuration = typeof (course as any).duration === 'number'
    ? Math.round(((course as any).duration as number))
    : 0;

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
      {/* Price removed from schema; consider showing category or duration instead */}

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
          disabled={authLoading || enrollmentStatus === 'processing'}
          tooltipText={enrollmentStatus === 'enrolled' ? 'Go to course' : (!paddleLoaded ? 'Payment system is loading...' : tooltipMessage)}
          enrolledText="Watch now"
          className="w-full"
        />
        {enrollmentStatus === 'enrolled' && (
          <button
            onClick={async () => {
              try {
                console.log('Unenrolling from course');
                setErrorMessage(null);
                setEnrollmentStatus('processing');
                const res = await fetch('/api/enrollments/delete', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ courseId: course.id }),
                });
                const data = await res.json().catch(() => ({}));
                console.log('Unenrollment response:', data);
                if (!res.ok || !data?.success) {
                  throw new Error(data?.error || 'Failed to unenroll from course');
                }
                setEnrollmentStatus('not-enrolled');
                setTooltipMessage('Click to enroll in this course');
                router.refresh();
              } catch (e: any) {
                setEnrollmentStatus('enrolled');
                setErrorMessage(e?.message || 'Could not unenroll at this time.');
              }
            }}
            className="mt-3 w-full rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Unenroll from course
          </button>
        )}
      </div>

      <div className="space-y-4 text-sm">
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

      {/* Enrollment progress overlay */}
      {showEnrollmentProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 text-lg font-semibold">Finalizing your enrollment…</div>
            <p className="mb-4 text-sm text-gray-600">This usually takes just a moment.</p>
            <div className="h-2 w-full overflow-hidden rounded bg-gray-200">
              <div className="h-2 w-1/2 animate-pulse rounded bg-blue-600"></div>
            </div>
          </div>
        </div>
      )}

      {/* Enrollment success dialog */}
      {showEnrollmentSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-2 text-lg font-semibold">You are enrolled! 🎉</div>
            <p className="mb-6 text-sm text-gray-700">You now have access to {course.title}. Start learning right away.</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => {
                  setShowEnrollmentSuccess(false);
                  router.push(`/learning/${course.id}`);
                }}
                className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 sm:w-auto"
              >
                Start learning
              </button>
              <button
                onClick={() => {
                  setShowEnrollmentSuccess(false);
                  // Keep user on the page but refresh to reflect access
                  router.refresh();
                }}
                className="w-full rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 sm:w-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add TypeScript declaration for Paddle
declare global {
  interface Window {
    Paddle: any;
  }
}
