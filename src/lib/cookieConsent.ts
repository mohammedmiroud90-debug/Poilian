export type CookieConsent = "all" | "necessary";

export const CONSENT_STORAGE_KEY = "poilian-personal-cookie-consent";
export const CONSENT_COOKIE = "poilian-cookie-consent";
/** Legacy dismiss flag — migrated into real consent when present. */
export const NOTICE_STORAGE_KEY = "poilian-personal-cookie-notice-dismissed";
export const CONSENT_EVENT = "poilian-cookie-consent";
export const OPEN_COOKIE_SETTINGS_EVENT = "poilian-open-cookie-settings";

function readCookieConsent(): CookieConsent | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)poilian-cookie-consent=(all|necessary)(?:;|$)/);
  const value = match?.[1];
  return value === "all" || value === "necessary" ? value : null;
}

/** Current consent, or null when the visitor has not chosen yet. */
export function readConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const fromStorage = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (fromStorage === "all" || fromStorage === "necessary") return fromStorage;
  } catch {
    /* private mode */
  }
  const fromCookie = readCookieConsent();
  if (fromCookie) {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, fromCookie);
    } catch {
      /* ignore */
    }
    return fromCookie;
  }
  return null;
}

export function hasAnalyticsConsent(): boolean {
  return readConsent() === "all";
}

export function writeConsent(consent: CookieConsent) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, consent);
    window.localStorage.setItem(NOTICE_STORAGE_KEY, "true");
  } catch {
    /* ignore */
  }
  document.cookie = `${CONSENT_COOKIE}=${consent};path=/;max-age=31536000;SameSite=Lax`;
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: { consent } }));
}

export function openCookieSettings() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT));
}
