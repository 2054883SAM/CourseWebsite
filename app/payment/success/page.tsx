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
    <div className="min-h-screen background-beige flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-green-100">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-700 via-green-500 to-green-700 px-8 py-12 text-center text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-4 w-8 h-8 border-2 border-white rounded-full"></div>
              <div className="absolute top-8 right-8 w-6 h-6 border-2 border-white rounded-full"></div>
              <div className="absolute bottom-4 left-8 w-4 h-4 border-2 border-white rounded-full"></div>
              <div className="absolute bottom-8 right-4 w-10 h-10 border-2 border-white rounded-full"></div>
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h1 className="text-4xl font-bold mb-2">Paiement Réussi !</h1>
              <p className="text-green-100 text-lg">Votre abonnement est maintenant actif</p>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-8 py-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                🎉 Félicitations !
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Vous avez maintenant accès à tous nos cours premium. 
                Votre aventure d'apprentissage commence maintenant !
              </p>
            </div>

            {/* Status Messages */}
            {confirming && (
              <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                  <span className="text-blue-800 font-medium">Activation de votre abonnement…</span>
                </div>
              </div>
            )}
            
            {enrolling && (
              <div className="mb-6 p-4 bg-purple-50 border-l-4 border-purple-400 rounded-r-lg">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 mr-3"></div>
                  <span className="text-purple-800 font-medium">Inscription au cours…</span>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                <div className="flex items-center">
                  <span className="text-red-600 mr-3">⚠️</span>
                  <span className="text-red-800 font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/"
                className="group flex items-center justify-center px-6 py-4 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-md"
              >
                <svg className="w-5 h-5 mr-2 group-hover:transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Retour à l'accueil
              </Link>
              <Link
                href="/my-learning"
                className="group flex items-center justify-center px-6 py-4 bg-gradient-to-r from-green-700 via-green-500 to-green-700 rounded-xl text-white font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                Commencer à apprendre
                <svg className="w-5 h-5 ml-2 group-hover:transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </Link>
            </div>

            {/* Features List */}
            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Ce qui vous attend :
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-2">✓</span>
                  Accès illimité à tous les cours
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-2">✓</span>
                  Certificats de completion
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-2">✓</span>
                  Contenu de qualité
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="text-green-500 mr-2">✓</span>
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
    <Suspense fallback={<div className="mx-auto max-w-3xl px-6 py-16 text-center">Chargement…</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
