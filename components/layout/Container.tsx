import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  as?: React.ElementType;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

const paddingClasses = {
  sm: 'px-4 sm:px-6 lg:px-8',
  md: 'px-4 sm:px-6 lg:px-8',
  lg: 'px-4 sm:px-6 lg:px-8',
  xl: 'px-4 sm:px-6 lg:px-8',
  '2xl': 'px-4 sm:px-6 lg:px-8',
  '7xl': 'px-4 sm:px-6 lg:px-12 xl:px-16',
  full: 'px-4 sm:px-6 lg:px-8',
};

export function Container({
  children,
  className = '',
  as: Component = 'div',
  maxWidth = 'xl',
}: ContainerProps) {
  return (
    <Component
      className={`mx-auto w-full ${paddingClasses[maxWidth]} ${maxWidthClasses[maxWidth]} ${className}`}
    >
      {children}
    </Component>
  );
} 