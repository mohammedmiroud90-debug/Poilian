"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const noticeKey = "poilian-personal-cookie-notice-dismissed";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => setVisible(window.localStorage.getItem(noticeKey) !== "true"), []);

  function dismiss() {
    window.localStorage.setItem(noticeKey, "true");
    setVisible(false);
  }

  if (!visible) return null;

  return <aside className="cookie-banner" aria-label="Cookie notice"><div className="cookie-banner-top"><span className="cookie-language">⌘ <span>English</span><i aria-hidden="true">⌄</i></span><button type="button" className="cookie-close" onClick={dismiss} aria-label="Dismiss cookie notice">×</button></div><p>We use cookies and similar technologies to enable essential site functionality and to support analytics, personalization, and marketing. By continuing to browse, you accept the use of non-essential cookies. For more information, see our <Link href="/privacy">Privacy Policy</Link>.</p></aside>;
}
