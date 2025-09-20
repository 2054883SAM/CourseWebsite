'use client';

import { useNavigation } from '@/lib/navigation/NavigationContext';
import { ReactNode } from 'react';

interface NavigationWrapperProps {
  children: ReactNode;
}

export function NavigationWrapper({ children }: NavigationWrapperProps) {
  const { shouldShowContent } = useNavigation();

  if (!shouldShowContent) {
    return null; // Ne rien afficher pendant la navigation
  }

  return <>{children}</>;
}
