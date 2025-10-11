'use client';

import React, { useState } from 'react';
import { VideoChapter, ChapterListProps } from '@/lib/types/vdocipher';
import { normalizeChaptersToVideo } from '@/lib/utils/chapters';

/**
 * Formats time in seconds to MM:SS format
 */
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Determines which chapter is currently active based on the video time
 */
const getCurrentChapter = (chapters: VideoChapter[], currentTime: number): string | null => {
  // Sort chapters by start time to ensure proper order
  const sortedChapters = [...chapters].sort((a, b) => a.startTime - b.startTime);
  
  // Find the current chapter by checking which one the currentTime falls into
  for (let i = sortedChapters.length - 1; i >= 0; i--) {
    if (currentTime >= sortedChapters[i].startTime) {
      return sortedChapters[i].id;
    }
  }
  
  return sortedChapters[0]?.id || null;
};

const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  currentTime,
  onChapterClick,
  className = '',
  isLoading = false,
  onFinish
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const safeChapters: VideoChapter[] = normalizeChaptersToVideo(chapters);

  if (!safeChapters || safeChapters.length === 0) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        <p>No chapters available</p>
      </div>
    );
  }

  const currentChapterId = getCurrentChapter(safeChapters, currentTime);

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mr-2 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex-shrink-0"
                aria-label={isExpanded ? "Fermer les chapitres" : "Ouvrir les chapitres"}
              >
                <svg 
                  className={`w-5 h-5 text-blue-600 transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <span className="truncate">Chapitres</span>
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-9">
              {chapters.length} chapitre{chapters.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              type="button"
              className="group relative inline-flex items-center rounded-lg bg-blue-600 px-3 lg:px-4 py-2 text-xs lg:text-sm font-semibold text-white shadow-lg duration-300 hover:scale-105 w-full lg:w-auto justify-center"
              onClick={() => onFinish && onFinish()}
              disabled={!!isLoading}
              title="Mark video as finished and jump near the end"
            >
              <svg className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="truncate">Terminé</span>
              {isLoading && (
                <svg className="w-3 h-3 lg:w-4 lg:h-4 ml-1 lg:ml-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Chapters List */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {safeChapters.map((chapter, index) => {
            const isActive = chapter.id === currentChapterId;
            
            return (
              <div
                key={chapter.id}
                data-testid={`chapter-${chapter.id}`}
                className={`
                  transition-all duration-200 transform
                  ${isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
                  ${isActive 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }
                `}
                style={{ transitionDelay: isExpanded ? `${index * 50}ms` : '0ms' }}
              >
                <button
                  data-testid={`chapter-button-${chapter.id}`}
                  onClick={() => onChapterClick(chapter)}
                  disabled={isLoading}
                  className={`w-full p-4 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  aria-label={`Chapter ${index + 1}: ${chapter.title}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Chapter number and title */}
                      <div className="flex items-center mb-1">
                        <span className="flex-shrink-0 w-6 h-6 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-full flex items-center justify-center mr-3">
                          {index + 1}
                        </span>
                        <h4 className={`text-sm font-medium truncate ${
                          isActive 
                            ? 'text-blue-700 dark:text-blue-300' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {chapter.title}
                        </h4>
                        {chapter.flashcard === true && (
                          <span className="ml-2 inline-flex items-center" title="Flashcard available" aria-label="Flashcard available">
                            <svg className="w-4 h-4 text-yellow-500" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                              <path d="M12 2l2.39 4.84 5.34.78-3.86 3.76.91 5.32L12 14.77 6.22 16.7l.91-5.32-3.86-3.76 5.34-.78L12 2z"/>
                            </svg>
                          </span>
                        )}
                      </div>

                      {/* Chapter description */}
                      {chapter.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">
                          {chapter.description}
                        </p>
                      )}
                    </div>

                    {/* Chapter timing */}
                    <div className="flex-shrink-0 ml-4 text-right">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(chapter.startTime)}
                      </div>
                      {chapter.duration && (
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatTime(chapter.duration + chapter.startTime)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Play indicator for active chapter */}
                  {isActive && (
                    <div className="flex items-center mt-2 ml-9">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        En cours
                      </span>
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChapterList;