"use client";

import React, { useState, useRef, useEffect } from 'react';

interface PopupProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Popup: React.FC<PopupProps> = ({ trigger, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="relative inline-block" ref={popupRef}>
      <div
        className="cursor-pointer"
        onClick={toggleVisibility}
        aria-describedby="tooltip"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            toggleVisibility();
          }
        }}
      >
        {trigger}
      </div>
      {isVisible && (
        <div
          id="tooltip"
          role="tooltip"
          className={`absolute z-10 px-3 py-2 text-sm font-medium text-black bg-white border border-gray-200 rounded-lg shadow-lg tooltip ${positionClasses[position]} w-80 break-words`}
        >
          {content}
          <div className="tooltip-arrow" data-popper-arrow></div>
        </div>
      )}
    </div>
  );
};

