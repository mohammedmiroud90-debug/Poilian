"use client";

import { useEffect } from "react";
import { applyDocumentLocale, getStoredLocale } from "@/lib/locale";

/** Applies saved locale to `<html>` on every route (including after Cloudflare navigations). */
export function LocaleBootstrap() {
  useEffect(() => {
    applyDocumentLocale(getStoredLocale());
  }, []);
  return null;
}
