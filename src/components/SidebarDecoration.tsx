"use client";

import { useEffect, useRef } from "react";

export function SidebarDecoration() {
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("section-in-view");
        } else {
          entry.target.classList.remove("section-in-view");
        }
      });
    }, options);

    // Find the services showcase section
    const showcaseSection = document.querySelector(".services-showcase-with-sidebar");
    if (showcaseSection) {
      containerRef.current = showcaseSection as HTMLElement;
      observer.observe(showcaseSection);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  return null;
}
