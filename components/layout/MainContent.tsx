import { ReactNode } from 'react';
import { Container } from './Container';

interface MainContentProps {
  children: ReactNode;
  className?: string;
  withContainer?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  withPadding?: boolean;
  id?: string;
}

export function MainContent({
  children,
  className = '',
  withContainer = true,
  maxWidth = 'xl',
  withPadding = true,
  id,
}: MainContentProps) {
  const content = withContainer ? (
    <Container maxWidth={maxWidth}>{children}</Container>
  ) : (
    children
  );

  return (
    <main
      id={id}
      className={`flex-grow ${
        withPadding ? 'py-8 md:py-12 lg:py-16' : ''
      } ${className}`}
      tabIndex={-1}
    >
      {content}
    </main>
  );
} 