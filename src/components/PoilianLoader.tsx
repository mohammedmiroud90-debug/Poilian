"use client";

import { useEffect, useState } from "react";

export function PoilianLoader({ 
  show = true, 
  fullScreen = true 
}: { 
  show?: boolean; 
  fullScreen?: boolean;
}) {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(show), 0);
    return () => clearTimeout(timer);
  }, [show]);

  if (!isVisible) return null;

  return (
    <div 
      className={`poilian-loader ${fullScreen ? 'poilian-loader-fullscreen' : ''}`}
      role="status"
      aria-label="Loading"
    >
      <div className="poilian-loader-content">
        <div className="poilian-loader-mark" aria-hidden="true">
          <svg className="loader-mark" viewBox="0 0 64 54" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path className="loader-mark-shape" d="M7 4V50H13L24 27L13 4H7Z" />
            <path className="loader-mark-shape" d="M18 4L30 27L18 50H25L37 27L25 4H18Z" />
            <path className="loader-mark-shape" d="M29 4L41 27L29 50H36L48 27L36 4H29Z" />
            <path className="loader-mark-shape" d="M40 4L52 27L40 50H47L59 27L47 4H40Z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// Simple inline loader for small sections
export function InlineLoader() {
  return (
    <div className="poilian-inline-loader">
      <div className="poilian-spinner"></div>
    </div>
  );
}
