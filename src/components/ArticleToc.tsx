"use client";

import { useEffect, useState } from "react";

export type TocHeading = { id: string; value: string; level?: number };

const newArticle = {
  href: "/posts/cybersecurity-in-the-age-of-ai-defending-against-intelligent-threats",
  title: "Cybersecurity in the Age of AI: Defending Against Intelligent Threats",
};

export function ArticleToc({ headings }: { headings: TocHeading[] }) {
  const [activeId, setActiveId] = useState(headings[0]?.id);

  useEffect(() => {
    const targets = headings.map(({ id }) => document.getElementById(id)).filter((node): node is HTMLElement => Boolean(node));
    const observer = new IntersectionObserver((entries) => { const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]; if (visible) setActiveId(visible.target.id); }, { rootMargin: "-25% 0px -65% 0px", threshold: 0 });
    targets.forEach((target) => observer.observe(target)); return () => observer.disconnect();
  }, [headings]);

  return (
    <nav className="article-toc" aria-label="Table of contents">
      <div className="toc-header">
        <strong>Contents</strong>
        <span className="toc-count">{headings.length}</span>
      </div>
      <div className="toc-list">
        {headings.map((heading) => (
          <a 
            className={`toc-item ${activeId === heading.id ? "active" : ""} ${heading.level ? `toc-level-${heading.level}` : ""}`} 
            href={`#${heading.id}`} 
            key={heading.id} 
            onClick={() => setActiveId(heading.id)}
          >
            <span className="toc-item-text">{heading.value}</span>
            {activeId === heading.id && <span className="toc-indicator">●</span>}
          </a>
        ))}
      </div>
      <section className="toc-new" aria-label="New article">
        <span className="toc-new-label">Featured</span>
        <a href={newArticle.href}>{newArticle.title}</a>
      </section>
    </nav>
  );
}
