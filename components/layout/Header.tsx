'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from './Container';
import { ThemeToggle } from './ThemeToggle';
import { ActiveLink } from './ActiveLink';
import { Logo } from './Logo';
import { DropdownMenu } from './DropdownMenu';
import { DropdownMenuItem } from './DropdownMenuItem';
import { useAuth } from '@/lib/auth/AuthContext';
import CreateVideoButton from '@/app/video-player/CreateVideoButton';
import { useRouter } from 'next/navigation';

const navigation = [
  { name: 'Accueil', href: '/' },
  { name: 'Cours', href: '/courses' },
];

export function Header() {
  const { user, dbUser, signOut } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Handle scroll events to change header appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when pressing Escape key
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [mobileMenuOpen]);

  // Focus trap for mobile menu
  useEffect(() => {
    if (!mobileMenuOpen || !mobileMenuRef.current) return;

    const mobileMenu = mobileMenuRef.current;
    const focusableElements = mobileMenu.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    function handleTabKey(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // If shift + tab and on first element, move to last element
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // If tab and on last element, move to first element
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }

    document.addEventListener('keydown', handleTabKey);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Get navigation items based on authentication
  const getNavItems = () => {
    const baseItems = [...navigation];
    
    // Add "My Learning" only for authenticated non-admin users with an active (subscribed) membership
    if (user && dbUser?.role !== 'admin' && dbUser?.membership === 'subscribed') {
      baseItems.splice(2, 0, { name: 'Mes formations', href: '/my-learning' });
    }
    
    // Add "Membership" for users not signed in or students with free membership
    if (!user || (dbUser?.role === 'student' && dbUser?.membership === 'free')) {
      if (!baseItems.some((item) => item.href === '/payment')) {
        baseItems.push({ name: 'Membership', href: '/payment' });
      }
    }
    
    return baseItems;
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 shadow-lg backdrop-blur-sm border-b border-gold-200 dark:bg-black/90 dark:border-gold-800'
          : 'bg-white dark:bg-black border-b border-gold-200 dark:border-gold-800'
      }`}
      role="banner"
    >
      <Container>
        <nav className="flex items-center justify-between py-4" aria-label="Main navigation">
          <div className="flex items-center">
            <Logo className="text-black dark:text-white" />
          </div>

          {/* Desktop navigation */}
          <div className="hidden items-center space-x-8 md:flex">
            <div className="flex items-center space-x-6">
              {getNavItems().map((item) => (
                <ActiveLink
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-gold-600 dark:text-gray-300 dark:hover:text-gold-400 transition-colors duration-200"
                  activeClassName="text-gold-600 dark:text-gold-400 font-medium"
                >
                  {item.name}
                </ActiveLink>
              ))}
              {/* Ajout du bouton Créer une vidéo pour admin/creator */}
              <CreateVideoButton />
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />

              {user ? (
                <DropdownMenu
                  trigger={
                    <button
                      type="button"
                      className="flex items-center text-gray-700 hover:text-gold-600 dark:text-gray-300 dark:hover:text-gold-400 transition-colors duration-200"
                      aria-label="Menu utilisateur"
                      aria-haspopup="true"
                    >
                      <span className="sr-only">Ouvrir le menu utilisateur</span>
                      <div className="relative">
                        {dbUser?.photo_url ? (
                          <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-gold-300 dark:border-gold-600 hover:border-gold-500 dark:hover:border-gold-400 transition-colors duration-200">
                            <Image
                              src={dbUser.photo_url}
                              alt={`Photo de profil de ${dbUser.name}`}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gold-100 to-gold-200 dark:from-gold-900 dark:to-gold-800 border-2 border-gold-300 dark:border-gold-600 hover:border-gold-500 dark:hover:border-gold-400 transition-colors duration-200">
                            <span className="text-lg font-semibold text-gold-700 dark:text-gold-300">
                              {dbUser?.name?.[0]?.toUpperCase() || 'U'}
                            </span>
                          </div>
                        )}
                        {/* Indicateur de rôle */}
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-gold-500 border-2 border-white dark:border-black"></div>
                      </div>
                    </button>
                  }
                >
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {dbUser?.name || 'Utilisateur'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {dbUser?.role || 'student'}
                    </p>
                  </div>
                  <DropdownMenuItem href="/profile">
                    <span className="mr-2">👤</span>
                    Mon Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem href="/settings">
                    <span className="mr-2">⚙️</span>
                    Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      signOut().then(() => {
                        router.push('/signin');
                      });
                    }}
                  >
                    <span className="mr-2">🚪</span>
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/signin"
                    className="text-gray-700 hover:text-gold-600 dark:text-gray-300 dark:hover:text-gold-400 transition-colors duration-200"
                  >
                    Se connecter
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex h-10 items-center justify-center rounded-full bg-black text-white hover:bg-gray-800 border border-gold-500 hover:border-gold-400 px-6 text-sm font-semibold transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2"
                  >
                    S&apos;inscrire
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <ThemeToggle />
            <button
              type="button"
              className="ml-4 text-gray-700 hover:text-gold-600 dark:text-gray-300 dark:hover:text-gold-400 transition-colors duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              <span className="sr-only">{mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}</span>
              {mobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </nav>
      </Container>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        ref={mobileMenuRef}
        className={`fixed inset-0 z-50 transform bg-white transition-transform duration-300 ease-in-out dark:bg-black md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!mobileMenuOpen}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-menu-title"
      >
        <div className="flex justify-between items-center p-4 border-b border-gold-200 dark:border-gold-800">
          <div className="flex items-center space-x-3">
            {user && (
              <>
                {dbUser?.photo_url ? (
                  <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-gold-300 dark:border-gold-600">
                    <Image
                      src={dbUser.photo_url}
                      alt={`Photo de profil de ${dbUser.name}`}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gold-100 to-gold-200 dark:from-gold-900 dark:to-gold-800 border-2 border-gold-300 dark:border-gold-600">
                    <span className="text-lg font-semibold text-gold-700 dark:text-gold-300">
                      {dbUser?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {dbUser?.name || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {dbUser?.role || 'student'}
                  </p>
                </div>
              </>
            )}
          </div>
          <button
            type="button"
            className="text-gray-700 hover:text-gold-600 dark:text-gray-300 dark:hover:text-gold-400 transition-colors duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Fermer le menu"
          >
            <span className="sr-only">Fermer le menu</span>
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <h2 id="mobile-menu-title" className="sr-only">
            Menu de navigation mobile
          </h2>
          <div className="space-y-1">
            {getNavItems().map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block border-b border-gold-200 py-3 text-base font-medium text-gray-900 dark:border-gold-800 dark:text-gray-100 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {user && (
              <>
                <Link
                  href="/profile"
                  className="block border-b border-gold-200 py-3 text-base font-medium text-gray-900 dark:border-gold-800 dark:text-gray-100 transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  👤 Mon Profil
                </Link>
                <Link
                  href="/settings"
                  className="block border-b border-gold-200 py-3 text-base font-medium text-gray-900 dark:border-gold-800 dark:text-gray-100 transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ⚙️ Paramètres
                </Link>
              </>
            )}
          </div>
          {!user ? (
            <div className="mt-8 space-y-4">
              <Link
                href="/signin"
                className="flex h-12 w-full items-center justify-center rounded-full bg-black text-white border border-gold-500 hover:bg-gray-800 hover:border-gold-400 px-4 text-sm font-semibold transition-all duration-300 hover:shadow-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Se connecter
              </Link>
              <Link
                href="/signup"
                className="flex h-12 w-full items-center justify-center rounded-full border-2 border-gold-300 px-4 text-sm font-semibold text-gray-700 transition-all duration-300 hover:border-gold-500 hover:text-gold-600 dark:border-gold-600 dark:text-gray-300 dark:hover:border-gold-400 dark:hover:text-gold-400"
                onClick={() => setMobileMenuOpen(false)}
              >
                S&apos;inscrire
              </Link>
            </div>
          ) : (
            <div className="mt-8">
              <button
                onClick={() => {
                  signOut()
                    .then(() => {
                      setMobileMenuOpen(false);
                      router.push('/signin');
                    });
                }}
                className="flex h-12 w-full items-center justify-center rounded-full border-2 border-red-300 px-4 text-sm font-semibold text-red-600 transition-all duration-300 hover:border-red-500 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:border-red-500 dark:hover:bg-red-900/20"
              >
                🚪 Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
