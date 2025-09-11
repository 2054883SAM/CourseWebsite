'use client';

import Link from 'next/link';
import { CourseCategory } from '@/types/supabase';

interface CategoryGridViewProps {
  categories: { categorie: string; count: number }[];
}

// Category icons mapping
const getCategoryIcon = (category: string): string => {
  switch (category) {
    case 'Français':
      return '📚';
    case 'Mathématiques':
      return '🔢';
    case 'Science et technologie':
      return '🔬';
    case 'Géographie et histoire':
      return '🌍';
    case 'Culture et citoyenneté québécoise':
      return '🍁';
    default:
      return '📖';
  }
};

// Category colors mapping
const getCategoryColors = (category: string): { bg: string; border: string; text: string } => {
  switch (category) {
    case 'Français':
      return {
        bg: 'from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/30',
        border: 'border-blue-200 dark:border-blue-700',
        text: 'text-blue-900 dark:text-blue-100',
      };
    case 'Mathématiques':
      return {
        bg: 'from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/30',
        border: 'border-green-200 dark:border-green-700',
        text: 'text-green-900 dark:text-green-100',
      };
    case 'Science et technologie':
      return {
        bg: 'from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/30',
        border: 'border-purple-200 dark:border-purple-700',
        text: 'text-purple-900 dark:text-purple-100',
      };
    case 'Géographie et histoire':
      return {
        bg: 'from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/30',
        border: 'border-orange-200 dark:border-orange-700',
        text: 'text-orange-900 dark:text-orange-100',
      };
    case 'Culture et citoyenneté québécoise':
      return {
        bg: 'from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-900/30',
        border: 'border-red-200 dark:border-red-700',
        text: 'text-red-900 dark:text-red-100',
      };
    default:
      return {
        bg: 'from-gray-50 to-slate-100 dark:from-gray-900/20 dark:to-slate-900/30',
        border: 'border-gray-200 dark:border-gray-700',
        text: 'text-gray-900 dark:text-gray-100',
      };
  }
};

export function CategoryGridView({ categories }: CategoryGridViewProps) {
  if (categories.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <span className="text-3xl">📚</span>
        </div>
        <h3 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
          Aucune catégorie disponible
        </h3>
        <p className="mx-auto max-w-md text-gray-600 dark:text-gray-400">
          Il n&apos;y a actuellement aucune catégorie de cours disponible.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => {
        const colors = getCategoryColors(category.categorie);
        const icon = getCategoryIcon(category.categorie);

        return (
          <Link
            key={category.categorie}
            href={`/courses?category=${encodeURIComponent(category.categorie)}`}
            className="group block"
          >
            <div
              className={`
              relative rounded-2xl border-2 p-8 ${colors.border}
              bg-gradient-to-br ${colors.bg}
              transition-all duration-300 ease-in-out
              group-hover:scale-105 group-hover:shadow-xl
              group-hover:shadow-gray-200/50 dark:group-hover:shadow-gray-900/30
            `}
            >
              {/* Category Icon */}
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/50 text-4xl shadow-sm transition-colors duration-300 group-hover:bg-white/70 dark:bg-gray-800/30 dark:group-hover:bg-gray-800/50">
                {icon}
              </div>

              {/* Category Title */}
              <h3
                className={`mb-3 text-center text-xl font-bold ${colors.text} transition-transform duration-300 group-hover:scale-105`}
              >
                {category.categorie}
              </h3>

              {/* Course Count */}
              <div className="text-center">
                <span
                  className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium ${colors.text} bg-white/40 transition-colors duration-300 group-hover:bg-white/60 dark:bg-gray-800/40 dark:group-hover:bg-gray-800/60`}
                >
                  {category.count} cours
                </span>
              </div>

              {/* Hover Arrow */}
              <div className="absolute right-4 top-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <svg
                  className={`h-5 w-5 ${colors.text}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
