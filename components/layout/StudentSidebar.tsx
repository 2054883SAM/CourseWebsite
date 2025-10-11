'use client';

import React, { useState } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
// Don't use NavigationLink as it causes a full page reload
import Link from 'next/link';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

export function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = searchParams.get('page') || 'dashboard';
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isUserHovered, setIsUserHovered] = useState(false);
  const { user, dbUser } = useAuth();

  // Handle navigation without page reload
  const handleNavigation = (page: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/learning?page=${page}`);
  };

  const navigation: NavItem[] = [
    {
      name: 'Tableau de bord',
      href: '/learning?page=dashboard',
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
      name: 'Mes formations',
      href: '/learning?page=my-learning',
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
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`lg:hidden fixed top-20 z-50 p-3 rounded-xl bg-white/95 backdrop-blur-md border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 dark:bg-gray-800/95 dark:border-gray-700/20 ${isCollapsed ? 'left-[88px]' : 'left-4'}`}
      >
        <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <div className={`
        fixed lg:sticky top-16 z-30 flex h-[calc(100vh-4rem)] flex-col items-center border-r border-white/20 bg-white/95 lg:backdrop-blur-md py-6 shadow-2xl dark:border-gray-700/20 dark:bg-gray-800/95 transition-all duration-500 ease-in-out
        w-20
        lg:translate-x-0
        ${isCollapsed ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        {/* Toggle Button for Desktop */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex mb-8 p-2.5 rounded-xl bg-gradient-to-r from-gray-100/80 to-gray-200/80 hover:from-gray-200/80 hover:to-gray-300/80 dark:from-gray-700/80 dark:to-gray-600/80 dark:hover:from-gray-600/80 dark:hover:to-gray-500/80 transition-all duration-300 hover:scale-105 shadow-lg"
        >
          <div className="relative w-4 h-4">
            {/* Œil ouvert - visible quand collapsed (texte caché) */}
            <svg className={`absolute inset-0 w-4 h-4 text-gray-700 dark:text-gray-300 transition-all duration-500 ${isCollapsed ? 'opacity-100' : 'opacity-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            
            {/* Œil fermé - visible quand expanded (texte visible) */}
            <svg className={`absolute inset-0 w-4 h-4 text-gray-700 dark:text-gray-300 transition-all duration-500 ${!isCollapsed ? 'opacity-100' : 'opacity-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12s1.5-4 8-4 8 4 8 4-1.5 4-8 4-8-4-8-4z" />
            </svg>
          </div>
        </button>

        <nav className="flex flex-col items-center space-y-3 w-full px-3">
          {navigation.map((item) => {
            // Check if this is the active link based on the page parameter
            const itemPage = item.href.includes('?page=')
              ? item.href.split('?page=')[1]
              : 'dashboard';

            const isActive = pathname === '/learning' && currentPage === itemPage;
            const isHovered = hoveredItem === item.name;

            // Extract the page parameter from the href
            const page = itemPage;

            return (
              <div key={item.name} className="relative w-full">
                {/* Tooltip for collapsed state */}
                {isCollapsed && isHovered && (
                  <div className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 z-50 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg shadow-xl whitespace-nowrap">
                    {item.name}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                )}

                <a
                  href={item.href}
                  onClick={handleNavigation(page)}
                  onMouseEnter={() => setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`group relative flex items-center justify-center rounded-2xl p-4 text-center transition-all duration-500 ease-out w-full flex-col`}
                >
                  <div className={`transition-all duration-500 mb-2 ${isActive ? 'scale-[1.3] text-blue-500 font-bold' : 'group-hover:scale-110 text-gray-700 dark:text-gray-300'}`}>
                    {item.icon}
                  </div>
                  <span className={`leading-tight transition-all duration-950 overflow-hidden break-words text-center ${
                    isActive ? 'font-bold' : ''
                  } ${
                    isCollapsed ? 'text-xs max-h-10 opacity-100 lg:max-h-0 lg:opacity-0' : 'text-sm lg:text-xs max-h-10 opacity-100'
                  }`}>
                    {item.name}
                  </span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 h-10 w-1.5 rounded-l-full bg-gradient-to-b from-blue-500 via-blue-600 to-indigo-600 dark:from-blue-400 dark:via-blue-500 dark:to-indigo-500 shadow-lg"></div>
                  )}

                  {/* Hover glow effect */}
                  {isHovered && !isActive && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-600/10 animate-pulse"></div>
                  )}
                </a>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto mb-6">
          <div className="text-center">
            <button
              onClick={() => router.push('/profile')}
              onMouseEnter={() => setIsUserHovered(true)}
              onMouseLeave={() => setIsUserHovered(false)}
              className={`mx-auto mb-3 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg overflow-hidden hover:shadow-xl hover:scale-110 transition-all duration-300 cursor-pointer group relative ${
                isCollapsed ? 'w-10 h-10' : 'w-12 h-12'
              }`}
            >
              {user?.user_metadata?.avatar_url || dbUser?.photo_url ? (
                <img 
                  src={user?.user_metadata?.avatar_url || dbUser?.photo_url} 
                  alt="Photo de profil" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <svg className={`text-white group-hover:scale-110 transition-transform duration-300 ${
                  isCollapsed ? 'w-5 h-5' : 'w-6 h-6'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
              
              {/* Hover glow effect */}
              {isUserHovered && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-600/20 animate-pulse"></div>
              )}
            </button>
            <p className={`text-xs text-gray-500 dark:text-gray-400 font-medium transition-all duration-950 overflow-hidden ${
              isCollapsed ? 'opacity-100 lg:opacity-0' : 'opacity-100'
            }`}>
              {user?.user_metadata?.full_name || dbUser?.name || 'Étudiant'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
