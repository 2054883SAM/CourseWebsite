import { ReactNode } from 'react';
import { Container } from './Container';

interface SectionProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  withContainer?: boolean;
  as?: React.ElementType;
  id?: string;
}

export function Section({
  children,
  className = '',
  maxWidth = 'xl',
  withContainer = true,
  as: Component = 'section',
  id,
}: SectionProps) {
  const sectionContent = withContainer ? (
    <Container maxWidth={maxWidth}>{children}</Container>
  ) : (
    children
  );

  return (
    <Component id={id} className={`py-8 md:py-12 lg:py-16 ${className}`}>
      {sectionContent}
    </Component>
  );
} 