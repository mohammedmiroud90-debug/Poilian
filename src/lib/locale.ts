export type Locale = "en" | "fr" | "ar";

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "fr" || value === "ar";
}

export function readLocaleCookie(): Locale | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)poilian-locale=(en|fr|ar)(?:;|$)/);
  return match && isLocale(match[1]) ? match[1] : null;
}

/** Preferred locale from localStorage, then cookie (syncs cookie → storage). */
export function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const fromStorage = localStorage.getItem("poilian-locale");
  if (isLocale(fromStorage)) return fromStorage;
  const fromCookie = readLocaleCookie();
  if (fromCookie) {
    try {
      localStorage.setItem("poilian-locale", fromCookie);
    } catch {
      /* private mode */
    }
    return fromCookie;
  }
  return "en";
}

export function applyDocumentLocale(locale: Locale) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
}
