'use client';

import { Squares2X2Icon as ViewGridIcon, Bars4Icon as ViewListIcon } from '@heroicons/react/24/outline';

interface ViewToggleProps {
  currentView: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

export default function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm">
      <button
        type="button"
        className={`p-2 ${
          currentView === 'grid'
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
            : 'text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
        }`}
        onClick={() => onViewChange('grid')}
        aria-label="Vue en grille"
        aria-pressed={currentView === 'grid'}
      >
        <ViewGridIcon className="h-5 w-5" />
      </button>
      <button
        type="button"
        className={`p-2 ${
          currentView === 'list'
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
            : 'text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
        }`}
        onClick={() => onViewChange('list')}
        aria-label="Vue en liste"
        aria-pressed={currentView === 'list'}
      >
        <ViewListIcon className="h-5 w-5" />
      </button>
    </div>
  );
} 