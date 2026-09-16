"use client";
import Link from "next/link";
import type { Locale } from "@/components/LanguageSelect";
import { usePoilianLocale } from "@/hooks/usePoilianLocale";
const copy: Record<Locale, { heads: string[]; links: string[][]; location: string; rights: string; made: string }> = { en: { heads: ["Navigate", "Explore", "Connect", "About this blog", "Poilian"], links: [["Home", "Blog posts", "Research"], ["Photography", "About me", "Archive"], ["Newsletter", "Contact", "LinkedIn"], ["About Belhachemia", "Research", "Privacy"], ["Our story", "Support", "Send feedback"]], location: "Algeria · DZD", rights: "© 2026 Belhachemia Mohammed. All rights reserved.", made: "Made with Poilian" }, fr: { heads: ["Navigation", "Explorer", "Contact", "À propos du blog", "Poilian"], links: [["Accueil", "Articles", "Recherche"], ["Photographie", "À propos", "Archives"], ["Newsletter", "Contact", "LinkedIn"], ["À propos de Belhachemia", "Recherche", "Confidentialité"], ["Notre histoire", "Assistance", "Envoyer un retour"]], location: "Algérie · DZD", rights: "© 2026 Belhachemia Mohammed. Tous droits réservés.", made: "Créé avec Poilian" }, ar: { heads: ["التنقل", "استكشف", "تواصل", "عن هذه المدونة", "Poilian"], links: [["الرئيسية", "المقالات", "الأبحاث"], ["التصوير", "من أنا", "الأرشيف"], ["النشرة البريدية", "اتصل بنا", "لينكدإن"], ["عن بلحاشمية", "الأبحاث", "الخصوصية"], ["قصتنا", "الدعم", "إرسال ملاحظات"]], location: "الجزائر · دج", rights: "© 2026 بلحاشمية محمد. جميع الحقوق محفوظة.", made: "صُنع بواسطة Poilian" } };
const hrefs = [["/en", "/posts", "/research"], ["/posts", "/about", "/posts"], ["#subscribe", "/contact", "https://www.linkedin.com"], ["/about", "/research", "/privacy"], ["#story", "#support", "#feedback"]];
export function HomeFooter() {
  const [locale] = usePoilianLocale();
  const text = copy[locale];
  return (
    <footer className="personal-footer poilian-locale-copy" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="personal-shell">
        <div className="footer-directory">
          {text.heads.map((heading, group) => (
            <section key={heading}>
              <h3>{heading}</h3>
              {text.links[group].map((label, index) => (
                <Link href={hrefs[group][index]} key={label}>
                  {label}
                </Link>
              ))}
            </section>
          ))}
        </div>
        <div className="footer-location">
          <span className="dz-flag">DZ</span>
          <span>{text.location}</span>
        </div>
        <div className="footer-bottom">
          <span>{text.rights}</span>
          <span>{text.made}</span>
        </div>
      </div>
    </footer>
  );
}
