'use client';

import React from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = searchParams.get('page') || 'dashboard';

  // Handle navigation without page reload
  const handleNavigation = (page: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/dashboard?page=${page}`);
  };

  const navigation: NavItem[] = [
    {
      name: 'Tableau de bord',
      href: '/dashboard?page=dashboard',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <rect width="7" height="7" x="3" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="14" rx="1" />
          <rect width="7" height="7" x="3" y="14" rx="1" />
        </svg>
      ),
    },
    {
      name: 'Utilisateurs',
      href: '/dashboard?page=users',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      name: 'Formations',
      href: '/dashboard?page=courses',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          <path d="M8 7h6" />
          <path d="M8 11h8" />
        </svg>
      ),
    },
    {
      name: 'Rapports',
      href: '/dashboard?page=reports',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
          <path d="M22 12A10 10 0 0 0 12 2v10z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="sticky top-16 z-10 flex h-[calc(100vh-4rem)] w-16 flex-col items-center border-r border-gray-200 bg-white py-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <nav className="flex flex-col items-center space-y-7">
        {navigation.map((item) => {
          // Check if this is the active link based on the page parameter
          const itemPage = item.href.includes('?page=')
            ? item.href.split('?page=')[1]
            : 'dashboard';

          const isActive = pathname === '/dashboard' && currentPage === itemPage;

          // Extract the page parameter from the href
          const page = itemPage;

          return (
            <a
              key={item.name}
              href={item.href}
              onClick={handleNavigation(page)}
              className={`group flex flex-col items-center justify-center rounded-md p-2 text-center transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
              }`}
            >
              <div className="mb-1">{item.icon}</div>
              <span className="text-xs font-medium">{item.name}</span>
              {isActive && (
                <div className="absolute -right-0 h-10 w-1 rounded-l-md bg-blue-600 dark:bg-blue-400"></div>
              )}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
