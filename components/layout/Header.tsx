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

const navigation = [
  { name: 'Accueil', href: '/' },
  { name: 'Cours', href: '/courses' },
  { name: 'À propos', href: '/about' },
];

export function Header() {
  const { user, dbUser, signOut } = useAuth();
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

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 shadow-lg backdrop-blur-sm dark:bg-gray-900/90'
          : 'bg-white dark:bg-gray-900'
      }`}
      role="banner"
    >
      <Container>
        <nav className="flex items-center justify-between py-4" aria-label="Main navigation">
          <div className="flex items-center">
            <Logo className="text-gray-900 dark:text-white" />
          </div>

          {/* Desktop navigation */}
          <div className="hidden items-center space-x-8 md:flex">
            <div className="flex items-center space-x-6">
              {navigation.map((item) => (
                <ActiveLink
                  key={item.name}
                  href={item.href}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
                  activeClassName="text-blue-600 dark:text-blue-400 font-medium"
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
                      className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
                      aria-label="Menu utilisateur"
                      aria-haspopup="true"
                    >
                      <span className="sr-only">Ouvrir le menu utilisateur</span>
                      <div className="relative">
                        {dbUser?.photo_url ? (
                          <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors duration-200">
                            <Image
                              src={dbUser.photo_url}
                              alt={`Photo de profil de ${dbUser.name}`}
                              width={40}
                              height={40}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors duration-200">
                            <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                              {dbUser?.name?.[0]?.toUpperCase() || 'U'}
                            </span>
                          </div>
                        )}
                        {/* Indicateur de rôle */}
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white dark:border-gray-900"></div>
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
                  <DropdownMenuItem onClick={signOut}>
                    <span className="mr-2">🚪</span>
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/signin"
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
                  >
                    Se connecter
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 text-sm font-semibold text-white transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    S'inscrire
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
              className="ml-4 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
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
        className={`fixed inset-0 z-50 transform bg-white transition-transform duration-300 ease-in-out dark:bg-gray-900 md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!mobileMenuOpen}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-menu-title"
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            {user && (
              <>
                {dbUser?.photo_url ? (
                  <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600">
                    <Image
                      src={dbUser.photo_url}
                      alt={`Photo de profil de ${dbUser.name}`}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 border-2 border-gray-200 dark:border-gray-600">
                    <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
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
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
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
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block border-b border-gray-200 py-3 text-base font-medium text-gray-900 dark:border-gray-800 dark:text-gray-100 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {user && (
              <>
                <Link
                  href="/profile"
                  className="block border-b border-gray-200 py-3 text-base font-medium text-gray-900 dark:border-gray-800 dark:text-gray-100 transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  👤 Mon Profil
                </Link>
                <Link
                  href="/settings"
                  className="block border-b border-gray-200 py-3 text-base font-medium text-gray-900 dark:border-gray-800 dark:text-gray-100 transition-colors duration-200"
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
                className="flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 text-sm font-semibold text-white transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Se connecter
              </Link>
              <Link
                href="/signup"
                className="flex h-12 w-full items-center justify-center rounded-full border-2 border-gray-300 px-4 text-sm font-semibold text-gray-700 transition-all duration-300 hover:border-blue-500 hover:text-blue-600 dark:border-gray-600 dark:text-gray-300 dark:hover:border-blue-400 dark:hover:text-blue-400"
                onClick={() => setMobileMenuOpen(false)}
              >
                S'inscrire
              </Link>
            </div>
          ) : (
            <div className="mt-8">
              <button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
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
