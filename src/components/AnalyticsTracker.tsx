"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { CONSENT_EVENT, hasAnalyticsConsent } from "@/lib/cookieConsent";

/** Records one first-party page view per browser session and path; only when analytics consent is granted. */
export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    function track() {
      if (pathname.startsWith("/admin") || pathname.startsWith("/space")) return;
      if (!hasAnalyticsConsent()) return;
      const key = `poilian-page-view:${pathname}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
      void fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathname }),
        keepalive: true,
      }).catch(() => undefined);
    }

    track();
    window.addEventListener(CONSENT_EVENT, track);
    return () => window.removeEventListener(CONSENT_EVENT, track);
  }, [pathname]);

  return null;
}
