"use client";

import { useEffect, useState } from "react";

export function PostTools({ title }: { title: string }) {
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
    const update = () => {
      const pageHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      const max = pageHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const observer = new ResizeObserver(update);
    observer.observe(document.body);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); observer.disconnect(); };
  }, []);

  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
  async function copyLink() {
    if (!url) return;
    await navigator.clipboard?.writeText(url);
    setCopied(true);
  }

  return <>
    <div className="reading-progress" role="progressbar" aria-label="Reading progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} style={{ transform: `scaleX(${progress / 100})` }} />
    <aside className="post-tools" aria-label="Article actions">
      <span>{progress}% read</span>
      <a href={shareUrl} target="_blank" rel="noreferrer" aria-label="Share on LinkedIn">in</a>
      <a href={emailUrl} aria-label="Share by email">✉</a>
      <button type="button" onClick={copyLink} aria-label="Copy article link">↗</button>
      <button type="button" onClick={() => window.print()} aria-label="Print this article" title="Print this article">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9V3h12v6M6 17H4V10h16v7h-2M7 14h10v7H7z" /></svg>
      </button>
      <small>{copied ? "Link copied" : "Share or print"}</small>
    </aside>
  </>;
}
