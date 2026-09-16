"use client";

import { useEffect, useState } from "react";
import { applyDocumentLocale, getStoredLocale, isLocale, type Locale } from "@/lib/locale";

export function usePoilianLocale() {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const initial = getStoredLocale();
    setLocale(initial);
    applyDocumentLocale(initial);

    const onChange = (event: Event) => {
      const next = (event as CustomEvent<Locale>).detail;
      if (isLocale(next)) {
        setLocale(next);
        applyDocumentLocale(next);
      }
    };
    window.addEventListener("poilian-locale-change", onChange);
    return () => window.removeEventListener("poilian-locale-change", onChange);
  }, []);

  return [locale, setLocale] as const;
}
