'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { Course } from '@/lib/supabase/types';
import EnrollButton from '@/components/courses/EnrollButton';
import { useState, useEffect, useRef, Fragment } from 'react';
import { verifyEnrollmentEligibility, checkEnrollmentStatus } from '@/lib/supabase/enrollments';
import { initiateCheckout } from '@/lib/supabase/checkout';

interface CourseActionsProps {
  course: Course;
  initialEnrollmentStatus?: 'enrolled' | 'not-enrolled' | 'processing';
}

export function CourseActions({
  course,
  initialEnrollmentStatus = 'not-enrolled',
}: CourseActionsProps) {
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
      setTooltipMessage('Cliquez pour regarder ce cours');
    } else if (initialEnrollmentStatus === 'processing') {
      setTooltipMessage('Traitement de votre inscription...');
    } else {
      setTooltipMessage('Cliquez pour vous inscrire à ce cours');
    }
  }, [initialEnrollmentStatus]);

  // Paddle removed
  useEffect(() => {
    setPaddleLoaded(false);
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
        console.warn(
          'API response not OK. Inspecting payload for success-like states:',
          response.status,
          data
        );
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
      setErrorMessage(
        `Impossible de finaliser votre inscription: ${error.message}. Veuillez contacter le support.`
      );
      return false;
    }
  };

  const handleEnrollClick = async () => {
    // Prevent enrollment when using mock data or invalid course id (not a UUID)
    const usingMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
    const looksLikeUuid = typeof course.id === 'string' && /^[0-9a-fA-F-]{36}$/.test(course.id);
    if (usingMock || !looksLikeUuid) {
      setErrorMessage(
        "L'inscription est désactivée en mode maquette ou pour un identifiant de cours invalide."
      );
      setTooltipMessage('Mode données factices détecté');
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
    // Free membership: redirect to payment page to subscribe, carrying courseId for post-payment enrollment
    if (dbUser?.membership === 'free') {
      router.push(`/payment?courseId=${encodeURIComponent(course.id)}`);
      return;
    }

    // If user is subscribed, enroll directly without payment
    if (dbUser?.membership === 'subscribed') {
      try {
        setEnrollmentStatus('processing');
        const success = await createEnrollmentRecord('subscription');
        if (success) {
          setEnrollmentStatus('enrolled');
          setTooltipMessage('Vous êtes inscrit à ce cours');
          router.refresh();
        } else {
          setEnrollmentStatus('not-enrolled');
          setErrorMessage('Impossible de finaliser votre inscription. Veuillez réessayer.');
        }
      } catch (e: any) {
        setEnrollmentStatus('not-enrolled');
        setErrorMessage(e?.message || "Une erreur s'est produite lors de l'inscription");
      }
      return;
    }

    // Paddle removed: no SDK gate

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
      setErrorMessage("Votre compte n'a pas la permission de s'inscrire aux cours");
      console.error("Votre compte n'a pas la permission de s'inscrire aux cours");
      return;
    }

    // Set processing state
    setEnrollmentStatus('processing');

    try {
      console.log('Initiating checkout for course:', course.id);

      // Paddle direct checkout removed

      // Fall back to the API-based checkout if no configured price ID is available
      const result = await initiateCheckout(course.id);
      console.log('Checkout result:', result);

      if (result.success) {
        // Successful payment and enrollment
        console.log('Enrollment successful');
        setEnrollmentStatus('enrolled');
        setTooltipMessage('Vous êtes inscrit à ce cours');
      } else if (result.alreadyEnrolled) {
        // User is already enrolled
        setEnrollmentStatus('enrolled');
        setTooltipMessage('Vous êtes déjà inscrit à ce cours');
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
        setErrorMessage(result.error || "Échec de l'inscription");
        setTooltipMessage("Cliquez pour réessayer l'inscription");
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
        setErrorMessage(error.message || "Une erreur s'est produite lors de l'inscription");
        setTooltipMessage("Cliquez pour réessayer l'inscription");
      }
    }
  };

  // Derive total duration from course if available (fallback 0)
  const totalDuration =
    typeof (course as any).duration === 'number'
      ? Math.round((course as any).duration as number)
      : 0;

  // Don't show anything until enrollment is checked to prevent UI flickering
  if (!isEnrollmentChecked && !authLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
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
    <Fragment>
      <div className="sticky top-6">
        <div className="rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 p-6 shadow-lg">
          {/* Titre de la section */}
          <div className="mb-6 flex items-center gap-3">
            <span className="text-3xl">🚀</span>
            <h3 className="text-xl font-bold text-orange-700">Commencer l'aventure</h3>
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

            <div className="mb-6 w-full">
              <div className="group relative">
                <EnrollButton
                  status={enrollmentStatus}
                  onClick={handleEnrollClick}
                  disabled={authLoading || enrollmentStatus === 'processing'}
                  tooltipText={
                    enrollmentStatus === 'enrolled'
                      ? 'Aller au cours'
                      : !paddleLoaded
                        ? 'Chargement du système de paiement...'
                        : tooltipMessage
                  }
                  notEnrolledText="s'inscrire maintenant"
                  enrolledText="🎯 Commencer à apprendre"
                  className="w-full transform rounded-xl border-2 border-green-400 bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:border-green-500 hover:from-green-600 hover:to-emerald-700 hover:shadow-xl"
                />
                {/* Effet de brillance */}
                <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:animate-pulse group-hover:opacity-100"></div>
              </div>

              {enrollmentStatus === 'enrolled' && dbUser?.role !== 'admin' && (
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
                      setTooltipMessage('Cliquez pour vous inscrire à ce cours');
                      router.refresh();
                    } catch (e: any) {
                      setEnrollmentStatus('enrolled');
                      setErrorMessage(
                        e?.message || 'Impossible de vous désinscrire pour le moment.'
                      );
                    }
                  }}
                  className="mt-4 w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50"
                >
                  Se désinscrire du cours
                </button>
              )}
            </div>

            {/* Informations du cours */}
            <div className="space-y-4">
              <div className="rounded-xl border border-orange-200 bg-white/60 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⏰</span>
                    <span className="font-medium text-gray-700">Durée totale</span>
                  </div>
                  <span className="font-bold text-gray-800">{totalDuration} min</span>
                </div>
              </div>

              <div className="rounded-xl border border-orange-200 bg-white/60 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👨‍🏫</span>
                    <span className="font-medium text-gray-700">Enseignant</span>
                  </div>
                  <span className="font-bold text-gray-800">
                    {course.creator?.name || 'Inconnu'}
                  </span>
                </div>
              </div>

              {course.playback_id && (
                <div className="rounded-xl border border-orange-200 bg-white/60 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📹</span>
                      <span className="font-medium text-gray-700">Vidéos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
                      <span className="font-bold text-green-600">Disponibles</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Message d'encouragement */}
            <div className="mt-6 rounded-xl border border-sky-200 bg-gradient-to-r from-sky-100 to-blue-100 p-4">
              <div className="text-center">
                <div className="mb-2 text-2xl">🌟</div>
                <p className="text-sm font-medium text-sky-800">
                  Rejoins des milliers d'élèves qui apprennent en s'amusant !
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment progress overlay */}
      {showEnrollmentProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 text-lg font-semibold">Finalisation de votre inscription…</div>
            <p className="mb-4 text-sm text-gray-600">Cela ne prend généralement qu'un instant.</p>
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
            <div className="mb-2 text-lg font-semibold">Vous êtes inscrit ! 🎉</div>
            <p className="mb-6 text-sm text-gray-700">
              Vous avez maintenant accès à {course.title}. Commencez à apprendre dès maintenant.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => {
                  setShowEnrollmentSuccess(false);
                  router.push(`/learning/${course.id}`);
                }}
                className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 sm:w-auto"
              >
                Commencer à apprendre
              </button>
              <button
                onClick={() => {
                  setShowEnrollmentSuccess(false);
                  // Keep user on the page but refresh to reflect access
                  router.refresh();
                }}
                className="w-full rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 sm:w-auto"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
}

// Add TypeScript declaration for Paddle
declare global {
  interface Window {
    Paddle: any;
  }
}
