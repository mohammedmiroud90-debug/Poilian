"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/components/LanguageSelect";
import { usePoilianLocale } from "@/hooks/usePoilianLocale";

type NicheCopy = {
  title: string;
  intro: string;
  introLinks: { label: string; href: string }[];
  introAfter: string;
  andWord: string;
  items: { title: string; body: string; tone: "green" | "pink" | "blue" }[];
  footer: string;
  footerLink: string;
};

const copy: Record<Locale, NicheCopy> = {
  en: {
    title: "A home for every niche.",
    intro: "Beyond the main journal, this site gathers writing, research, photography and questions across topics like ",
    introLinks: [
      { label: "Technology", href: "/posts?category=Technology" },
      { label: "Research", href: "/research" },
      { label: "Photography", href: "/photography" },
      { label: "Ask me", href: "/ask-me" },
    ],
    introAfter: " — each with its own corner.",
    andWord: " and ",
    items: [
      {
        title: "Building a library for everyone:",
        body: "Posts, notes and answers stay open so useful knowledge can be found again later.",
        tone: "green",
      },
      {
        title: "Find your people:",
        body: "From services and projects to photography and questions, follow the parts that matter to you.",
        tone: "pink",
      },
      {
        title: "You’re more than one topic:",
        body: "Explore across disciplines — writing, research, product work and personal notes — in one place.",
        tone: "blue",
      },
    ],
    footer: "Proud to keep knowledge open and free.",
    footerLink: "Browse all categories",
  },
  fr: {
    title: "Un espace pour chaque niche.",
    intro: "Au-delà du journal principal, ce site rassemble écriture, recherche, photographie et questions autour de thèmes comme ",
    introLinks: [
      { label: "Technologie", href: "/posts?category=Technology" },
      { label: "Recherche", href: "/research" },
      { label: "Photographie", href: "/photography" },
      { label: "Ask me", href: "/ask-me" },
    ],
    introAfter: " — chacun avec son propre coin.",
    andWord: " et ",
    items: [
      {
        title: "Construire une bibliothèque pour tous :",
        body: "Articles, notes et réponses restent ouverts pour que le savoir utile puisse être retrouvé plus tard.",
        tone: "green",
      },
      {
        title: "Trouver vos personnes :",
        body: "Des services et projets à la photographie et aux questions, suivez ce qui compte pour vous.",
        tone: "pink",
      },
      {
        title: "Vous êtes plus qu’un seul sujet :",
        body: "Explorez l’écriture, la recherche, le produit et les notes personnelles au même endroit.",
        tone: "blue",
      },
    ],
    footer: "Fiers de garder le savoir ouvert et libre.",
    footerLink: "Parcourir toutes les catégories",
  },
  ar: {
    title: "مساحة لكل اهتمام.",
    intro: "إلى جانب المدونة الرئيسية، يجمع هذا الموقع الكتابة والبحث والتصوير والأسئلة حول مواضيع مثل ",
    introLinks: [
      { label: "التكنولوجيا", href: "/posts?category=Technology" },
      { label: "البحث", href: "/research" },
      { label: "التصوير", href: "/photography" },
      { label: "اسألني", href: "/ask-me" },
    ],
    introAfter: " — ولكل منها ركن خاص.",
    andWord: " و",
    items: [
      {
        title: "بناء مكتبة للجميع:",
        body: "تبقى المقالات والملاحظات والإجابات مفتوحة حتى يمكن العثور على المعرفة المفيدة لاحقًا.",
        tone: "green",
      },
      {
        title: "اعثر على اهتماماتك:",
        body: "من الخدمات والمشاريع إلى التصوير والأسئلة، تابع ما يهمك.",
        tone: "pink",
      },
      {
        title: "أنت أكثر من موضوع واحد:",
        body: "استكشف الكتابة والبحث والعمل المنتج والملاحظات الشخصية في مكان واحد.",
        tone: "blue",
      },
    ],
    footer: "فخورون بالحفاظ على المعرفة مفتوحة وحرة.",
    footerLink: "تصفح كل الفئات",
  },
};

function NicheRightIcon({ tone }: { tone: "green" | "pink" | "blue" }) {
  if (tone === "green") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M8 6.5h12a4 4 0 0 1 4 4v15H12a4 4 0 0 0-4 4V6.5Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 25.5h12M12 12h8M12 16h8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (tone === "pink") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="14" cy="14" r="7" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M19.5 19.5 27 27" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <rect x="6" y="8" width="20" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="m6 10 10 7 10-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HomeNicheSection() {
  const [locale] = usePoilianLocale();
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const text = copy[locale];

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setInView(true);
      },
      { threshold: 0.22, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`home-niche poilian-locale-copy${inView ? " is-inview" : ""}`}
      aria-labelledby="home-niche-title"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <div className="personal-shell home-niche-grid">
        <div className="home-niche-copy">
          <h2 id="home-niche-title">{text.title}</h2>
          <p>
            {text.intro}
            {text.introLinks.map((link, index) => (
              <span key={link.href}>
                {index > 0 ? (index === text.introLinks.length - 1 ? text.andWord : ", ") : null}
                <Link href={link.href}>{link.label}</Link>
              </span>
            ))}
            {text.introAfter}
          </p>
          <ol className="df-resource-list home-niche-resources">
            {text.items.map((item, index) => (
              <li key={item.title} style={{ ["--step" as string]: index }}>
                <span className="df-resource-index" aria-hidden="true">
                  {index + 1}
                </span>
                <div className="df-resource-copy">
                  <strong>{item.title.replace(/:$/, "")}</strong>
                  <span>{item.body}</span>
                </div>
                <span className="df-resource-icon" aria-hidden="true">
                  <NicheRightIcon tone={item.tone} />
                </span>
              </li>
            ))}
          </ol>
          <p className="home-niche-footer">
            {text.footer}{" "}
            <Link href="/categories">{text.footerLink}</Link>.
          </p>
        </div>
        <div className="home-niche-art" aria-hidden="true">
          <div className="home-niche-helix">
            {Array.from({ length: 15 }).map((_, index) => {
              const t = index / 14;
              const width = 64 + t * 78;
              return (
                <span
                  key={index}
                  className="home-niche-block"
                  style={{
                    ["--i" as string]: index,
                    ["--w" as string]: `${width}px`,
                  }}
                >
                  <b className="face face-top" />
                  <b className="face face-front" />
                  <b className="face face-side" />
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
