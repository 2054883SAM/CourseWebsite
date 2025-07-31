// Server Component
import { ConfigDisplay } from '@/app/payment-test/config-display';
import { ReactElement } from 'react';

// Remove async keyword since we don't need it
export default function PaddleConfigCheck(): ReactElement {
  // Check for environment variables on the server
  const envCheck = {
    PADDLE_SELLER_ID: process.env.PADDLE_SELLER_ID ? true : false,
    NEXT_PUBLIC_PADDLE_SANDBOX_MODE: process.env.NEXT_PUBLIC_PADDLE_SANDBOX_MODE ? true : false,
    PADDLE_API_KEY: process.env.PADDLE_API_KEY ? true : false,
    PADDLE_WEBHOOK_SECRET: process.env.PADDLE_WEBHOOK_SECRET ? true : false
  };

  // Count missing variables
  const missingCount = Object.values(envCheck).filter(val => !val).length;
  
  // Pass just the env status data to the client component
  return <ConfigDisplay 
    envStatus={envCheck} 
    missingCount={missingCount} 
  />;
} 