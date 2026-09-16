"use client";

import { useEffect, useRef, useState } from "react";
import { applyDocumentLocale, getStoredLocale, isLocale, type Locale } from "@/lib/locale";

export type { Locale };

const locales: { value: Locale; label: string }[] = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "ar", label: "العربية" },
];

function persist(locale: Locale) {
  try {
    localStorage.setItem("poilian-locale", locale);
  } catch {
    /* private mode */
  }
  document.cookie = `poilian-locale=${locale};path=/;max-age=31536000;SameSite=Lax`;
  applyDocumentLocale(locale);
  window.dispatchEvent(new CustomEvent("poilian-locale-change", { detail: locale }));
}

export function LanguageSelect({
  value,
  onLocaleChange,
}: {
  value?: Locale;
  onLocaleChange?: (locale: Locale) => void;
}) {
  const [storedValue, setStoredValue] = useState<Locale>("en");
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const current = value ?? storedValue;
  const currentLabel = locales.find((locale) => locale.value === current)?.label ?? "English";

  useEffect(() => {
    const saved = value ?? getStoredLocale();
    if (isLocale(saved)) {
      if (!value) setStoredValue(saved);
      applyDocumentLocale(saved);
    }
  }, [value]);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
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

  function choose(locale: Locale) {
    persist(locale);
    if (onLocaleChange) onLocaleChange(locale);
    else setStoredValue(locale);
    setOpen(false);
  }

  return (
    <div className={`language-select${open ? " is-open" : ""}`} ref={root}>
      <button
        type="button"
        className="language-select-toggle"
        aria-label="Choose language"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((next) => !next)}
      >
        <svg className="language-select-globe" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <path d="M3 12h18M12 3c2.6 2.4 4 5.5 4 9s-1.4 6.6-4 9c-2.6-2.4-4-5.5-4-9s1.4-6.6 4-9Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
          <path d="M5.2 7.8h13.6M5.2 16.2h13.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span>{currentLabel}</span>
        <svg className="language-select-caret" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2.4 4.2 6 8l3.6-3.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="language-select-menu" role="listbox" aria-label="Languages">
          {locales.map((locale) => (
            <button
              key={locale.value}
              type="button"
              role="option"
              aria-selected={locale.value === current}
              className={locale.value === current ? "is-active" : ""}
              onClick={() => choose(locale.value)}
            >
              {locale.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
