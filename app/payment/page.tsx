'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';

export default function PaymentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    try {
      setError(null);
      setLoading(true);

      // Create subscription checkout session
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (!res.ok || !data?.url) {
        throw new Error(data?.error || 'Failed to start checkout');
      }

      window.location.href = data.url as string;
    } catch (e: any) {
      setError(e?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Subscribe to Course Access</h1>
        <p className="mt-2 text-gray-600">Monthly membership to access all courses.</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">Monthly</div>
            <span className="text-3xl font-bold">$</span>
            <span className="text-5xl font-extrabold leading-none">50</span>
            <span className="text-gray-500">/mo</span>
          </div>
          <p className="mt-3 text-sm text-gray-600">Cancel anytime. Secured by Stripe.</p>
        </div>

        <ul className="mb-8 space-y-3 text-sm text-gray-700">
          <li className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500"></span>
            Unlimited access to all courses
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500"></span>
            New content monthly
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500"></span>
            Cancel anytime
          </li>
        </ul>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <button
          onClick={handleSubscribe}
          disabled={loading || !user}
          className="inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2.5 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {loading ? 'Redirecting…' : user ? 'Subscribe with Stripe' : 'Sign in to subscribe'}
        </button>

        {!user && (
          <p className="mt-3 text-xs text-gray-500">You must be signed in to subscribe.</p>
        )}
      </div>
    </div>
  );
}


