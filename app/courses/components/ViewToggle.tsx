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
    <div className="inline-flex bg-white border rounded-lg p-1 shadow-sm">
      <button
        onClick={() => toggleView('grid')}
        className={`p-2 rounded-md flex items-center ${
          currentView === 'grid'
            ? 'bg-blue-500 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        aria-label="Grid view"
      >
        <GridIcon className="w-5 h-5" />
      </button>
      
      <button
        onClick={() => toggleView('list')}
        className={`p-2 rounded-md flex items-center ${
          currentView === 'list'
            ? 'bg-blue-500 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
        aria-label="List view"
      >
        <ListIcon className="w-5 h-5" />
      </button>
    </div>
  );
} 