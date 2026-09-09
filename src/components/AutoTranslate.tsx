"use client";

import { useEffect } from "react";
import type { Locale } from "@/components/LanguageSelect";

const selector = "main h1, main h2, main h3, main h4, main p, main li, main blockquote, main a, main button, main label, main small, main span, .personal-footer p, .personal-footer a, .personal-footer h3";
const excluded = "script,style,pre,code,svg,.language-select,.rich-editor,.toolbar,.poilian-locale-copy";

function isLocale(value: string | null): value is Locale { return value === "en" || value === "fr" || value === "ar"; }

export function AutoTranslate() {
  useEffect(() => {
    let cancelled = false;
    let requestId = 0;

    async function applyLocale(requestedLocale?: Locale) {
      const currentRequest = ++requestId;
      const stored = requestedLocale || localStorage.getItem("poilian-locale");
      const locale: Locale = isLocale(stored) ? stored : "en";
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";

      const elements = Array.from(document.querySelectorAll<HTMLElement>(selector)).filter((element) => {
        if (element.closest(excluded) || !element.textContent?.trim()) return false;
        if (element.dataset.poilianSource) element.textContent = element.dataset.poilianSource;
        return element.children.length === 0 || element.matches("a");
      });
      if (locale === "en") return;

      const originals = elements.map((element) => element.textContent?.trim() || "");
      for (let start = 0; start < originals.length; start += 50) {
        try {
          const response = await fetch("/api/translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ locale, texts: originals.slice(start, start + 50) }) });
          const data = await response.json() as { translations?: string[] };
          (data.translations ?? []).forEach((translation, index) => {
            const element = elements[start + index];
            const original = originals[start + index];
            if (cancelled || currentRequest !== requestId || !element || !translation || translation === original) return;
            element.dataset.poilianSource = original;
            element.textContent = translation;
          });
        } catch { /* Preserve the original content when translation is unavailable. */ }
      }
    }

    void applyLocale();
    const updateLocale = (event: Event) => void applyLocale((event as CustomEvent<Locale>).detail);
    window.addEventListener("poilian-locale-change", updateLocale);
    return () => { cancelled = true; window.removeEventListener("poilian-locale-change", updateLocale); };
  }, []);
  return null;
}
