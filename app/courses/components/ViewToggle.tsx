'use client';

import { useRouter, usePathname } from 'next/navigation';
import { GridIcon, ListIcon } from './Icons';

interface ViewToggleProps {
  currentView: 'grid' | 'list';
}

export function ViewToggle({ currentView }: ViewToggleProps) {
  const router = useRouter();
  const pathname = usePathname();

  const toggleView = (view: 'grid' | 'list') => {
    // Create a URLSearchParams object from the current URL
    const searchParams = new URLSearchParams(window.location.search);
    
    // Update the 'view' parameter
    searchParams.set('view', view);
    
    // Push the new URL
    router.push(`${pathname}?${searchParams.toString()}`);
  };

  return (
    <div className="inline-flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1 shadow-sm">
      <button
        onClick={() => toggleView('grid')}
        className={`p-2 rounded-md flex items-center transition-all duration-200 ${
          currentView === 'grid'
            ? 'bg-gradient-to-r from-gray-600 to-gray-800 text-white'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        aria-label="Vue grille"
      >
        <GridIcon className="w-5 h-5" />
      </button>
      
      <button
        onClick={() => toggleView('list')}
        className={`p-2 rounded-md flex items-center transition-all duration-200 ${
          currentView === 'list'
            ? 'bg-gradient-to-r from-gray-600 to-gray-800 text-white'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        aria-label="Vue liste"
      >
        <ListIcon className="w-5 h-5" />
      </button>
    </div>
  );
} 