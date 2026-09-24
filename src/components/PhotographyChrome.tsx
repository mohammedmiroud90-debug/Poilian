"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { SiteLogo } from "@/components/SiteLogo";
import { LanguageSelect } from "@/components/LanguageSelect";
import { usePoilianLocale } from "@/hooks/usePoilianLocale";

const nav = {
  en: [
    { href: "/en", label: "Home" },
    { href: "/posts", label: "Posts" },
    { href: "/projects", label: "Projects" },
    { href: "/photography", label: "Photography" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
  fr: [
    { href: "/en", label: "Accueil" },
    { href: "/posts", label: "Articles" },
    { href: "/projects", label: "Projets" },
    { href: "/photography", label: "Photographie" },
    { href: "/about", label: "À propos" },
    { href: "/contact", label: "Contact" },
  ],
  ar: [
    { href: "/en", label: "الرئيسية" },
    { href: "/posts", label: "المقالات" },
    { href: "/projects", label: "المشاريع" },
    { href: "/photography", label: "التصوير" },
    { href: "/about", label: "من أنا" },
    { href: "/contact", label: "تواصل" },
  ],
} as const;

const searchCopy = {
  en: { search: "Search", placeholder: "Search photography, posts…", submit: "Go" },
  fr: { search: "Rechercher", placeholder: "Rechercher photos, articles…", submit: "OK" },
  ar: { search: "بحث", placeholder: "ابحث في التصوير والمقالات…", submit: "اذهب" },
} as const;

function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14.5 8.5V6.8c0-.7.1-1.1 1.2-1.1H17V3h-2.3C11.9 3 11 4.6 11 6.6v1.9H9v2.8h2V21h3.5v-9.7h2.3l.4-2.8h-2.7Z"
      />
    </svg>
  );
}
function IconX() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M5.4 4h3.4l3.3 4.7L16.2 4H19l-5.1 6.4L19.4 20h-3.4l-3.7-5.2L7.8 20H5l5.5-6.9L5.4 4Zm2.5 1.4 8.2 13.2h1.3L9.2 5.4H7.9Z"
      />
    </svg>
  );
}
function IconYoutube() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.6 8.2a2.4 2.4 0 0 0-1.7-1.7C18.3 6.1 12 6.1 12 6.1s-6.3 0-7.9.4A2.4 2.4 0 0 0 2.4 8.2 25 25 0 0 0 2 12a25 25 0 0 0 .4 3.8 2.4 2.4 0 0 0 1.7 1.7c1.6.4 7.9.4 7.9.4s6.3 0 7.9-.4a2.4 2.4 0 0 0 1.7-1.7A25 25 0 0 0 22 12a25 25 0 0 0-.4-3.8ZM10 15.1V8.9l5.2 3.1L10 15.1Z"
      />
    </svg>
  );
}
function IconLinkedIn() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6.2 8.4A2.2 2.2 0 1 0 6.2 4a2.2 2.2 0 0 0 0 4.4ZM4.3 20h3.8V10H4.3v10ZM10.5 10v10h3.8v-5c0-1.3.2-2.6 1.9-2.6 1.7 0 1.7 1.6 1.7 2.7V20h3.8v-5.6c0-3.5-.8-6.1-4.9-6.1-2 0-3.3 1.1-3.8 2.1h-.1V10h-3.4Z"
      />
    </svg>
  );
}
function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 7.4A4.6 4.6 0 1 0 12 16.6 4.6 4.6 0 0 0 12 7.4Zm0 7.5a2.9 2.9 0 1 1 0-5.8 2.9 2.9 0 0 1 0 5.8Zm5.9-8.7a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM12 3.5c-2.3 0-2.6 0-3.5.1-2.3.1-3.5 1.3-3.6 3.6-.1.9-.1 1.2-.1 3.5s0 2.6.1 3.5c.1 2.3 1.3 3.5 3.6 3.6.9.1 1.2.1 3.5.1s2.6 0 3.5-.1c2.3-.1 3.5-1.3 3.6-3.6.1-.9.1-1.2.1-3.5s0-2.6-.1-3.5c-.1-2.3-1.3-3.5-3.6-3.6-.9-.1-1.2-.1-3.5-.1Zm0 1.5c2.2 0 2.5 0 3.4.1 1.7.1 2.5.9 2.6 2.6.1.9.1 1.1.1 3.3s0 2.4-.1 3.3c-.1 1.7-.9 2.5-2.6 2.6-.9.1-1.2.1-3.4.1s-2.5 0-3.4-.1c-1.7-.1-2.5-.9-2.6-2.6-.1-.9-.1-1.1-.1-3.3s0-2.4.1-3.3c.1-1.7.9-2.5 2.6-2.6.9-.1 1.2-.1 3.4-.1Z"
      />
    </svg>
  );
}

const utilityCopy = {
  en: { support: "Support", faq: "FAQ", login: "Login", search: "Search" },
  fr: { support: "Support", faq: "FAQ", login: "Connexion", search: "Rechercher" },
  ar: { support: "الدعم", faq: "الأسئلة", login: "دخول", search: "بحث" },
} as const;

function ChevronDown() {
  return (
    <svg className="photo-df-chevron" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2.4 4.2 6 8l3.6-3.8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="photo-df-user" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="9" r="3.2" fill="currentColor" />
      <path d="M5.5 19.2a6.5 6.5 0 0 1 13 0" fill="currentColor" />
    </svg>
  );
}

export function PhotographyHeader() {
  const [locale, setLocale] = usePoilianLocale();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const links = nav[locale];
  const search = searchCopy[locale];
  const utility = utilityCopy[locale];

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = query.trim();
    window.location.assign(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
  }

  return (
    <header className="photo-df-header poilian-locale-copy" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="photo-df-utility">
        <div className="photo-chrome-shell photo-df-utility-inner">
          <nav className="photo-df-utility-left" aria-label="Support">
            <Link href="/contact">
              <ChevronDown />
              {utility.support}
            </Link>
            <Link href="/ask-me">{utility.faq}</Link>
          </nav>
          <div className="photo-df-utility-right">
            <LanguageSelect value={locale} onLocaleChange={setLocale} />
            <Link className="photo-df-login" href="/admin">
              <ChevronDown />
              {utility.login}
              <UserIcon />
            </Link>
          </div>
        </div>
      </div>

      <div className="photo-df-main">
        <div className="photo-chrome-shell photo-df-main-inner">
          <Link className="photo-df-logo" href="/en" aria-label="Poilian home">
            <SiteLogo alt="Poilian" width={148} height={40} priority />
          </Link>

          <nav className="photo-df-nav" aria-label="Main navigation">
            {links.map((item) => (
              <Link key={item.href} href={item.href} className={item.href === "/photography" ? "is-active" : ""}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="photo-df-actions">
            <a
              className="photo-df-linkedin"
              href="https://www.linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M6.2 8.4A2.2 2.2 0 1 0 6.2 4a2.2 2.2 0 0 0 0 4.4ZM4.3 20h3.8V10H4.3v10ZM10.5 10v10h3.8v-5c0-1.3.2-2.6 1.9-2.6 1.7 0 1.7 1.6 1.7 2.7V20h3.8v-5.6c0-3.5-.8-6.1-4.9-6.1-2 0-3.3 1.1-3.8 2.1h-.1V10h-3.4Z"
                />
              </svg>
            </a>
            <button
              type="button"
              className={`photo-df-search-btn${searchOpen ? " is-open" : ""}`}
              aria-expanded={searchOpen}
              aria-controls="photo-chrome-search"
              onClick={() => setSearchOpen((open) => !open)}
            >
              <span>{utility.search}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="10.8" cy="10.8" r="5.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <path d="m15.2 15.2 4.2 4.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {searchOpen && (
        <form id="photo-chrome-search" className="photo-df-search-bar" onSubmit={onSearch} role="search">
          <div className="photo-chrome-shell photo-df-search-inner">
            <label className="sr-only" htmlFor="photo-search-input">
              {search.search}
            </label>
            <input
              id="photo-search-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={search.placeholder}
              autoFocus
              maxLength={120}
            />
            <button type="submit">{search.submit}</button>
          </div>
        </form>
      )}
    </header>
  );
}

const footerCopy = {
  en: {
    explore: "Explore",
    company: "Company",
    legal: "Legal",
    support: "Support",
    blog: "Blog",
    exploreLinks: [
      { href: "/photography", label: "Gallery" },
      { href: "/posts", label: "Journal" },
      { href: "/projects", label: "Projects" },
      { href: "/notes", label: "Notes" },
      { href: "/ask-me", label: "Ask me" },
    ],
    companyLinks: [
      { href: "/about", label: "About" },
      { href: "/en", label: "Home" },
      { href: "/services", label: "Services" },
      { href: "https://market.bitt-i.com", label: "Market", external: true },
    ],
    legalLinks: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/legal", label: "Legal notice" },
      { href: "/security", label: "Security" },
      { href: "/accessibility", label: "Accessibility" },
    ],
    supportLinks: [
      { href: "/contact", label: "Contact" },
      { href: "/photographyapply", label: "Book a shoot" },
      { href: "/ask-me", label: "Questions" },
      { href: "/admin", label: "Admin" },
    ],
    rights: "All rights reserved.",
    chat: "Questions?",
    chatStrong: "Chat",
  },
  fr: {
    explore: "Explorer",
    company: "Entreprise",
    legal: "Légal",
    support: "Support",
    blog: "Blog",
    exploreLinks: [
      { href: "/photography", label: "Galerie" },
      { href: "/posts", label: "Journal" },
      { href: "/projects", label: "Projets" },
      { href: "/notes", label: "Notes" },
      { href: "/ask-me", label: "Ask me" },
    ],
    companyLinks: [
      { href: "/about", label: "À propos" },
      { href: "/en", label: "Accueil" },
      { href: "/services", label: "Services" },
      { href: "https://market.bitt-i.com", label: "Marché", external: true },
    ],
    legalLinks: [
      { href: "/privacy", label: "Confidentialité" },
      { href: "/terms", label: "Conditions" },
      { href: "/legal", label: "Mentions légales" },
      { href: "/security", label: "Sécurité" },
      { href: "/accessibility", label: "Accessibilité" },
    ],
    supportLinks: [
      { href: "/contact", label: "Contact" },
      { href: "/photographyapply", label: "Réserver" },
      { href: "/ask-me", label: "Questions" },
      { href: "/admin", label: "Admin" },
    ],
    rights: "Tous droits réservés.",
    chat: "Questions ?",
    chatStrong: "Chat",
  },
  ar: {
    explore: "استكشف",
    company: "الشركة",
    legal: "قانوني",
    support: "الدعم",
    blog: "المدونة",
    exploreLinks: [
      { href: "/photography", label: "المعرض" },
      { href: "/posts", label: "المدونة" },
      { href: "/projects", label: "المشاريع" },
      { href: "/notes", label: "ملاحظات" },
      { href: "/ask-me", label: "اسألني" },
    ],
    companyLinks: [
      { href: "/about", label: "من أنا" },
      { href: "/en", label: "الرئيسية" },
      { href: "/services", label: "الخدمات" },
      { href: "https://market.bitt-i.com", label: "السوق", external: true },
    ],
    legalLinks: [
      { href: "/privacy", label: "الخصوصية" },
      { href: "/terms", label: "الشروط" },
      { href: "/legal", label: "إشعار قانوني" },
      { href: "/security", label: "الأمن" },
      { href: "/accessibility", label: "إمكانية الوصول" },
    ],
    supportLinks: [
      { href: "/contact", label: "تواصل" },
      { href: "/photographyapply", label: "حجز جلسة" },
      { href: "/ask-me", label: "أسئلة" },
      { href: "/admin", label: "الإدارة" },
    ],
    rights: "جميع الحقوق محفوظة.",
    chat: "أسئلة؟",
    chatStrong: "محادثة",
  },
} as const;

export function PhotographyFooter() {
  const [locale] = usePoilianLocale();
  const text = footerCopy[locale];
  const columns = [
    { title: text.explore, links: text.exploreLinks },
    { title: text.company, links: text.companyLinks },
    { title: text.legal, links: text.legalLinks },
    { title: text.support, links: text.supportLinks },
  ];

  return (
    <footer className="photo-chrome-footer poilian-locale-copy" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="photo-chrome-shell photo-chrome-footer-grid">
        <div className="photo-chrome-columns">
          {columns.map((column) => (
            <section key={column.title}>
              <h3>{column.title}</h3>
              {column.links.map((link) => (
                "external" in link && link.external ? (
                  <a key={link.href + link.label} href={link.href} target="_blank" rel="noreferrer">
                    {link.label}
                  </a>
                ) : (
                  <Link key={link.href + link.label} href={link.href}>
                    {link.label}
                  </Link>
                )
              ))}
            </section>
          ))}
        </div>
        <div className="photo-chrome-aside">
          <Link className="photo-chrome-blog" href="/posts">
            {text.blog}
          </Link>
          <nav className="photo-chrome-social" aria-label="Social">
            <a href="https://www.facebook.com" aria-label="Facebook" target="_blank" rel="noreferrer">
              <IconFacebook />
            </a>
            <a href="https://x.com" aria-label="X" target="_blank" rel="noreferrer">
              <IconX />
            </a>
            <a href="https://www.youtube.com" aria-label="YouTube" target="_blank" rel="noreferrer">
              <IconYoutube />
            </a>
            <a href="https://www.instagram.com" aria-label="Instagram" target="_blank" rel="noreferrer">
              <IconInstagram />
            </a>
            <a href="https://www.linkedin.com" aria-label="LinkedIn" target="_blank" rel="noreferrer">
              <IconLinkedIn />
            </a>
          </nav>
          <p className="photo-chrome-copy">© 2026 Belhachemia Mohammed. {text.rights}</p>
        </div>
      </div>
      <Link className="photo-chrome-chat" href="/contact" aria-label={`${text.chat} ${text.chatStrong}`}>
        <span>{text.chat}</span>
        <strong>{text.chatStrong}</strong>
      </Link>
    </footer>
  );
}
