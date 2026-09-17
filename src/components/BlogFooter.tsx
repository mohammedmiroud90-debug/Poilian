"use client";

import Link from "next/link";
import type { Locale } from "@/components/LanguageSelect";
import { usePoilianLocale } from "@/hooks/usePoilianLocale";
import { FooterDottedMap } from "@/components/FooterDottedMap";
import { SiteLogo } from "@/components/SiteLogo";

const copy: Record<Locale, { description: string; admin: string; space: string; rights: string; links: [string, string, string, string, string] }> = {
  en: { description: "Stories, research and local insight from Algeria.", admin: "Admin login", space: "My space", rights: "All Rights Reserved.", links: ["Home", "Posts", "Projects", "About", "Contact"] },
  fr: { description: "Récits, recherches et perspectives locales depuis l’Algérie.", admin: "Connexion administrateur", space: "Mon espace", rights: "Tous droits réservés.", links: ["Accueil", "Articles", "Projets", "À propos", "Contact"] },
  ar: { description: "قصص وأبحاث ورؤى محلية من الجزائر.", admin: "دخول الإدارة", space: "مساحتي", rights: "جميع الحقوق محفوظة.", links: ["الرئيسية", "المقالات", "المشاريع", "من نحن", "اتصل بنا"] },
};

export function BlogFooter() {
  const [locale] = usePoilianLocale();
  const text = copy[locale];
  return (
    <footer className="personal-footer poilian-locale-copy reference-footer-wrap" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="reference-footer-main">
        <FooterDottedMap />
        <div className="reference-footer">
          <div className="reference-footer-top">
            <div className="reference-footer-brand">
              <Link className="reference-footer-logo" href="/en" aria-label="Poilian home">
                <SiteLogo alt="Poilian" width={180} height={74} />
              </Link>
              <p>{text.description}</p>
            </div>
            <div className="reference-footer-navs">
              <nav className="reference-footer-links" aria-label="Site links">
                <Link href="/en">{text.links[0]}</Link>
                <Link href="/posts">{text.links[1]}</Link>
                <Link href="/projects">{text.links[2]}</Link>
                <Link href="/about">{text.links[3]}</Link>
                <Link href="/contact">{text.links[4]}</Link>
                <Link href="/space">{text.space}</Link>
                <Link className="footer-admin-login" href="/admin">{text.admin}</Link>
              </nav>
              <nav className="reference-footer-social" aria-label="Social channels">
                <a href="https://www.linkedin.com">LinkedIn ↗</a>
                <a href="#x">X / Twitter ↗</a>
                <a href="#instagram">Instagram ↗</a>
              </nav>
            </div>
          </div>
          <div className="reference-footer-meta">
            <p>Built with care in Algeria.</p>
            <p className="reference-footer-copyright">© 2026 Belhachemia Mohammed. {text.rights}</p>
          </div>
        </div>
      </div>
      <div className="reference-footer-photo" role="img" aria-label="Footer visual" />
    </footer>
  );
}
