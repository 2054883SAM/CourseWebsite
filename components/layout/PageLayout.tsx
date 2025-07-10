import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { MainContent } from './MainContent';
import { SkipToContent } from './SkipToContent';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  withPadding?: boolean;
  withFooter?: boolean;
}

export function PageLayout({
  children,
  className = '',
  maxWidth = 'xl',
  withPadding = true,
  withFooter = true,
}: PageLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <SkipToContent />
      <Header />
      <MainContent 
        maxWidth={maxWidth} 
        withPadding={withPadding}
        id="main-content"
      >
        {children}
      </MainContent>
      {withFooter && <Footer />}
    </div>
  );
} 