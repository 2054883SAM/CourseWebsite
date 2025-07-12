"use client";

import { useEffect } from 'react';
import { setupErrorSuppression } from '@/lib/utils/errorHandling';

/**
 * A component that suppresses specific errors globally
 * This is a client component that runs only in the browser
 */
export default function ErrorSuppressor() {
  useEffect(() => {
    // Set up error suppression
    const cleanup = setupErrorSuppression();
    
    // Clean up when component unmounts
    return cleanup;
  }, []);
  
  // This component doesn't render anything
  return null;
} 