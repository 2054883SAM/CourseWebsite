'use client';

import { ThemeProvider } from '../components/layout';
import { Header } from '@/components/layout/Header';
import ErrorSuppressor from '@/components/ErrorSuppressor';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { NavigationProvider } from '@/lib/navigation/NavigationContext';
import { NavigationWrapper } from '@/components/navigation/NavigationWrapper';
import Script from 'next/script';
// Import diagnostics script
import '../lib/utils/vdoPlayerDiagnostics';

export default function RootLayoutClient({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <NavigationProvider>
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
                script.src = 'https://player.vdocipher.com/v2/api.js';
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
            <NavigationWrapper>
              {children}
            </NavigationWrapper>
          </main>
        </div>
        </ThemeProvider>
      </NavigationProvider>
    </AuthProvider>
  );
}
