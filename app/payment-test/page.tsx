import PaddleConfigCheck from './config-check';
import { PaymentTestClient } from './payment-test-client';

// This is now a server component (no 'use client' directive)
export default function PaymentTestPage() {
  const productId = 'pri_01k0pmhq28af1b3wgh4p9cmmcm';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Paddle Payment Test</h1>

      {/* Client component for interactive elements */}
      <PaymentTestClient productId={productId} />

      {/* Server component for configuration checking */}
      <PaddleConfigCheck />
    </div>
  );
}
