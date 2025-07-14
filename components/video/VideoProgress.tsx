'use client';

import React, { useEffect, useCallback } from 'react';

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

  return (
    <div className="relative h-1.5 w-full rounded-full bg-gray-200 sm:h-2">
      <div
        data-testid="progress-bar"
        className="absolute left-0 top-0 h-full rounded-full bg-blue-500 transition-all duration-300"
        style={{ width: `${progressPercentage}%` }}
      />
      <div
        data-testid="progress-indicator"
        className="absolute -top-6 left-0 -translate-x-1/2 transform rounded bg-blue-500 px-1.5 py-0.5 text-[10px] text-white sm:-top-7 sm:px-2 sm:py-1 sm:text-xs"
        style={{ left: `${progressPercentage}%` }}
      >
        {progressPercentage}%
      </div>
    </div>
  );
};
