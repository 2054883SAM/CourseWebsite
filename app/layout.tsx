import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "../components/layout";
import ErrorSuppressor from "@/components/ErrorSuppressor";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Course Website",
  description: "An online learning platform with video courses and interactive content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className={`${inter.variable} h-full antialiased font-sans bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <ErrorSuppressor />
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
