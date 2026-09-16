"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/components/LanguageSelect";
import { usePoilianLocale } from "@/hooks/usePoilianLocale";

const noticeKey = "poilian-personal-cookie-notice-dismissed";
const consentKey = "poilian-personal-cookie-consent";

type CookieCopy = {
  introBefore: string;
  cookiePolicy: string;
  introAfter: string;
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
    introBefore: "By clicking “Accept all cookies”, you agree Poilian can store cookies on your device and disclose information in accordance with our ",
    cookiePolicy: "Cookie Policy",
    introAfter: ".",
    accept: "Accept all",
    necessary: "Necessary cookies only",
    customize: "Customize settings",
    customizeTitle: "Customize your cookie preferences",
    necessaryLabel: "Necessary cookies",
    necessaryHelp: "Required for the site to function. Always active.",
    analyticsLabel: "Analytics cookies",
    analyticsHelp: "Helps understand which pages are useful. Anonymous, first-party only.",
    confirm: "Confirm choices",
    back: "Back",
  },
  fr: {
    introBefore: "En cliquant sur « Accepter tous les cookies », vous acceptez que Poilian stocke des cookies sur votre appareil et divulgue des informations conformément à notre ",
    cookiePolicy: "Politique relative aux cookies",
    introAfter: ".",
    accept: "Tout accepter",
    necessary: "Cookies nécessaires uniquement",
    customize: "Personnaliser les paramètres",
    customizeTitle: "Personnaliser vos préférences de cookies",
    necessaryLabel: "Cookies nécessaires",
    necessaryHelp: "Requis pour le fonctionnement du site. Toujours actifs.",
    analyticsLabel: "Cookies d'analyse",
    analyticsHelp: "Aident à comprendre quelles pages sont utiles. Anonymes et first-party uniquement.",
    confirm: "Confirmer les choix",
    back: "Retour",
  },
  ar: {
    introBefore: "بالنقر على «قبول جميع ملفات تعريف الارتباط»، فإنك توافق على أن يخزّن Poilian ملفات تعريف الارتباط على جهازك ويكشف المعلومات وفقًا لـ ",
    cookiePolicy: "سياسة ملفات تعريف الارتباط",
    introAfter: ".",
    accept: "قبول الكل",
    necessary: "الضروري فقط",
    customize: "تخصيص الإعدادات",
    customizeTitle: "تخصيص تفضيلات ملفات تعريف الارتباط",
    necessaryLabel: "ملفات تعريف الارتباط الضرورية",
    necessaryHelp: "مطلوبة لعمل الموقع. نشطة دائمًا.",
    analyticsLabel: "ملفات تحليلات",
    analyticsHelp: "تساعد على فهم الصفحات المفيدة. مجهولة ومن الطرف الأول فقط.",
    confirm: "تأكيد الاختيارات",
    back: "رجوع",
  },
};

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [locale] = usePoilianLocale();

  useEffect(() => {
    setVisible(window.localStorage.getItem(noticeKey) !== "true");
  }, []);

  function save(consent: "all" | "necessary") {
    window.localStorage.setItem(noticeKey, "true");
    window.localStorage.setItem(consentKey, consent);
    setVisible(false);
  }

  if (!visible) return null;
  const text = copy[locale];

  return (
    <aside
      className="cookie-banner cookie-banner--se poilian-locale-copy"
      role="dialog"
      aria-modal="false"
      aria-label={text.cookiePolicy}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      {!customizing ? (
        <>
          <p className="cookie-banner-copy">
            {text.introBefore}
            <Link href="/privacy">{text.cookiePolicy}</Link>
            {text.introAfter}
          </p>
          <div className="cookie-banner-actions">
            <button type="button" className="cookie-btn cookie-btn-primary" onClick={() => save("all")}>
              {text.accept}
            </button>
            <button type="button" className="cookie-btn cookie-btn-primary" onClick={() => save("necessary")}>
              {text.necessary}
            </button>
          </div>
          <button type="button" className="cookie-customize-link" onClick={() => setCustomizing(true)}>
            {text.customize}
          </button>
        </>
      ) : (
        <>
          <p className="cookie-banner-title">{text.customizeTitle}</p>
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
          <div className="cookie-banner-actions">
            <button type="button" className="cookie-btn cookie-btn-ghost" onClick={() => setCustomizing(false)}>
              {text.back}
            </button>
            <button
              type="button"
              className="cookie-btn cookie-btn-primary"
              onClick={() => save(analyticsEnabled ? "all" : "necessary")}
            >
              {text.confirm}
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
