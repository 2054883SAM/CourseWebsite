'use client';

import { Squares2X2Icon as ViewGridIcon, Bars4Icon as ViewListIcon } from '@heroicons/react/24/outline';

interface ViewToggleProps {
  currentView: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

export default function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center rounded-lg bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg overflow-hidden">
      <button
        type="button"
        className={`relative p-3 transition-all duration-200 ${
          currentView === 'grid'
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
        onClick={() => onViewChange('grid')}
        aria-label="Vue en grille"
        aria-pressed={currentView === 'grid'}
      >
        <ViewGridIcon className="h-5 w-5" />
      </button>
      <button
        type="button"
        className={`relative p-3 transition-all duration-200 ${
          currentView === 'list'
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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