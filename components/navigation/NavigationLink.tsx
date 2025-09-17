'use client';

import Link from 'next/link';
import { useNavigation } from '@/lib/navigation/NavigationContext';
import { ReactNode } from 'react';

interface NavigationLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
  onClick?: () => void;
}

export function NavigationLink({ 
  href, 
  children, 
  className = '', 
  activeClassName = '',
  onClick 
}: NavigationLinkProps) {
  const { startNavigation } = useNavigation();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Exécuter le onClick personnalisé s'il existe
    if (onClick) {
      onClick();
    }
    
    // Démarrer la navigation
    startNavigation(href);
  };

  return (
    <Link
      href={href}
      className={className}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
