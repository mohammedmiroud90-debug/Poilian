"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Records one first-party page view per browser session and path; no identity, IP or fingerprint is stored. */
export function AnalyticsTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const key = `poilian-page-view:${pathname}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    void fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: pathname }), keepalive: true }).catch(() => undefined);
  }, [pathname]);
  return null;
}
