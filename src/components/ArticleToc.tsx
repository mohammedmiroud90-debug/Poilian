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
      <strong>Table of Contents</strong>
      {headings.map((heading) => <a className={activeId === heading.id ? "active" : ""} href={`#${heading.id}`} key={heading.id} onClick={() => setActiveId(heading.id)}>{heading.value}</a>)}
      <section className="toc-new" aria-label="New article">
        <span>New</span>
        <a href={newArticle.href}>{newArticle.title}</a>
      </section>
    </nav>
  );
}
