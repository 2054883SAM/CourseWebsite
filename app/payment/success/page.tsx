'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PaymentSuccessPage() {
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
    <div className="mx-auto max-w-3xl px-6 py-16 text-center">
      <div className="mx-auto mb-6 h-12 w-12 rounded-full bg-green-100 p-3">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-green-600">
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h1 className="text-3xl font-semibold">Paiement réussi</h1>
      <p className="mt-2 text-gray-600">
        Votre abonnement est actif. Profitez d'un accès illimité à tous les cours.
      </p>

      {confirming && <p className="mt-4 text-sm text-gray-500">Activation de votre abonnement…</p>}
      {enrolling && <p className="mt-2 text-sm text-gray-500">Inscription au cours…</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-8 flex items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
        >
          Accueil
        </Link>
        <Link
          href="/my-learning"
          className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Commencer à apprendre
        </Link>
      </div>
    </div>
  );
}
