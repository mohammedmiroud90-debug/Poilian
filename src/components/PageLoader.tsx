"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function PageLoader() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Defer the state transition so route changes get one paint with the loader.
    const showTimer = setTimeout(() => setLoading(true), 0);
    const hideTimer = setTimeout(() => setLoading(false), 800);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="poilian-page-loader" role="status" aria-label="Loading">
      <div className="loader-content">
        <div className="loader-icon" aria-hidden="true">
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
