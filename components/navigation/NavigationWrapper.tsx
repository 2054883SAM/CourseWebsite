'use client';

import { useNavigation } from '@/lib/navigation/NavigationContext';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface NavigationWrapperProps {
  children: ReactNode;
}

export function NavigationWrapper({ children }: NavigationWrapperProps) {
  const { shouldShowContent } = useNavigation();
  const pathname = usePathname();

  // Afficher le contenu si la navigation est vers la même page (seulement des query params changent)
  if (!shouldShowContent) {
    return null; // Ne rien afficher pendant la navigation
  }

  return <>{children}</>;
}
