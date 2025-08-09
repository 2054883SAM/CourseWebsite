'use client';

import React, { useState } from 'react';
import { Tooltip } from '../layout/Tooltip';

export type EnrollButtonProps = {
  /**
   * The current enrollment status
   */
  status?: 'not-enrolled' | 'processing' | 'enrolled';
  
  /**
   * Optional className for extending the button's styles
   */
  className?: string;
  
  /**
   * Optional tooltip text to display when hovering over the button
   */
  tooltipText?: string;
  
  /**
   * Optional text to display when the user is not enrolled
   */
  notEnrolledText?: string;
  
  /**
   * Optional text to display when enrollment is processing
   */
  processingText?: string;
  
  /**
   * Optional text to display when the user is enrolled
   */
  enrolledText?: string;
  
  /**
   * Function to call when the button is clicked
   */
  onClick?: () => void;
  
  /**
   * Whether the button is disabled
   */
  disabled?: boolean;
};

export const EnrollButton: React.FC<EnrollButtonProps> = ({
  status = 'not-enrolled',
  className = '',
  tooltipText,
  notEnrolledText = 'Enroll Now',
  processingText = 'Processing...',
  enrolledText = 'Enrolled',
  onClick,
  disabled = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Base button styles
  const baseClasses = 'relative inline-flex items-center justify-center px-6 py-3 rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500';
  
  // Status-specific styles
  const statusClasses = {
    'not-enrolled': 'bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white',
    'processing': 'bg-gray-400 text-white cursor-not-allowed opacity-80',
    'enrolled': 'bg-green-600 hover:bg-green-700 text-white',
  };
  
  // Button text based on status
  const buttonText = {
    'not-enrolled': notEnrolledText,
    'processing': processingText,
    'enrolled': enrolledText,
  };
  
  // Combine classes
  const buttonClasses = `${baseClasses} ${statusClasses[status]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`;

  const handleClick = () => {
    if (disabled || status === 'processing' || status === 'enrolled') return;
    onClick?.();
  };

  return (
    <div className="relative inline-block">
      <button
        className={buttonClasses}
        onClick={handleClick}
        disabled={disabled || status === 'processing'}
        aria-busy={status === 'processing'}
        aria-label={buttonText[status]}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
      >
        {status === 'processing' && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {status === 'enrolled' && (
          <svg className="-ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {buttonText[status]}
      </button>
      
      {tooltipText && isHovered && (
        <Tooltip text={tooltipText} />
      )}
    </div>
  );
};

export default EnrollButton; 