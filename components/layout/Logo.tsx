'use client';

import Link from 'next/link';
import { useNavigation } from '@/lib/navigation/NavigationContext';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  const { isNavigating, startNavigation } = useNavigation();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    startNavigation('/');
  };

  return (
    <Link href="/" className={`flex items-center space-x-3 ${className}`} onClick={handleClick}>
      <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-[#1D4ED8] text-white">
        {isNavigating ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
        ) : (
          <span className="text-xl font-bold">E</span>
        )}
      </div>
      <span className="text-xl font-bold text-gray-900">
        EduKids Academy
      </span>
    </Link>
  );
} 