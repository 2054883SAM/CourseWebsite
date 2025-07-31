"use client";

import React from "react";

// Types for our props
type EnvStatus = {
  PADDLE_SELLER_ID: boolean;
  NEXT_PUBLIC_PADDLE_SANDBOX_MODE: boolean;
  PADDLE_API_KEY: boolean;
  PADDLE_WEBHOOK_SECRET: boolean;
};

type ConfigDisplayProps = {
  envStatus: EnvStatus;
  missingCount: number;
};

// Client component that receives environment variable status from the server component
export function ConfigDisplay({ envStatus, missingCount }: ConfigDisplayProps) {
  // Determine status
  const allFound = missingCount === 0;
  const statusText = allFound 
    ? 'All Paddle environment variables found' 
    : `Missing ${missingCount} Paddle environment variables`;

  return (
    <div className="mt-4 p-4 rounded-lg border">
      <h3 className="font-semibold mb-2">Paddle Configuration Status</h3>
      <div 
        className={`px-3 py-1 rounded text-sm inline-block mb-3 ${
          allFound ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}
      >
        {statusText}
      </div>
      <ul className="space-y-1">
        {Object.entries(envStatus).map(([key, exists]) => (
          <li key={key} className="flex items-center">
            <span className={`w-4 h-4 rounded-full mr-2 ${exists ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="font-mono text-sm">{key}</span>
            {!exists && key.startsWith('NEXT_PUBLIC') && (
              <span className="ml-2 text-xs text-red-600">
                (Required for client-side checkout)
              </span>
            )}
          </li>
        ))}
      </ul>
      {!envStatus.PADDLE_SELLER_ID && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded">
          <p><strong>PADDLE_SELLER_ID is required</strong> and must be set in your .env file.</p>
          <p className="mt-1">This is causing the error: &quot;You must specify your Paddle Vendor ID within the Paddle.Setup() method.&quot;</p>
        </div>
      )}
    </div>
  );
} 