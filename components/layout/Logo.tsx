'use client';

import Link from 'next/link';
import { useNavigation } from '@/lib/navigation/NavigationContext';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  customSize?: string;
}

export function Logo({ className = '', size = 'md', customSize }: LogoProps) {
  const { isNavigating, startNavigation } = useNavigation();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    startNavigation('/');
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return { icon: 'h-6 w-6', text: 'text-sm', iconInner: 'h-3 w-3', textSize: 'text-sm' };
      case 'lg':
        return { icon: 'h-16 w-16', text: 'text-2xl', iconInner: 'h-8 w-8', textSize: 'text-2xl' };
      case 'xl':
        return { icon: 'h-24 w-24', text: 'text-4xl', iconInner: 'h-12 w-12', textSize: 'text-4xl' };
      case 'custom':
        return { 
          icon: customSize ? `h-[${customSize}] w-[${customSize}]` : 'h-10 w-10',
          text: customSize ? `text-[${customSize}]` : 'text-xl',
          iconInner: customSize ? `h-[calc(${customSize}/2)] w-[calc(${customSize}/2)]` : 'h-5 w-5',
          textSize: customSize ? `text-[${customSize}]` : 'text-xl'
        };
      default: // md
        return { icon: 'h-10 w-10', text: 'text-xl', iconInner: 'h-5 w-5', textSize: 'text-xl' };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <Link href="/" className={`flex items-center space-x-3 ${className}`} onClick={handleClick}>
      <div className={`relative flex ${sizeClasses.icon} items-center justify-center rounded-lg bg-[#1D4ED8] text-white`}>
        {isNavigating ? (
          <div className={`${sizeClasses.iconInner} animate-spin rounded-full border-2 border-white border-t-transparent`}></div>
        ) : (
          <span className={`${sizeClasses.text} font-bold`}>E</span>
        )}
      </div>
      <span className={`${sizeClasses.textSize} font-bold text-gray-900`}>
        EduKids Academy
      </span>
    </Link>
  );
} 