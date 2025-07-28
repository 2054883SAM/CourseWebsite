'use client';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'blue' | 'white';
}

export function LoadingSpinner({ 
  size = 'medium', 
  color = 'blue' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-2',
    large: 'h-12 w-12 border-3',
  };

  const colorClasses = {
    blue: 'border-blue-200 border-t-blue-600',
    white: 'border-gray-200/30 border-t-white',
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${colorClasses[color]}
        animate-spin rounded-full border-solid
      `}
      role="status"
      aria-label="Chargement"
    >
      <span className="sr-only">Chargement...</span>
    </div>
  );
} 