"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function PageLoader() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Show loader on route change
    setLoading(true);
    
    // Hide loader after a short delay (simulating page load)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Show loader on initial page load
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="poilian-page-loader" role="status" aria-label="Loading">
      <div className="loader-content">
        {/* Three-circle loader animation */}
        <div className="loader-icon">
          <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Large circle */}
            <circle 
              className="loader-circle-large"
              cx="20" 
              cy="20" 
              r="18" 
              fill="none"
              stroke="#063b8e"
              strokeWidth="3"
            />
            
            {/* Medium circle */}
            <circle 
              className="loader-circle-medium"
              cx="60" 
              cy="20" 
              r="14" 
              fill="none"
              stroke="#0876db"
              strokeWidth="3"
            />
            
            {/* Small circle */}
            <circle 
              className="loader-circle-small"
              cx="95" 
              cy="20" 
              r="8" 
              fill="none"
              stroke="#0B8FE8"
              strokeWidth="3"
              strokeDasharray="16"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
