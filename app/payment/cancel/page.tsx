import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-center">
      <div className="mx-auto mb-6 h-12 w-12 rounded-full bg-yellow-100 p-3">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-yellow-600">
          <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h1 className="text-3xl font-semibold">Payment canceled</h1>
      <p className="mt-2 text-gray-600">No charges were made. You can try again anytime.</p>
      <div className="mt-8 flex items-center justify-center gap-3">
        <Link href="/payment" className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">Try again</Link>
        <Link href="/" className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">Go home</Link>
      </div>
    </div>
  );
}


