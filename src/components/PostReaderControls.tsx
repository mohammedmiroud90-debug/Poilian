"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const STORAGE = "poilian-post-reader";

type Size = "sm" | "md" | "lg" | "xl";
type Font = "sans" | "serif" | "mono";
type Spacing = "tight" | "normal" | "loose";
type Width = "narrow" | "default" | "wide";
type ReaderSettings = { dark: boolean; size: Size; font: Font; spacing: Spacing; width: Width; contrast: boolean };

const defaults: ReaderSettings = { dark: false, size: "md", font: "sans", spacing: "normal", width: "default", contrast: false };
const sizes: Size[] = ["sm", "md", "lg", "xl"];
const fonts: Font[] = ["sans", "serif", "mono"];
const spacings: Spacing[] = ["tight", "normal", "loose"];
const widths: Width[] = ["narrow", "default", "wide"];
const fontLabel = { sans: "Sans", serif: "Serif", mono: "Mono" };
const spacingLabel = { tight: "Compact", normal: "Comfort", loose: "Relaxed" };
const widthLabel = { narrow: "Narrow", default: "Standard", wide: "Wide" };

const classes = (settings: ReaderSettings) => [
  settings.dark ? "post-reader--dark" : "",
  `post-reader--size-${settings.size}`,
  `post-reader--font-${settings.font}`,
  `post-reader--spacing-${settings.spacing}`,
  `post-reader--width-${settings.width}`,
  settings.contrast ? "post-reader--contrast" : "",
].filter(Boolean);

function nextOf<T>(list: T[], current: T) {
  return list[(list.indexOf(current) + 1) % list.length];
}

function readStored(): ReaderSettings {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE) ?? "") as Partial<ReaderSettings>;
    return { ...defaults, ...saved };
  } catch {
    return defaults;
  }
}

function apply(settings: ReaderSettings) {
  const root = document.documentElement;
  root.classList.remove(...Array.from(root.classList).filter((name) => name.startsWith("post-reader--")));
  classes(settings).forEach((name) => root.classList.add(name));
}

function Icon({ children }: { children: ReactNode }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true">{children}</svg>;
}

export function PostReaderControls() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<ReaderSettings>(defaults);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const next = readStored();
    setSettings(next);
    apply(next);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!panel.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function update(next: ReaderSettings) {
    setSettings(next);
    apply(next);
    localStorage.setItem(STORAGE, JSON.stringify(next));
  }

  return (
    <div className="post-reader-controls" ref={panel}>
      <button
        type="button"
        className={`post-reader-toggle${open ? " is-open" : ""}`}
        aria-expanded={open}
        aria-controls="post-reader-panel"
        aria-label="Reading options"
        onClick={() => setOpen((value) => !value)}
      >
        <Icon>
          <rect x="4" y="4" width="4.2" height="4.2" rx="1" fill="currentColor" />
          <rect x="10" y="4" width="4.2" height="4.2" rx="1" fill="currentColor" />
          <rect x="16" y="4" width="4.2" height="4.2" rx="1" fill="currentColor" />
          <rect x="4" y="10" width="4.2" height="4.2" rx="1" fill="currentColor" />
          <rect x="10" y="10" width="4.2" height="4.2" rx="1" fill="currentColor" />
          <rect x="16" y="10" width="4.2" height="4.2" rx="1" fill="currentColor" />
          <rect x="4" y="16" width="4.2" height="4.2" rx="1" fill="currentColor" />
          <rect x="10" y="16" width="4.2" height="4.2" rx="1" fill="currentColor" />
          <rect x="16" y="16" width="4.2" height="4.2" rx="1" fill="currentColor" />
        </Icon>
      </button>
      {open && (
        <div className="post-reader-panel" id="post-reader-panel" role="menu" aria-label="Reading options">
          <button type="button" role="menuitem" className={!settings.dark ? "is-active" : ""} onClick={() => update({ ...settings, dark: false })}>
            <Icon><circle cx="12" cy="12" r="4.2" fill="currentColor" /><path d="M12 3.5v2.2M12 18.3v2.2M4.6 12H6.8M17.2 12h2.2M6.4 6.4l1.6 1.6M16 16l1.6 1.6M17.6 6.4 16 8M8 16l-1.6 1.6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></Icon>
            <span>Light mode</span>
          </button>
          <button type="button" role="menuitem" className={settings.dark ? "is-active" : ""} onClick={() => update({ ...settings, dark: true })}>
            <Icon><path d="M15.2 4.8A7.4 7.4 0 1 0 19 14.6 5.8 5.8 0 0 1 15.2 4.8Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></Icon>
            <span>Dark mode</span>
          </button>
          <button type="button" role="menuitem" onClick={() => update({ ...settings, size: sizes[Math.max(0, sizes.indexOf(settings.size) - 1)] })}>
            <Icon><path d="M5 18 10 6h1.4L16.4 18M6.6 14.2h8.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><path d="M17.2 11v8M15 16.4h4.4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></Icon>
            <span>Smaller text</span>
          </button>
          <button type="button" role="menuitem" onClick={() => update({ ...settings, size: sizes[Math.min(sizes.length - 1, sizes.indexOf(settings.size) + 1)] })}>
            <Icon><path d="M4.8 18 10.6 5h1.6L18 18M6.6 13.8h9.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /><path d="M19 7v5M16.6 9.5H21.4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></Icon>
            <span>Larger text</span>
          </button>
          <button type="button" role="menuitem" onClick={() => update({ ...settings, font: nextOf(fonts, settings.font) })}>
            <Icon><path d="M5 18V7.5h5.4A3.4 3.4 0 0 1 13.8 11 3.3 3.3 0 0 1 10.5 14.4H5M14.6 18l3-8.5 3 8.5M15.6 15.2h4.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></Icon>
            <span>Font · {fontLabel[settings.font]}</span>
          </button>
          <button type="button" role="menuitem" onClick={() => update({ ...settings, spacing: nextOf(spacings, settings.spacing) })}>
            <Icon><path d="M5 7h14M5 12h14M5 17h14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></Icon>
            <span>Spacing · {spacingLabel[settings.spacing]}</span>
          </button>
          <button type="button" role="menuitem" onClick={() => update({ ...settings, width: nextOf(widths, settings.width) })}>
            <Icon><path d="M4.5 6.5h15v11h-15zM10 6.5v11M14 6.5v11" fill="none" stroke="currentColor" strokeWidth="1.7" /></Icon>
            <span>Column · {widthLabel[settings.width]}</span>
          </button>
          <button type="button" role="menuitem" className={settings.contrast ? "is-active" : ""} onClick={() => update({ ...settings, contrast: !settings.contrast })}>
            <Icon><circle cx="12" cy="12" r="7.2" fill="none" stroke="currentColor" strokeWidth="1.7" /><path d="M12 4.8v14.4A7.2 7.2 0 0 0 12 4.8Z" fill="currentColor" /></Icon>
            <span>High contrast</span>
          </button>
          <button type="button" role="menuitem" className="is-reset" onClick={() => update(defaults)}>
            <Icon><path d="M7.2 7.2A7 7 0 1 1 5.5 12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /><path d="M7.2 3.8v4.2H3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></Icon>
            <span>Reset</span>
          </button>
        </div>
      )}
    </div>
  );
}
