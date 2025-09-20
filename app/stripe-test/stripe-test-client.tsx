'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

export default function StripeTestClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!process.env.STRIPE_PUBLISHABLE_KEY) {
        setError('Missing STRIPE_PUBLISHABLE_KEY');
        setLoading(false);
        return;
      }

      const stripe = await loadStripe(process.env.STRIPE_PUBLISHABLE_KEY);
      if (!stripe) {
        setError('Failed to initialize Stripe.js');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: process.env.STRIPE_TEST_PRICE_ID }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to create session');
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url as string;
        return;
      }

      const result = await stripe.redirectToCheckout({ sessionId: data.id });
      if (result.error) {
        setError(result.error.message || 'Redirect failed');
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-lg font-semibold">Start Test Subscription</h2>
      <p className="mb-4 text-sm text-gray-600">
        Uses Stripe sandbox mode automatically when you use test keys.
      </p>
      <button
        disabled={loading}
        onClick={handleSubscribe}
        className={`rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 ${loading ? 'opacity-60' : ''}`}
      >
        {loading ? 'Creating session…' : 'Subscribe (Test)'}
      </button>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <div className="mt-6 rounded border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
        <p>
          Use Stripe test card 4242 4242 4242 4242, any future date, any CVC. Subscriptions will
          trigger test webhooks if configured.
        </p>
      </div>
    </div>
  );
}
