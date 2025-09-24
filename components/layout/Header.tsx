'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from './Container';
import { ActiveLink } from './ActiveLink';
import { NavigationLink } from '@/components/navigation/NavigationLink';
import { CoursesMenu } from '@/components/navigation/CoursesMenu';
import { Logo } from './Logo';
import { DropdownMenu } from './DropdownMenu';
import { DropdownMenuItem } from './DropdownMenuItem';
import { useAuth } from '@/lib/auth/AuthContext';
import CreateVideoButton from '@/app/video-player/CreateVideoButton';
import { useRouter } from 'next/navigation';

const navigation = [
  { name: 'Accue', href: '/' },
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

    // Add "Membership" for users not signed in or students with free membership
    if (!user || (dbUser?.role === 'student' && dbUser?.membership === 'free')) {
      if (!baseItems.some((item) => item.href === '/payment')) {
        baseItems.push({ name: 'Abonnement', href: '/payment' });
      }
    }

    return baseItems;
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm transition-all duration-300 ${
        isScrolled ? 'shadow-lg' : ''
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
              {getNavItems().map((item) => {
                // Use CoursesMenu for the "Cours" item
                if (item.name === 'Cours') {
                  return <CoursesMenu key={item.name} />;
                }
                return (
                  <NavigationLink
                    key={item.name}
                    href={item.href}
                    className="font-medium text-[#1D4ED8] decoration-2 underline-offset-4 transition-colors duration-200 hover:text-blue-700 hover:underline"
                  >
                    {item.name}
                  </NavigationLink>
                );
              })}
              {/* Ajout du bouton Créer une vidéo pour admin/creator */}
              <CreateVideoButton />
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <DropdownMenu
                  trigger={
                    <button
                      type="button"
                      className="flex items-center text-gray-700 transition-colors duration-200 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                      aria-label="Menu utilisateur"
                      aria-haspopup="true"
                    >
                      <span className="sr-only">Ouvrir le menu utilisateur</span>
                      <div className="relative">
                        {dbUser?.photo_url ? (
                          <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-blue-300 transition-colors duration-200 hover:border-blue-500 dark:border-blue-600 dark:hover:border-blue-400">
                            <Image
                              src={dbUser.photo_url}
                              alt={`Photo de profil de ${dbUser.name}`}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-300 bg-gradient-to-br from-blue-100 to-blue-200 transition-colors duration-200 hover:border-blue-500 dark:border-blue-600 dark:from-blue-900 dark:to-blue-800 dark:hover:border-blue-400">
                            <span className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                              {dbUser?.name?.[0]?.toUpperCase() || 'U'}
                            </span>
                          </div>
                        )}
                        {/* Indicateur de rôle */}
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-blue-500 dark:border-black"></div>
                      </div>
                    </button>
                  }
                >
                  <div className="border-b border-gray-200 px-4 py-2 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {dbUser?.name || 'Utilisateur'}
                    </p>
                    <p className="text-xs capitalize text-gray-500 dark:text-gray-400">
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
                  {dbUser?.role === 'student' && dbUser?.membership === 'subscribed' && (
                    <DropdownMenuItem
                      onClick={async () => {
                        try {
                          const res = await fetch('/api/stripe/billing-portal', { method: 'POST' });
                          const data = await res.json();
                          if (res.ok && data.url) {
                            window.location.href = data.url as string;
                          } else {
                            console.error('Failed to create billing portal session', data?.error);
                          }
                        } catch (e) {
                          console.error('Billing portal error', e);
                        }
                      }}
                    >
                      <span className="mr-2">💳</span>
                      Abonnement
                    </DropdownMenuItem>
                  )}
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
                  <NavigationLink
                    href="/signin"
                    className="font-medium text-[#1D4ED8] transition-colors duration-200 hover:text-blue-700"
                  >
                    Se connecter
                  </NavigationLink>
                  <NavigationLink
                    href="/signup"
                    className="inline-flex h-10 items-center justify-center rounded-lg bg-[#1D4ED8] px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    S&apos;inscrire
                  </NavigationLink>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="ml-4 text-gray-700 transition-colors duration-200 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              <span className="sr-only">
                {mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              </span>
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
        className={`fixed inset-0 z-50 transform bg-white transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!mobileMenuOpen}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-menu-title"
      >
        <div className="flex items-center justify-between border-b border-blue-200 p-4 dark:border-blue-800">
          <div className="flex items-center space-x-3">
            {user && (
              <>
                {dbUser?.photo_url ? (
                  <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-blue-300 dark:border-blue-600">
                    <Image
                      src={dbUser.photo_url}
                      alt={`Photo de profil de ${dbUser.name}`}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-300 bg-gradient-to-br from-blue-100 to-blue-200 dark:border-blue-600 dark:from-blue-900 dark:to-blue-800">
                    <span className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                      {dbUser?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {dbUser?.name || 'Utilisateur'}
                  </p>
                  <p className="text-xs capitalize text-gray-500 dark:text-gray-400">
                    {dbUser?.role || 'student'}
                  </p>
                </div>
              </>
            )}
          </div>
          <button
            type="button"
            className="text-gray-700 transition-colors duration-200 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
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
              <NavigationLink
                key={item.name}
                href={item.href}
                className="block border-b border-gray-200 py-3 text-base font-medium text-[#1D4ED8] transition-colors duration-200 hover:text-blue-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </NavigationLink>
            ))}
            {user && (
              <>
                <NavigationLink
                  href="/profile"
                  className="block border-b border-blue-200 py-3 text-base font-medium text-gray-900 transition-colors duration-200 dark:border-blue-800 dark:text-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  👤 Mon Profil
                </NavigationLink>
                <NavigationLink
                  href="/settings"
                  className="block border-b border-blue-200 py-3 text-base font-medium text-gray-900 transition-colors duration-200 dark:border-blue-800 dark:text-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ⚙️ Paramètres
                </NavigationLink>
              </>
            )}
          </div>
          {!user ? (
            <div className="mt-8 space-y-4">
              <NavigationLink
                href="/signin"
                className="flex h-12 w-full items-center justify-center rounded-lg border border-[#1D4ED8] px-4 text-sm font-semibold text-[#1D4ED8] transition-all duration-300 hover:bg-[#1D4ED8] hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Se connecter
              </NavigationLink>
              <NavigationLink
                href="/signup"
                className="flex h-12 w-full items-center justify-center rounded-lg bg-[#1D4ED8] px-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-blue-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                S&apos;inscrire
              </NavigationLink>
            </div>
          ) : (
            <div className="mt-8">
              <button
                onClick={() => {
                  signOut().then(() => {
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
