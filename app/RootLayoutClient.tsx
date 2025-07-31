'use client';

import { Inter } from 'next/font/google';
import { ThemeProvider } from '../components/layout';
import { Header } from '@/components/layout/Header';
import ErrorSuppressor from '@/components/ErrorSuppressor';
import { AuthProvider } from '@/lib/auth/AuthContext';
import Script from 'next/script';
import './globals.css';
// Import diagnostics script
import '../lib/utils/vdoPlayerDiagnostics';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function RootLayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth" suppressHydrationWarning>
      <body
        className={`${inter.variable} h-full bg-white font-sans text-gray-900 antialiased dark:bg-gray-900 dark:text-gray-100`}
        suppressHydrationWarning
      >

        <AuthProvider>
          <ThemeProvider>
            <ErrorSuppressor />
            <div className="flex min-h-full flex-col">
              <Header />
              <main className="flex-1">
                {/* Use the official VdoCipher API.js URL */}
                <Script
                  src="https://player.vdocipher.com/v2/api.js"
                  strategy="lazyOnload"
                  id="vdocipher-script"
                  onLoad={() => {
                    console.log('VdoCipher script loaded successfully');
                    window.vdoCipherScriptLoaded = true;
                  }}
                  onError={(e) => {
                    console.error('Failed to load VdoCipher script from CDN, trying fallback approach');
                    // Add fallback script loading approach
                    const script = document.createElement('script');
                    script.src = "https://player.vdocipher.com/v2/api.js";
                    script.async = true;
                    script.onload = () => {
                      console.log('VdoCipher script loaded successfully via fallback');
                      window.vdoCipherScriptLoaded = true;
                    };
                    script.onerror = () => {
                      console.error('Critical error: Failed to load VdoCipher script via fallback');
                    };
                    document.head.appendChild(script);
                  }}
                />
                {children}
              </main>
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
