import StripeTestClient from './stripe-test-client';

export default function StripeTestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Stripe Subscription Test</h1>
      <p className="mb-4 text-sm text-gray-600">
        This page will create a sandbox Checkout session for a recurring subscription using your
        configured test price ID.
      </p>
      <StripeTestClient />
    </div>
  );
}


