'use client';

import { Inter } from 'next/font/google';
import { ThemeProvider } from '../components/layout';
import { Header } from '@/components/layout/Header';
import ErrorSuppressor from '@/components/ErrorSuppressor';
import { AuthProvider } from '@/lib/auth/AuthContext';
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
        <AuthProvider>
          <ThemeProvider>
            <ErrorSuppressor />
            <div className="flex min-h-full flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
