'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface NavigationContextType {
  isNavigating: boolean;
  startNavigation: (href: string) => void;
  completeNavigation: () => void;
  shouldShowContent: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [shouldShowContent, setShouldShowContent] = useState(true);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const startNavigation = useCallback(
    (href: string) => {
      if (href === pathname) return; // Ne pas naviguer si on est déjà sur la même page

      // Extraire uniquement le pathname (sans query ni hash) pour la comparaison
      const targetPathname = href.startsWith('/')
        ? href.split('?')[0]
        : (() => {
            try {
              return new URL(href, window.location.origin).pathname;
            } catch {
              return href;
            }
          })();

      setIsNavigating(true);
      setPendingPath(targetPathname);
      setShouldShowContent(false); // Cacher le contenu de la page actuelle

      // Utiliser router.push pour la navigation
      router.push(href);
    },
    [router, pathname]
  );

  const completeNavigation = useCallback(() => {
    setIsNavigating(false);
    setPendingPath(null);
    setShouldShowContent(true);
  }, []);

  // Détecter quand la navigation est terminée
  useEffect(() => {
    if (isNavigating && pendingPath && pathname === pendingPath) {
      // La page a changé, attendre un peu pour que le contenu se charge
      const timer = setTimeout(() => {
        completeNavigation();
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [pathname, isNavigating, pendingPath, completeNavigation]);

  return (
    <NavigationContext.Provider
      value={{ isNavigating, startNavigation, completeNavigation, shouldShowContent }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
