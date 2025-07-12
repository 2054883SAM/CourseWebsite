'use client';

import React, { useState, useRef, useEffect, ReactNode, useId } from 'react';

interface DropdownMenuProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
}

export function DropdownMenu({ 
  trigger, 
  children, 
  align = 'right' 
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const menuId = `dropdown-menu-${id}`;
  const triggerId = `dropdown-trigger-${id}`;

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setActiveIndex(-1);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const childrenArray = React.Children.toArray(children);
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prevIndex) => 
            prevIndex < childrenArray.length - 1 ? prevIndex + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prevIndex) => 
            prevIndex > 0 ? prevIndex - 1 : childrenArray.length - 1
          );
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (activeIndex >= 0) {
            // Simulate click on the active item
            const activeChild = dropdownRef.current?.querySelectorAll('[role="menuitem"]')[activeIndex] as HTMLElement;
            activeChild?.click();
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          // Return focus to the trigger element
          const triggerElement = document.getElementById(triggerId);
          triggerElement?.focus();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, activeIndex, children, triggerId]);

  // Add aria-selected to the active item
  const childrenWithProps = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        ...child.props,
        isActive: index === activeIndex,
        role: 'menuitem',
        tabIndex: -1,
      });
    }
    return child;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        onClick={toggleDropdown}
        id={triggerId}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls={menuId}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleDropdown();
          }
        }}
      >
        {trigger}
      </div>
      
      {isOpen && (
        <div
          id={menuId}
          className={`absolute z-10 mt-2 w-56 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          role="menu"
          aria-orientation="vertical"
          aria-labelledby={triggerId}
        >
          <div className="py-1" role="none">
            {childrenWithProps}
          </div>
        </div>
      )}
    </div>
  );
} 