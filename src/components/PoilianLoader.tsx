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
    setIsVisible(show);
  }, [show]);

  if (!isVisible) return null;

  return (
    <div 
      className={`poilian-loader ${fullScreen ? 'poilian-loader-fullscreen' : ''}`}
      role="status"
      aria-label="Loading"
    >
      <div className="poilian-loader-content">
        {/* Arabic text "جبال" with fading animation */}
        <div className="poilian-loader-text">
          <span className="poilian-loader-char" style={{ animationDelay: '0s' }}>ج</span>
          <span className="poilian-loader-char" style={{ animationDelay: '0.2s' }}>ب</span>
          <span className="poilian-loader-char" style={{ animationDelay: '0.4s' }}>ا</span>
          <span className="poilian-loader-char" style={{ animationDelay: '0.6s' }}>ل</span>
        </div>
        
        {/* Mountain SVG animation */}
        <div className="poilian-loader-mountains">
          <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              className="mountain mountain-1"
              d="M20 60 L40 20 L60 60 Z" 
              fill="rgba(255, 255, 255, 0.3)"
            />
            <path 
              className="mountain mountain-2"
              d="M40 60 L60 10 L80 60 Z" 
              fill="rgba(255, 255, 255, 0.5)"
            />
            <path 
              className="mountain mountain-3"
              d="M60 60 L80 25 L100 60 Z" 
              fill="rgba(255, 255, 255, 0.7)"
            />
          </svg>
        </div>

        {/* Loading dots */}
        <div className="poilian-loader-dots">
          <span className="poilian-loader-dot" style={{ animationDelay: '0s' }}></span>
          <span className="poilian-loader-dot" style={{ animationDelay: '0.2s' }}></span>
          <span className="poilian-loader-dot" style={{ animationDelay: '0.4s' }}></span>
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
