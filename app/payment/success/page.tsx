'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function PaymentSuccessContent() {
  const [confirming, setConfirming] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        // If we have a Checkout session_id in the URL, store the Stripe customer_id server-side
        const sessionId = searchParams?.get('session_id');
        if (sessionId) {
          try {
            await fetch('/api/stripe/store-customer-from-session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId }),
            });
          } catch (e) {
            // non-blocking
            console.warn('Failed to store customer from session:', e);
          }
        }

        // Best-effort immediate confirm to avoid waiting for webhook latency
        const res = await fetch('/api/stripe/confirm', { method: 'POST' });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || 'Failed to confirm membership');
        }
        // If a courseId is present, auto-enroll and redirect to the course page
        const courseId = searchParams?.get('courseId');
        if (courseId) {
          setEnrolling(true);
          const enrollRes = await fetch('/api/enrollments/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseId }),
          });
          const enrollData = await enrollRes.json().catch(() => ({}));
          if (!enrollRes.ok || !enrollData?.success) {
            // If already enrolled, proceed; otherwise surface error
            if (!enrollData?.alreadyEnrolled) {
              throw new Error(enrollData?.error || 'Failed to enroll in course');
            }
          }
          // Redirect to the course page
          router.replace(`/courses/${courseId}`);
          return;
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to confirm membership');
      } finally {
        if (!cancelled) setConfirming(false);
        if (!cancelled) setEnrolling(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div className="background-beige flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Success Card */}
        <div className="overflow-hidden rounded-2xl border border-green-100 bg-white shadow-2xl">
          {/* Header Section */}
          <div className="relative overflow-hidden bg-gradient-to-r from-green-700 via-green-500 to-green-700 px-8 py-12 text-center text-white">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute left-4 top-4 h-8 w-8 rounded-full border-2 border-white"></div>
              <div className="absolute right-8 top-8 h-6 w-6 rounded-full border-2 border-white"></div>
              <div className="absolute bottom-4 left-8 h-4 w-4 rounded-full border-2 border-white"></div>
              <div className="absolute bottom-8 right-4 h-10 w-10 rounded-full border-2 border-white"></div>
            </div>

            <div className="relative z-10">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <svg
                  className="h-10 w-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <h1 className="mb-2 text-4xl font-bold">Paiement Réussi !</h1>
              <p className="text-lg text-green-100">Votre abonnement est maintenant actif</p>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-8 py-8">
            <div className="mb-8 text-center">
              <h2 className="mb-4 text-2xl font-semibold text-gray-800">🎉 Félicitations !</h2>
              <p className="text-lg leading-relaxed text-gray-600">
                Vous avez maintenant accès à tous nos cours premium. Votre aventure
                d&#39;apprentissage commence maintenant !
              </p>
            </div>

            {/* Status Messages */}
            {confirming && (
              <div className="mb-6 rounded-r-lg border-l-4 border-blue-400 bg-blue-50 p-4">
                <div className="flex items-center">
                  <div className="mr-3 h-5 w-5 animate-spin rounded-full border-b-2 border-blue-600"></div>
                  <span className="font-medium text-blue-800">Activation de votre abonnement…</span>
                </div>
              </div>
            )}

            {enrolling && (
              <div className="mb-6 rounded-r-lg border-l-4 border-purple-400 bg-purple-50 p-4">
                <div className="flex items-center">
                  <div className="mr-3 h-5 w-5 animate-spin rounded-full border-b-2 border-purple-600"></div>
                  <span className="font-medium text-purple-800">Inscription au cours…</span>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-r-lg border-l-4 border-red-400 bg-red-50 p-4">
                <div className="flex items-center">
                  <span className="mr-3 text-red-600">⚠️</span>
                  <span className="font-medium text-red-800">{error}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Link
                href="/"
                className="group flex items-center justify-center rounded-xl border-2 border-gray-200 px-6 py-4 font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md"
              >
                <svg
                  className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1 group-hover:transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  ></path>
                </svg>
                Retour à l&#39;accueil
              </Link>
              <Link
                href="/my-learning"
                className="group flex items-center justify-center rounded-xl bg-gradient-to-r from-green-700 via-green-500 to-green-700 px-6 py-4 font-semibold text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                Commencer à apprendre
                <svg
                  className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  ></path>
                </svg>
              </Link>
            </div>

            {/* Features List */}
            <div className="mt-8 rounded-xl border border-green-100 bg-gradient-to-r from-green-50 to-emerald-50 p-6">
              <h3 className="mb-4 text-center text-lg font-semibold text-gray-800">
                Ce qui vous attend :
              </h3>
              <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                <div className="flex items-center text-gray-700">
                  <span className="mr-2 text-green-500">✓</span>
                  Accès illimité à tous les cours
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="mr-2 text-green-500">✓</span>
                  Certificats de completion
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="mr-2 text-green-500">✓</span>
                  Contenu de qualité
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="mr-2 text-green-500">✓</span>
                  Mises à jour régulières
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={<div className="mx-auto max-w-3xl px-6 py-16 text-center">Chargement…</div>}
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
