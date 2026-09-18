"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/components/LanguageSelect";
import { SiteLogo } from "@/components/SiteLogo";
import { usePoilianLocale } from "@/hooks/usePoilianLocale";
import {
  OPEN_COOKIE_SETTINGS_EVENT,
  readConsent,
  writeConsent,
  type CookieConsent,
} from "@/lib/cookieConsent";

type CookieCopy = {
  title: string;
  p1: string;
  p2Before: string;
  cookiePolicy: string;
  p2Mid: string;
  privacy: string;
  p2After: string;
  p3: string;
  p4: string;
  imprint: string;
  accept: string;
  necessary: string;
  customize: string;
  customizeTitle: string;
  necessaryLabel: string;
  necessaryHelp: string;
  analyticsLabel: string;
  analyticsHelp: string;
  confirm: string;
  back: string;
};

const copy: Record<Locale, CookieCopy> = {
  en: {
    title: "We use cookies",
    p1: "We use cookies and similar technologies to keep the site working, remember your preferences, and understand which pages are useful.",
    p2Before: "You can learn more in our ",
    cookiePolicy: "Cookie Policy",
    p2Mid: " and ",
    privacy: "Privacy Policy",
    p2After: ".",
    p3: "Necessary cookies are always active. Optional analytics cookies are anonymous and first-party only.",
    p4: "Choose Accept to allow analytics, Only necessary to keep essentials, or Settings to customize. Analytics stay off until you opt in.",
    imprint: "Terms",
    accept: "Accept",
    necessary: "Only necessary",
    customize: "Settings",
    customizeTitle: "Customize your cookie preferences",
    necessaryLabel: "Necessary cookies",
    necessaryHelp: "Required for the site to function. Always active.",
    analyticsLabel: "Analytics cookies",
    analyticsHelp: "Helps understand which pages are useful. Anonymous, first-party only. Off until you enable them.",
    confirm: "Confirm choices",
    back: "Back",
  },
  fr: {
    title: "Nous utilisons des cookies",
    p1: "Nous utilisons des cookies et des technologies similaires pour faire fonctionner le site, mémoriser vos préférences et comprendre quelles pages sont utiles.",
    p2Before: "Vous pouvez en savoir plus dans notre ",
    cookiePolicy: "Politique relative aux cookies",
    p2Mid: " et notre ",
    privacy: "Politique de confidentialité",
    p2After: ".",
    p3: "Les cookies nécessaires sont toujours actifs. Les cookies d’analyse optionnels sont anonymes et first-party uniquement.",
    p4: "Choisissez Accepter pour autoriser l’analyse, Uniquement nécessaires pour les essentiels, ou Paramètres pour personnaliser. L’analyse reste inactive tant que vous n’avez pas consenti.",
    imprint: "Conditions",
    accept: "Accepter",
    necessary: "Uniquement nécessaires",
    customize: "Paramètres",
    customizeTitle: "Personnaliser vos préférences de cookies",
    necessaryLabel: "Cookies nécessaires",
    necessaryHelp: "Requis pour le fonctionnement du site. Toujours actifs.",
    analyticsLabel: "Cookies d'analyse",
    analyticsHelp: "Aident à comprendre quelles pages sont utiles. Anonymes et first-party uniquement. Désactivés jusqu’à votre accord.",
    confirm: "Confirmer les choix",
    back: "Retour",
  },
  ar: {
    title: "نستخدم ملفات تعريف الارتباط",
    p1: "نستخدم ملفات تعريف الارتباط وتقنيات مشابهة لتشغيل الموقع وتذكر تفضيلاتك وفهم الصفحات المفيدة.",
    p2Before: "يمكنك معرفة المزيد في ",
    cookiePolicy: "سياسة ملفات تعريف الارتباط",
    p2Mid: " و",
    privacy: "سياسة الخصوصية",
    p2After: ".",
    p3: "ملفات تعريف الارتباط الضرورية نشطة دائمًا. ملفات التحليل الاختيارية مجهولة ومن الطرف الأول فقط.",
    p4: "اختر قبول للتحليلات، أو الضروري فقط، أو الإعدادات للتخصيص. تبقى التحليلات متوقفة حتى توافق.",
    imprint: "الشروط",
    accept: "قبول",
    necessary: "الضروري فقط",
    customize: "الإعدادات",
    customizeTitle: "تخصيص تفضيلات ملفات تعريف الارتباط",
    necessaryLabel: "ملفات تعريف الارتباط الضرورية",
    necessaryHelp: "مطلوبة لعمل الموقع. نشطة دائمًا.",
    analyticsLabel: "ملفات تحليلات",
    analyticsHelp: "تساعد على فهم الصفحات المفيدة. مجهولة ومن الطرف الأول فقط. متوقفة حتى تفعّلها.",
    confirm: "تأكيد الاختيارات",
    back: "رجوع",
  },
};

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [locale] = usePoilianLocale();

  useEffect(() => {
    const existing = readConsent();
    setVisible(existing === null);
    setAnalyticsEnabled(existing === "all");

    function onOpenSettings() {
      const current = readConsent();
      setAnalyticsEnabled(current === "all");
      setCustomizing(true);
      setVisible(true);
    }
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, onOpenSettings);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, onOpenSettings);
  }, []);

  function save(consent: CookieConsent) {
    writeConsent(consent);
    setVisible(false);
    setCustomizing(false);
  }

  if (!visible) return null;
  const text = copy[locale];

  return (
    <div className="cookie-overlay" role="presentation">
      <aside
        className="cookie-banner cookie-banner--modal poilian-locale-copy"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-banner-title"
        dir={locale === "ar" ? "rtl" : "ltr"}
      >
        {!customizing ? (
          <>
            <div className="cookie-banner-head">
              <h2 id="cookie-banner-title" className="cookie-banner-title">
                {text.title}
              </h2>
              <div className="cookie-banner-brand" aria-hidden="true">
                <SiteLogo alt="" width={160} height={60} />
              </div>
            </div>
            <div className="cookie-banner-body">
              <p>{text.p1}</p>
              <p>
                {text.p2Before}
                <Link href="/privacy">{text.cookiePolicy}</Link>
                {text.p2Mid}
                <Link href="/privacy">{text.privacy}</Link>
                {text.p2After}
              </p>
              <p>{text.p3}</p>
              <p>{text.p4}</p>
            </div>
            <div className="cookie-banner-foot">
              <nav className="cookie-banner-links" aria-label={text.cookiePolicy}>
                <Link href="/privacy">{text.cookiePolicy}</Link>
                <Link href="/privacy">{text.privacy}</Link>
                <Link href="/terms">{text.imprint}</Link>
              </nav>
              <div className="cookie-banner-actions">
                <button type="button" className="cookie-btn cookie-btn-ghost" onClick={() => setCustomizing(true)}>
                  {text.customize}
                </button>
                <div className="cookie-banner-actions-end">
                  <button type="button" className="cookie-btn cookie-btn-ghost" onClick={() => save("necessary")}>
                    {text.necessary}
                  </button>
                  <button type="button" className="cookie-btn cookie-btn-primary" onClick={() => save("all")}>
                    {text.accept}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="cookie-banner-head">
              <h2 id="cookie-banner-title" className="cookie-banner-title">
                {text.customizeTitle}
              </h2>
              <div className="cookie-banner-brand" aria-hidden="true">
                <SiteLogo alt="" width={160} height={60} />
              </div>
            </div>
            <div className="cookie-banner-body">
              <div className="cookie-toggle-row">
                <div>
                  <strong>{text.necessaryLabel}</strong>
                  <span>{text.necessaryHelp}</span>
                </div>
                <label className="cookie-switch cookie-switch-locked" aria-disabled="true">
                  <input type="checkbox" checked disabled readOnly />
                  <span />
                </label>
              </div>
              <div className="cookie-toggle-row">
                <div>
                  <strong>{text.analyticsLabel}</strong>
                  <span>{text.analyticsHelp}</span>
                </div>
                <label className="cookie-switch">
                  <input
                    type="checkbox"
                    checked={analyticsEnabled}
                    onChange={(event) => setAnalyticsEnabled(event.target.checked)}
                  />
                  <span />
                </label>
              </div>
            </div>
            <div className="cookie-banner-foot">
              <div className="cookie-banner-actions">
                <button type="button" className="cookie-btn cookie-btn-ghost" onClick={() => setCustomizing(false)}>
                  {text.back}
                </button>
                <div className="cookie-banner-actions-end">
                  <button
                    type="button"
                    className="cookie-btn cookie-btn-primary"
                    onClick={() => save(analyticsEnabled ? "all" : "necessary")}
                  >
                    {text.confirm}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
