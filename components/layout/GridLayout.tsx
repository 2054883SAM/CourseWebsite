import { ReactNode } from 'react';

interface GridLayoutProps {
  children: ReactNode;
  className?: string;
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: string;
}

export function GridLayout({
  children,
  className = '',
  columns = {
    default: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 4,
    '2xl': 4,
  },
  gap = 'gap-4 sm:gap-6 lg:gap-8',
}: GridLayoutProps) {
  // Build grid template columns CSS
  const gridCols = [
    `grid-cols-${columns.default || 1}`,
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
    columns['2xl'] && `2xl:grid-cols-${columns['2xl']}`,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={`grid ${gridCols} ${gap} ${className}`}>{children}</div>;
} 