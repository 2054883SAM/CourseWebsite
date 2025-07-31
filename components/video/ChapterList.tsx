'use client';

import React from 'react';
import { VideoChapter, ChapterListProps } from '@/lib/types/vdocipher';

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
  isLoading = false
}) => {
  if (!chapters || chapters.length === 0) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        <p>No chapters available</p>
      </div>
    );
  }

  const currentChapterId = getCurrentChapter(chapters, currentTime);

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          Course Content
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {chapters.length} chapter{chapters.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Chapters List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {chapters.map((chapter, index) => {
          const isActive = chapter.id === currentChapterId;
          
          return (
            <div
              key={chapter.id}
              data-testid={`chapter-${chapter.id}`}
              className={`
                transition-colors duration-200
                ${isActive 
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }
              `}
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
                        {formatTime(chapter.duration)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Play indicator for active chapter */}
                {isActive && (
                  <div className="flex items-center mt-2 ml-9">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      Currently playing
                    </span>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChapterList;