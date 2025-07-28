import { ReactNode } from 'react';
import { Footer } from './Footer';
import { MainContent } from './MainContent';


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
    <div className={`flex min-h-screen flex-col ${className}`}>
      <MainContent maxWidth={maxWidth} withPadding={withPadding} id="main-content">
        {children}
      </MainContent>
      {withFooter && <Footer />}
    </div>
  );
}
