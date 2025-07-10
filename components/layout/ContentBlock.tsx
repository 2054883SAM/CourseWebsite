import { ReactNode } from 'react';

interface ContentBlockProps {
  children: ReactNode;
  className?: string;
  as?: React.ElementType;
  variant?: 'default' | 'primary' | 'secondary' | 'card';
}

export function ContentBlock({
  children,
  className = '',
  as: Component = 'div',
  variant = 'default',
}: ContentBlockProps) {
  const variantClasses = {
    default: '',
    primary: 'bg-primary-50 dark:bg-primary-900/20',
    secondary: 'bg-gray-50 dark:bg-gray-800',
    card: 'bg-white dark:bg-gray-900 shadow-sm rounded-lg border border-gray-200 dark:border-gray-800',
  };

  return (
    <Component
      className={`${variantClasses[variant]} ${className}`}
    >
      {children}
    </Component>
  );
} 