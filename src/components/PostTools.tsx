"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function PostTools({ title }: { title: string }) {
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUrl(window.location.href);

    let frame = 0;
    const readProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      const docHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        document.documentElement.offsetHeight,
      );
      const max = docHeight - window.innerHeight;
      return max > 1 ? Math.min(100, Math.max(0, (scrollTop / max) * 100)) : 0;
    };

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setProgress(readProgress()));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    document.addEventListener("scroll", update, { passive: true, capture: true });

    const observer = new ResizeObserver(update);
    observer.observe(document.documentElement);
    observer.observe(document.body);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      document.removeEventListener("scroll", update, true);
      observer.disconnect();
    };
  }, []);

  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;

  async function copyLink() {
    if (!url) return;
    await navigator.clipboard?.writeText(url);
    setCopied(true);
  }

  const bar = mounted
    ? createPortal(
        <div className="reading-progress-track" aria-hidden={progress < 0.5}>
          <div
            className="reading-progress"
            role="progressbar"
            aria-label="Reading progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            style={{ width: `${progress}%` }}
          />
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      {bar}
      <aside className="post-tools" aria-label="Article actions">
        <span>{Math.round(progress)}% read</span>
        <a href={shareUrl} target="_blank" rel="noreferrer" aria-label="Share on LinkedIn">
          in
        </a>
        <a href={emailUrl} aria-label="Share by email">
          ✉
        </a>
        <button type="button" onClick={copyLink} aria-label="Copy article link">
          ↗
        </button>
        <button type="button" onClick={() => window.print()} aria-label="Print this article" title="Print this article">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 9V3h12v6M6 17H4V10h16v7h-2M7 14h10v7H7z" />
          </svg>
        </button>
        <small>{copied ? "Link copied" : "Share or print"}</small>
      </aside>
    </>
  );
}
