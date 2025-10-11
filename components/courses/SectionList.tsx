'use client';

import React from 'react';
import { Section } from '@/lib/supabase/types';
import { useRouter } from 'next/navigation';

/**
 * Formats duration in minutes to "X min" format
 */
const formatDuration = (minutes: number): string => {
  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${Math.round(minutes)} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}min`;
};

interface SectionProgress {
  sectionId: string;
  completed: boolean;
  progressPercentage: number; // 0-100
  lastWatchedAt?: string;
  quizScore?: number | null; // 0-100, null if quiz not attempted
  quizPassed?: boolean | null; // true if score >= 70%, false if < 70%, null if not attempted
}

interface SectionListProps {
  sections: Section[];
  courseId: string;
  className?: string;
  isLoading?: boolean;
  progress?: SectionProgress[]; // Array of progress for each section
  onSectionClick?: (section: Section) => void;
}

const SectionList: React.FC<SectionListProps> = ({
  sections,
  courseId,
  className = '',
  isLoading = false,
  progress = [],
  onSectionClick,
}) => {
  const router = useRouter();

  if (!sections || sections.length === 0) {
    return (
      <div className={`p-8 text-center text-gray-500 ${className}`}>
        <div className="mx-auto max-w-md">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
            <svg
              className="h-8 w-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
            No sections available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            This course doesn&apos;t have any video sections yet.
          </p>
        </div>
      </div>
    );
  }

  // Helper to get progress for a specific section
  const getSectionProgress = (sectionId: string): SectionProgress => {
    return (
      progress.find((p) => p.sectionId === sectionId) || {
        sectionId,
        completed: false,
        progressPercentage: 0,
      }
    );
  };

  // Helper to check if a section is accessible
  const isSectionAccessible = (sectionIndex: number): boolean => {
    // First section is always accessible
    if (sectionIndex === 0) return true;

    // Check if previous section has a passing quiz score
    const previousSection = sections[sectionIndex - 1];
    if (!previousSection) return true;

    const previousProgress = getSectionProgress(previousSection.id);
    // Section is accessible if previous section's quiz was passed
    return previousProgress.quizPassed === true;
  };

  const handleSectionClick = (section: Section, sectionIndex: number) => {
    // Check if section is accessible
    if (!isSectionAccessible(sectionIndex)) {
      // Show alert or toast that previous section must be completed
      alert(
        'Vous devez terminer la section précédente avec succès (70% ou plus au quiz) pour accéder à cette section.'
      );
      return;
    }

    if (onSectionClick) {
      onSectionClick(section);
    } else {
      // Default navigation to section player
      router.push(`/my-learning/${courseId}/section/${section.id}`);
    }
  };

  return (
    <div
      className={`rounded-xl bg-white/90 backdrop-blur-sm border border-white/20 shadow-lg dark:bg-gray-800/90 dark:border-gray-700/20 ${className}`}
    >
      {/* Header */}
      <div className="border-b border-white/20 p-6 dark:border-gray-700/20">
        <h3 className="flex items-center text-xl font-semibold text-gray-900 dark:text-white">
          <svg
            className="mr-3 h-6 w-6 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          Contenu du cours
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {sections.length} section{sections.length !== 1 ? 's' : ''}
          {' • '}
          {formatDuration(
            sections.reduce((total, section) => total + (section.duration || 0), 0)
          )}{' '}
          total
        </p>

        {/* Overall Progress */}
        {progress.length > 0 && (
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Overall Progress</span>
              <span>
                {Math.round((progress.filter((p) => p.completed).length / sections.length) * 100)}%
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-gray-200/50 dark:bg-gray-700/50 shadow-inner">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500 shadow-lg"
                style={{
                  width: `${(progress.filter((p) => p.completed).length / sections.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Sections List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {sections.map((section, index) => {
          const sectionProgress = getSectionProgress(section.id);
          const isCompleted = sectionProgress.completed;
          const progressPercentage = sectionProgress.progressPercentage;
          const isAccessible = isSectionAccessible(index);
          const quizScore = sectionProgress.quizScore;
          const quizPassed = sectionProgress.quizPassed;

          return (
            <div
              key={section.id}
              data-testid={`section-${section.id}`}
              className={`
                group relative transition-all duration-300 ease-in-out
                ${isAccessible ? 'hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-amber-50/50 dark:hover:from-orange-900/10 dark:hover:to-amber-900/10 hover:shadow-lg hover:scale-[1.02] hover:border-orange-200 dark:hover:border-orange-800' : 'opacity-50'}
                ${isCompleted ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10' : ''}
                ${!isAccessible ? 'bg-gray-100 dark:bg-gray-800' : ''}
                border-l-4 ${isCompleted ? 'border-l-green-500' : isAccessible ? 'border-l-orange-400 group-hover:border-l-orange-500' : 'border-l-gray-300'}
              `}
            >
              <button
                data-testid={`section-button-${section.id}`}
                onClick={() => handleSectionClick(section, index)}
                disabled={isLoading || !isAccessible}
                className={`w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 ${
                  isLoading || !isAccessible ? 'cursor-not-allowed opacity-50' : ''
                }`}
                aria-label={`Section ${section.section_number}: ${section.title}${!isAccessible ? ' (Locked)' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    {/* Section number and title */}
                    <div className="mb-2 flex items-center">
                      <span
                        className={`mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ease-in-out transform ${
                          !isAccessible
                            ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                            : isCompleted
                              ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 dark:from-green-900/20 dark:to-emerald-900/20 dark:text-green-300 group-hover:scale-110 group-hover:shadow-lg'
                              : 'bg-gradient-to-br from-orange-100 to-amber-100 text-orange-700 dark:from-orange-900/20 dark:to-amber-900/20 dark:text-orange-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-orange-200/50'
                        }`}
                      >
                        {!isAccessible ? (
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : isCompleted ? (
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          section.section_number
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h4
                          className={`truncate text-lg font-semibold transition-colors duration-300 ${
                            isCompleted
                              ? 'text-green-700 dark:text-green-300 group-hover:text-green-800 dark:group-hover:text-green-200'
                              : 'text-gray-900 dark:text-white group-hover:text-orange-700 dark:group-hover:text-orange-300'
                          }`}
                        >
                          {section.title}
                        </h4>

                        {/* Chapter count */}
                        {section.chapters && section.chapters.length > 0 && (
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {section.chapters.length} chapter
                            {section.chapters.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Progress bar for individual section */}
                    {progressPercentage > 0 && (
                      <div className="mb-2 ml-12">
                        <div className="mb-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>Video Progress: {progressPercentage}%</span>
                          {quizScore !== null && quizScore !== undefined && (
                            <span
                              className={`${quizPassed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                            >
                              Quiz: {quizScore}% {quizPassed ? '✓' : '✗'}
                            </span>
                          )}
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 group-hover:bg-gray-300 dark:group-hover:bg-gray-600 transition-colors duration-300">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ease-out ${
                              isCompleted 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 group-hover:from-green-600 group-hover:to-emerald-600' 
                                : 'bg-gradient-to-r from-orange-500 to-amber-500 group-hover:from-orange-600 group-hover:to-amber-600'
                            } group-hover:shadow-lg`}
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Last watched indicator */}
                    {sectionProgress.lastWatchedAt && (
                      <p className="ml-12 text-xs text-gray-400 dark:text-gray-500">
                        Last watched: {new Date(sectionProgress.lastWatchedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Section duration and play button */}
                  <div className="ml-6 flex-shrink-0 text-right">
                    <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      {formatDuration(section.duration || 0)}
                    </div>

                    {/* Play button */}
                    <div
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ease-in-out transform ${
                        isCompleted
                          ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-600 dark:from-green-900/20 dark:to-emerald-900/20 dark:text-green-400 group-hover:scale-110 group-hover:shadow-lg'
                          : 'bg-gradient-to-br from-orange-100 to-amber-100 text-orange-600 hover:from-orange-200 hover:to-amber-200 dark:from-orange-900/20 dark:to-amber-900/20 dark:text-orange-400 dark:hover:from-orange-900/40 dark:hover:to-amber-900/40 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-orange-200/50'
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg className="h-6 w-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SectionList;
