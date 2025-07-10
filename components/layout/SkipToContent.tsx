'use client';

import { useState } from 'react';

interface SkipToContentProps {
  contentId?: string;
}

export function SkipToContent({ contentId = 'main-content' }: SkipToContentProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  const handleSkip = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    const contentElement = document.getElementById(contentId);
    if (contentElement) {
      contentElement.tabIndex = -1;
      contentElement.focus();
      // Reset tabIndex after a short delay
      setTimeout(() => {
        contentElement.removeAttribute('tabIndex');
      }, 1000);
    }
  };

  return (
    <a
      href={`#${contentId}`}
      className={`
        absolute z-50 left-4 p-3 bg-primary-600 text-white transform -translate-y-full focus:translate-y-0
        transition-transform duration-200 rounded-b-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
        ${isFocused ? 'translate-y-0' : ''}
      `}
      onClick={handleSkip}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      Skip to content
    </a>
  );
} 