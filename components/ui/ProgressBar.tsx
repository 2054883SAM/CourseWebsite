'use client';

import React from 'react';

interface ProgressBarProps {
  value?: number;
  showLabel?: boolean;
  heightClassName?: string;
  className?: string;
}

export default function ProgressBar({
  value = 0,
  showLabel = true,
  heightClassName = 'h-2',
  className = '',
}: ProgressBarProps) {
  const percent = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className={`flex items-center ${className}`}>
      <div
        className={`${heightClassName} flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600`}
      >
        <div
          className="h-full rounded-full bg-blue-600 dark:bg-blue-400"
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{percent}%</span>
      )}
    </div>
  );
}
