'use client';

import React, { useEffect, useCallback, useState } from 'react';

export interface VideoProgressProps {
  videoId: string;
  duration: number;
  currentTime?: number;
  onTimeUpdate: (time: number) => void;
  onVideoEnd: () => void;
}

interface ProgressData {
  currentTime: number;
  lastUpdated: string;
}

export const VideoProgress: React.FC<VideoProgressProps> = ({
  videoId,
  duration,
  currentTime = 0,
  onTimeUpdate,
  onVideoEnd,
}) => {
  const storageKey = `video-progress-${videoId}`;
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Load saved progress from localStorage
  const loadProgress = useCallback(() => {
    try {
      const savedProgress = localStorage.getItem(storageKey);
      if (savedProgress) {
        const data: ProgressData = JSON.parse(savedProgress);
        onTimeUpdate(data.currentTime);
      } else {
        onTimeUpdate(0);
      }
    } catch (error) {
      console.error('Error loading video progress:', error);
      onTimeUpdate(0);
    }
  }, [storageKey, onTimeUpdate]);

  // Save current progress to localStorage
  const saveProgress = useCallback(
    (time: number) => {
      try {
        const data: ProgressData = {
          currentTime: time,
          lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch (error) {
        console.error('Error saving video progress:', error);
      }
    },
    [storageKey]
  );

  // Clear progress when video ends
  const handleVideoEnd = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      onVideoEnd();
    } catch (error) {
      console.error('Error clearing video progress:', error);
    }
  }, [storageKey, onVideoEnd]);

  // Load progress on mount
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Save progress when currentTime changes
  useEffect(() => {
    if (currentTime > 0 && currentTime < duration) {
      saveProgress(currentTime);
    } else if (currentTime >= duration) {
      handleVideoEnd();
    }
  }, [currentTime, duration, saveProgress, handleVideoEnd]);

  // Calculate progress percentage
  const progressPercentage = Math.min(Math.round((currentTime / duration) * 100), 100);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = (clickX / rect.width) * 100;
    const newTime = (percentage / 100) * duration;
    onTimeUpdate(newTime);
  };

  return (
    <div className="group relative">
      {/* Barre de progression principale */}
      <div 
        className="relative h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 cursor-pointer overflow-hidden"
        onClick={handleProgressClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Barre de progression remplie */}
        <div
          data-testid="progress-bar"
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
        
        {/* Effet de brillance */}
        <div
          className="absolute left-0 top-0 h-full w-full rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ 
            transform: `translateX(${progressPercentage}%)`,
            width: '100%'
          }}
        />
        
        {/* Indicateur de progression */}
        <div
          data-testid="progress-indicator"
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-blue-500 transition-all duration-200 ${
            isHovered || isDragging ? 'scale-125' : 'scale-100'
          }`}
          style={{ left: `${progressPercentage}%` }}
        >
          {/* Point central */}
          <div className="absolute inset-1 bg-blue-500 rounded-full"></div>
        </div>
      </div>

      {/* Tooltip avec informations détaillées */}
      {(isHovered || isDragging) && (
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm shadow-lg z-10"
          style={{ left: `${progressPercentage}%` }}
        >
          <div className="flex flex-col items-center">
            <span className="font-medium">{formatTime(currentTime)}</span>
            <span className="text-xs text-gray-300">sur {formatTime(duration)}</span>
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 mt-1"></div>
          </div>
        </div>
      )}

      {/* Informations de temps en bas */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
        <span>{formatTime(currentTime)}</span>
        <div className="flex items-center space-x-2">
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
            {progressPercentage}%
          </span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Indicateur de sauvegarde */}
      {currentTime > 0 && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      )}
    </div>
  );
};
