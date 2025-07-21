"use client";

import React, { useEffect, useState } from "react";
import { loadPaddleJs } from "@/lib/paddle";

// Props for the client component
interface PaymentTestClientProps {
  productId: string;
}

export function PaymentTestClient({ productId }: PaymentTestClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paddleLoaded, setPaddleLoaded] = useState(false);

  // Load Paddle.js when component mounts
  useEffect(() => {
    // Define a function to load and initialize Paddle
    const initializePaddle = async () => {
      return new Promise((resolve, reject) => {
        // Check if Paddle is already loaded
        if (window.Paddle) {
          console.log('Paddle already loaded');
          resolve(window.Paddle);
          return;
        }

        // Create and append the script
        const script = document.createElement('script');
        script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
        script.async = true;
        script.defer = true;

        script.onload = () => {
          console.log('Paddle script loaded');
          resolve(window.Paddle);
        };

        script.onerror = () => {
          console.error('Failed to load Paddle script');
          reject(new Error('Failed to load Paddle script'));
        };

        document.head.appendChild(script);
      });
    };

    // Function to configure Paddle after it's loaded
    const setupPaddle = async () => {
      try {
        // Load Paddle script and wait for it
        await initializePaddle();

        if (!window.Paddle) {
          console.error('Paddle failed to initialize - window.Paddle is undefined');
          return;
        }

        console.log('Setting up Paddle');

        // Set environment to sandbox if needed
        const isSandbox = process.env.NEXT_PUBLIC_PADDLE_SANDBOX_MODE === 'true';
        if (isSandbox) {
          console.log('Setting sandbox environment');
          window.Paddle.Environment.set('sandbox');
        }

        // Hard-coding sellerId for reliability
        const sellerId = Number(34619); // Your seller ID from .env
        
        console.log('Initializing Paddle with seller ID:', sellerId);

        // Initialize Paddle
        window.Paddle.Initialize({
          seller: sellerId
        });

        console.log('Paddle setup complete');
        setPaddleLoaded(true);
      } catch (error) {
        console.error('Error setting up Paddle:', error);
      }
    };

    // Run the setup
    setupPaddle();

    // Cleanup function
    return () => {
      // Nothing to clean up
    };
  }, []);

  // Handle opening the checkout
  const openCheckout = () => {
    setIsLoading(true);
    
    // Check if Paddle is loaded
    if (typeof window !== "undefined" && window.Paddle) {
      try {
        // Log the product ID to verify it's not undefined
        console.log("Opening checkout with product ID:", productId);
        
        // @ts-ignore - Paddle is loaded via script tag
        window.Paddle.Checkout.open({
          settings: {
            displayMode: 'overlay',
            theme: 'light'
          },
          items: [{
            priceId: productId,
            quantity: 1
          }],
          onComplete: (data: any) => {
            console.log("Payment successful", data);
            alert("Payment successful! Check console for details.");
            setIsLoading(false);
          },
          onClose: () => {
            console.log("Checkout was closed");
            setIsLoading(false);
          },
        });
        
      } catch (error) {
        console.error("Error opening checkout:", error);
        alert("Error opening checkout. See console for details.");
        setIsLoading(false);
      }
    } else {
      console.error("Paddle is not loaded");
      alert("Payment system is not loaded. Please check your browser console for details.");
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Test Product Checkout</h2>
        <p className="mb-4">
          This page allows you to test the Paddle V2 API integration by purchasing
          a test product.
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Product ID: <code className="bg-gray-100 px-1 py-0.5 rounded">{productId}</code>
        </p>
        <p className="text-sm text-gray-600 mb-6">
          <strong>Note:</strong> Make sure your Paddle environment variables are properly set in <code className="bg-gray-100 px-1 py-0.5 rounded">.env</code>. 
          For testing, you can use Paddle&apos;s test card: 4242 4242 4242 4242, any future expiry date, and any CVC.
        </p>
        <div className="flex items-center space-x-3">
          <button
            onClick={openCheckout}
            disabled={isLoading}
            className={`bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? "Loading..." : "Open Checkout"}
          </button>
          {!paddleLoaded && (
            <p className="text-sm text-amber-600">
              <span className="inline-block animate-pulse mr-2">⚠️</span>
              Paddle.js is still loading...
            </p>
          )}
        </div>
      </div>
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-medium text-yellow-800 mb-2">Testing Instructions</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
          <li>This page tests the Paddle V2 API integration from task 8.1.</li>
          <li>The checkout button will open a Paddle checkout overlay.</li>
          <li>For sandbox testing, use Paddle&apos;s test payment details.</li>
          <li>After successful payment, check browser console for response data.</li>
          <li>Webhooks should be configured to handle subscription events.</li>
        </ul>
      </div>
    </>
  );
}

// Add TypeScript declaration for Paddle
declare global {
  interface Window {
    Paddle: any;
  }
} 