'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

interface CourseCategory {
  title: string;
  items: {
    name: string;
    href: string;
  }[];
}

const courseCategories: CourseCategory[] = [
  {
    title: 'Langues',
    items: [
      { name: 'Mathématiques', href: '/courses?category=Mathématiques' },
      { name: 'Français', href: '/courses?category=Français' },
    ],
  },
  {
    title: 'Sujets populaires',
    items: [
      { name: 'Histoire', href: '/courses?category=Histoire' },
      { name: 'Géographie', href: '/courses?category=Geographie' },
      { name: 'Écriture', href: '/courses?category=Ecriture' },
    ],
  },
];

interface CoursesMenuProps {
  className?: string;
}

export function CoursesMenu({ className = '' }: CoursesMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="flex items-center font-medium text-[#1D4ED8] decoration-2 underline-offset-4 transition-colors duration-200 hover:text-blue-700 hover:underline"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Menu des cours"
      >
        Cours
        <svg
          className={`ml-1 h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Mega Dropdown Panel */}
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute left-1/2 top-full z-50 mt-2 w-screen max-w-5xl -translate-x-1/2 transform"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="courses-menu"
        >
          <div className="rounded-xl bg-white p-6 shadow-xl ring-1 ring-gray-200">
            <div className="grid gap-8 md:grid-cols-2">
              {courseCategories.map((category) => (
                <div key={category.title} className="space-y-3">
                  <h3 className="mb-3 font-semibold text-gray-700">{category.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    {category.items.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="inline-block rounded-lg border px-4 py-2 text-sm text-gray-800 transition-colors duration-200 hover:bg-gray-100"
                        role="menuitem"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* All Courses Link */}
            <div className="mt-6 border-t border-gray-200 pt-4">
              <Link
                href="/courses"
                className="inline-flex items-center font-medium text-blue-600 transition-colors duration-200 hover:text-blue-700"
                role="menuitem"
              >
                Voir tous les cours
                <svg
                  className="ml-1 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
