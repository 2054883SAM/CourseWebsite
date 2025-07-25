import React from 'react';

export interface TooltipProps {
  /**
   * Text to display in the tooltip
   */
  text: string;
  
  /**
   * Optional className for styling the tooltip
   */
  className?: string;
  
  /**
   * Position of the tooltip relative to its target
   */
  position?: 'top' | 'right' | 'bottom' | 'left';
}

export function Tooltip({ 
  text, 
  className = '', 
  position = 'top' 
}: TooltipProps) {
  // Position-specific classes
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  };

  // Arrow positioning classes
  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-800 dark:border-t-gray-700 border-l-transparent border-r-transparent border-b-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-800 dark:border-r-gray-700 border-t-transparent border-b-transparent border-l-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 dark:border-b-gray-700 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-800 dark:border-l-gray-700 border-t-transparent border-b-transparent border-r-transparent',
  };

  return (
    <div 
      role="tooltip" 
      className={`
        absolute z-50 px-3 py-2 text-sm text-white 
        bg-gray-800 dark:bg-gray-700 rounded-md shadow-sm 
        whitespace-nowrap pointer-events-none
        ${positionClasses[position]} 
        ${className}
      `}
    >
      {text}
      <div 
        className={`
          absolute w-0 h-0 border-4
          ${arrowClasses[position]}
        `}
      />
    </div>
  );
}

export default Tooltip; 