'use client';

import { ReactNode } from 'react';
import { NavigationLink } from '@/components/navigation/NavigationLink';

interface DropdownMenuItemProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
  role?: string;
  tabIndex?: number;
}

export function DropdownMenuItem({
  children,
  href,
  onClick,
  isActive = false,
  role = 'menuitem',
  tabIndex = -1,
}: DropdownMenuItemProps) {
  const className = `block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700 ${
    isActive ? 'bg-gray-100 dark:bg-gray-700' : ''
  }`;

  if (href) {
    return (
      <NavigationLink 
        href={href}
        className={className}
      >
        <span role={role} tabIndex={tabIndex} aria-selected={isActive}>
          {children}
        </span>
      </NavigationLink>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      role={role}
      tabIndex={tabIndex}
      aria-selected={isActive}
    >
      {children}
    </button>
  );
} 