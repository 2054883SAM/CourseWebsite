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
  onSectionClick
}) => {
  const router = useRouter();

  if (!sections || sections.length === 0) {
    return (
      <div className={`p-8 text-center text-gray-500 ${className}`}>
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No sections available</h3>
          <p className="text-gray-600 dark:text-gray-400">This course doesn't have any video sections yet.</p>
        </div>
      </div>
    );
  }

  // Helper to get progress for a specific section
  const getSectionProgress = (sectionId: string): SectionProgress => {
    return progress.find(p => p.sectionId === sectionId) || {
      sectionId,
      completed: false,
      progressPercentage: 0
    };
  };

  const handleSectionClick = (section: Section) => {
    if (onSectionClick) {
      onSectionClick(section);
    } else {
      // Default navigation to section player
      router.push(`/my-learning/${courseId}/section/${section.id}`);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Course Content
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {sections.length} section{sections.length !== 1 ? 's' : ''}
          {' • '}
          {formatDuration(sections.reduce((total, section) => total + (section.duration || 0), 0))} total
        </p>
        
        {/* Overall Progress */}
        {progress.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Overall Progress</span>
              <span>
                {Math.round((progress.filter(p => p.completed).length / sections.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.filter(p => p.completed).length / sections.length) * 100}%` }}
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
          
          return (
            <div
              key={section.id}
              data-testid={`section-${section.id}`}
              className={`
                transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50
                ${isCompleted ? 'bg-green-50 dark:bg-green-900/10' : ''}
              `}
            >
              <button
                data-testid={`section-button-${section.id}`}
                onClick={() => handleSectionClick(section)}
                disabled={isLoading}
                className={`w-full p-6 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                aria-label={`Section ${section.section_number}: ${section.title}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Section number and title */}
                    <div className="flex items-center mb-2">
                      <span className={`flex-shrink-0 w-8 h-8 text-sm font-medium rounded-full flex items-center justify-center mr-4 ${
                        isCompleted 
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                          : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      }`}>
                        {isCompleted ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          section.section_number
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-lg font-medium truncate ${
                          isCompleted 
                            ? 'text-green-700 dark:text-green-300' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {section.title}
                        </h4>
                        
                        {/* Chapter count */}
                        {section.chapters && section.chapters.length > 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {section.chapters.length} chapter{section.chapters.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Progress bar for individual section */}
                    {progressPercentage > 0 && (
                      <div className="ml-12 mb-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              isCompleted ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Last watched indicator */}
                    {sectionProgress.lastWatchedAt && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 ml-12">
                        Last watched: {new Date(sectionProgress.lastWatchedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Section duration and play button */}
                  <div className="flex-shrink-0 ml-6 text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {formatDuration(section.duration || 0)}
                    </div>
                    
                    {/* Play button */}
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                      isCompleted 
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/40'
                    }`}>
                      {isCompleted ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
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
