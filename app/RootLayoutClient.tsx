'use client';

import { Inter } from 'next/font/google';
import { ThemeProvider } from '../components/layout';
import ErrorSuppressor from '@/components/ErrorSuppressor';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { supabase } from '@/lib/supabase/client';
import './globals.css';

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
        <AuthProvider supabaseClient={supabase}>
          <ThemeProvider>
            <ErrorSuppressor />
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
