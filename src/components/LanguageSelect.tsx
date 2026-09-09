"use client";

import { useEffect, useState } from "react";
export type Locale = "en" | "fr" | "ar";
export function LanguageSelect({ value, onLocaleChange }: { value?: Locale; onLocaleChange?: (locale: Locale) => void }) {
  const [storedValue, setStoredValue] = useState<Locale>("en"); const current = value ?? storedValue;
  useEffect(() => { if (value) return; const saved = localStorage.getItem("poilian-locale") as Locale | null; if (saved === "en" || saved === "fr" || saved === "ar") setStoredValue(saved); }, [value]);
  return <select className="language-select" value={current} onChange={(event) => { const locale = event.target.value as Locale; localStorage.setItem("poilian-locale", locale); document.cookie = `poilian-locale=${locale};path=/;max-age=31536000;SameSite=Lax`; if (onLocaleChange) onLocaleChange(locale); else setStoredValue(locale); window.dispatchEvent(new CustomEvent("poilian-locale-change", { detail: locale })); }} aria-label="Choose language"><option value="en">EN</option><option value="fr">FR</option><option value="ar">AR</option></select>;
}
