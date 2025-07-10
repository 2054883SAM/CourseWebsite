import React from 'react';

/**
 * Accessibility utility functions
 */

/**
 * Handles keyboard navigation for dropdown menus
 * @param e - Keyboard event
 * @param itemsLength - Number of items in the dropdown
 * @param activeIndex - Current active index
 * @param setActiveIndex - Function to update active index
 * @param onSelect - Function to call when an item is selected
 * @param onClose - Function to call when the dropdown should close
 */
export function handleDropdownKeyboard(
  e: React.KeyboardEvent,
  itemsLength: number,
  activeIndex: number,
  setActiveIndex: (index: number) => void,
  onSelect: (index: number) => void,
  onClose: () => void
) {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      setActiveIndex((activeIndex + 1) % itemsLength);
      break;
    case 'ArrowUp':
      e.preventDefault();
      setActiveIndex((activeIndex - 1 + itemsLength) % itemsLength);
      break;
    case 'Enter':
    case ' ':
      e.preventDefault();
      if (activeIndex >= 0) {
        onSelect(activeIndex);
      }
      break;
    case 'Escape':
      e.preventDefault();
      onClose();
      break;
    default:
      break;
  }
}

/**
 * Creates an ID for ARIA labelling
 * @param prefix - Prefix for the ID
 * @param suffix - Suffix for the ID
 * @returns A unique ID for ARIA labelling
 */
export function createAriaId(prefix: string, suffix?: string | number): string {
  return `${prefix}-${suffix || Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Skip to content link handler
 * @param e - Mouse or keyboard event
 * @param contentId - ID of the main content element
 */
export function skipToContent(e: React.MouseEvent | React.KeyboardEvent, contentId: string = 'main-content') {
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
}

/**
 * Focus trap for modal dialogs
 * @param containerRef - Ref to the container element
 * @param isActive - Whether the focus trap is active
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement>,
  isActive: boolean
) {
  React.useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    function handleTabKey(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        // If shift + tab and on first element, move to last element
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // If tab and on last element, move to first element
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
    
    // Focus the first element when trap becomes active
    if (firstElement) {
      firstElement.focus();
    }
    
    // Add event listener
    document.addEventListener('keydown', handleTabKey);
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive, containerRef]);
} 