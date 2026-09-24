"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { LanguageSelect, type Locale } from "@/components/LanguageSelect";
import { usePoilianLocale } from "@/hooks/usePoilianLocale";
import { DottedWorldMap } from "@/components/DottedWorldMap";
import { SiteLogo } from "@/components/SiteLogo";

type Copy = {
  nav: string[];
  contact: string;
  subscribe: string;
  market: string;
  title: React.ReactNode;
  subtitle: string;
  posts: string;
  services: string;
  search: string;
  menu: string;
  closeSearch: string;
  searchLabel: string;
  closeMenu: string;
  chatTitle: string;
  chatHint: string;
  chatHello: string;
  chatPlaceholder: string;
  chatContact: string;
  chatToggle: string;
  letterLabel: string;
  letterTitle: string;
  letterBody: string;
  emailLabel: string;
  subscribeCta: string;
  subscribeThanks: string;
  closeSubscribe: string;
  noThanks: string;
  privacyNote: string;
  privacyLink: string;
};

const copy: Record<Locale, Copy> = {
  en: {
    nav: ["Home", "Blog posts", "Companies", "Personal notes", "Photography", "Ask me", "About me"],
    contact: "Contact",
    subscribe: "Subscribe",
    market: "Market",
    title: (
      <>
        Belhachemia, this is
        <br />
        my personal corner.
      </>
    ),
    subtitle: "Stories, thoughts, photography and the moments worth remembering.",
    posts: "View all posts",
    services: "Services",
    search: "Search posts",
    menu: "Open menu",
    closeSearch: "Close search",
    searchLabel: "SEARCH THE JOURNAL",
    closeMenu: "Close menu",
    chatTitle: "Chat with Poilian",
    chatHint: "Usually replies by email",
    chatHello: "Hello! How can I help you today?",
    chatPlaceholder: "Write a message…",
    chatContact: "Open full contact form",
    chatToggle: "Chat with me",
    letterLabel: "POILIAN LETTER",
    letterTitle: "Don't miss out on new notes",
    letterBody: "Enter your email to get occasional posts, selected work, and updates from this journal.",
    emailLabel: "Email address",
    subscribeCta: "Get started",
    subscribeThanks: "Thank you — you are on the list.",
    closeSubscribe: "Close subscription form",
    noThanks: "No thanks",
    privacyNote: "We use the information you provide in accordance with our ",
    privacyLink: "privacy policy",
  },
  fr: {
    nav: ["Accueil", "Articles", "Entreprises", "Notes personnelles", "Photographie", "Ask me", "À propos"],
    contact: "Contact",
    subscribe: "S'abonner",
    market: "Marché",
    title: (
      <>
        Belhachemia, voici
        <br />
        mon espace personnel.
      </>
    ),
    subtitle: "Histoires, réflexions, photographie et moments qui méritent d'être gardés en mémoire.",
    posts: "Voir tous les articles",
    services: "Services",
    search: "Rechercher des articles",
    menu: "Ouvrir le menu",
    closeSearch: "Fermer la recherche",
    searchLabel: "RECHERCHER DANS LE JOURNAL",
    closeMenu: "Fermer le menu",
    chatTitle: "Discuter avec Poilian",
    chatHint: "Répond généralement par e-mail",
    chatHello: "Bonjour ! Comment puis-je vous aider ?",
    chatPlaceholder: "Écrire un message…",
    chatContact: "Ouvrir le formulaire de contact",
    chatToggle: "Discuter avec moi",
    letterLabel: "LETTRE POILIAN",
    letterTitle: "Ne manquez pas les nouvelles notes",
    letterBody: "Entrez votre e-mail pour recevoir occasionnellement des articles, des travaux sélectionnés et des mises à jour.",
    emailLabel: "Adresse e-mail",
    subscribeCta: "Commencer",
    subscribeThanks: "Merci — vous êtes sur la liste.",
    closeSubscribe: "Fermer le formulaire d'abonnement",
    noThanks: "Non merci",
    privacyNote: "Nous utilisons les informations que vous fournissez conformément à notre ",
    privacyLink: "politique de confidentialité",
  },
  ar: {
    nav: ["الرئيسية", "المقالات", "الشركات", "ملاحظات شخصية", "التصوير", "اسألني", "من أنا"],
    contact: "تواصل",
    subscribe: "اشترك",
    market: "السوق",
    title: (
      <>
        بلحاشمية، هذه
        <br />
        مساحتي الشخصية.
      </>
    ),
    subtitle: "قصص وأفكار وتصوير ولحظات تستحق التذكر.",
    posts: "عرض كل المقالات",
    services: "الخدمات",
    search: "البحث في المقالات",
    menu: "فتح القائمة",
    closeSearch: "إغلاق البحث",
    searchLabel: "ابحث في المدونة",
    closeMenu: "إغلاق القائمة",
    chatTitle: "محادثة مع Poilian",
    chatHint: "عادةً ما يرد عبر البريد",
    chatHello: "مرحبًا! كيف يمكنني مساعدتك اليوم؟",
    chatPlaceholder: "اكتب رسالة…",
    chatContact: "فتح نموذج التواصل الكامل",
    chatToggle: "تحدث معي",
    letterLabel: "رسالة Poilian",
    letterTitle: "لا تفوّت الملاحظات الجديدة",
    letterBody: "أدخل بريدك لتصلك مقالات وأعمال مختارة وتحديثات من هذه المدونة من حين لآخر.",
    emailLabel: "البريد الإلكتروني",
    subscribeCta: "ابدأ",
    subscribeThanks: "شكرًا — أنت على القائمة.",
    closeSubscribe: "إغلاق نموذج الاشتراك",
    noThanks: "لا، شكرًا",
    privacyNote: "نستخدم المعلومات التي تقدمها وفقًا لـ ",
    privacyLink: "سياسة الخصوصية",
  },
};

const paths = ["/en", "/posts", "/projects", "/notes", "/photography", "/ask-me", "/about"];

export function HomeHero({ authorAvatarUrl }: { authorAvatarUrl: string }) {
  const [locale, setLocale] = usePoilianLocale();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatSent, setChatSent] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [subscribeNotice, setSubscribeNotice] = useState("");
  const [query, setQuery] = useState("");
  const text = copy[locale];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.location.assign(query.trim() ? `/posts?query=${encodeURIComponent(query.trim())}` : "/posts");
  }
  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (chatMessage.trim()) setChatSent(true);
  }
  function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubscribeNotice(text.subscribeThanks);
  }

  return (
    <section className="personal-hero poilian-locale-copy" dir={locale === "ar" ? "rtl" : "ltr"}>
      <DottedWorldMap
        className="hero-dotted-map"
        patternId="hero-map-dots"
        maskId="hero-map-mask"
        dotFill="rgba(220,232,248,0.42)"
      />
      <div className="personal-shell">
        <header className="personal-topbar">
          <Link className="personal-logo" href="/en">
            <SiteLogo alt="Poilian" width={120} height={50} priority />
          </Link>
          <div className="personal-account">
            <LanguageSelect value={locale} onLocaleChange={setLocale} />
            <button className="search-toggle" type="button" onClick={() => setSearchOpen((open) => !open)} aria-label={text.search}>
              ⌕
            </button>
            <Link href="/contact">{text.contact}</Link>
            <button
              className="hero-subscribe"
              type="button"
              onClick={() => {
                setSubscribeNotice("");
                setSubscribeOpen(true);
              }}
            >
              {text.subscribe}
            </button>
            <a href="https://market.bitt-i.com" className="hero-market-link" target="_blank" rel="noreferrer">
              {text.market} <span>↗</span>
            </a>
            <a className="linkedin-link" href="https://www.linkedin.com" target="_blank" rel="noreferrer">
              in
            </a>
            <button
              className={`menu-toggle${menuOpen ? " is-open" : ""}`}
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="home-menu"
              aria-label={text.menu}
            >
              <i />
              <i />
              <i />
            </button>
          </div>
        </header>
        {searchOpen && (
          <div className="hero-search-overlay" role="dialog" aria-modal="true" aria-label={text.search}>
            <form className="hero-search" onSubmit={submit}>
              <button className="hero-search-close" type="button" onClick={() => setSearchOpen(false)} aria-label={text.closeSearch}>
                ×
              </button>
              <p>{text.searchLabel}</p>
              <input value={query} onChange={(event) => setQuery(event.target.value)} autoFocus placeholder={text.search} />
              <button type="submit">
                {text.search} <span>↗</span>
              </button>
            </form>
          </div>
        )}
        <nav id="home-menu" className={`personal-nav${menuOpen ? " is-open" : ""}`} aria-label="Main navigation">
          <div className="home-mobile-menu-head">
            <span>POILIAN</span>
            <button className="home-mobile-menu-close" type="button" onClick={() => setMenuOpen(false)} aria-label={text.closeMenu}>
              ×
            </button>
          </div>
          {text.nav.map((label, index) => (
            <Link
              className={index === 0 ? "active" : ""}
              href={paths[index]}
              onClick={() => setMenuOpen(false)}
              key={`${index}-${label}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="personal-copy">
          <h1>{text.title}</h1>
          <h2>{text.subtitle}</h2>
          <div className="hero-links">
            <Link className="hero-post-link" href="/posts">
              {text.posts} <span>↗</span>
            </Link>
            <Link className="hero-post-link" href="/services">
              {text.services} <span>↗</span>
            </Link>
          </div>
        </div>
        <Image className="hero-right-image" src="/heroimage.png" alt="" width={520} height={520} priority />
        <aside className={`home-chat${chatOpen ? " is-open" : ""}`} aria-label={text.chatTitle}>
          {chatOpen && (
            <div className="home-chat-panel">
              <header>
                <img className="chat-avatar" src={authorAvatarUrl} alt="Poilian" width={32} height={32} />
                <div>
                  <strong>{text.chatTitle}</strong>
                  <small>{text.chatHint}</small>
                </div>
              </header>
              <div className="chat-thread">
                {chatSent ? <p className="chat-message mine">{chatMessage}</p> : <p className="chat-message">{text.chatHello}</p>}
              </div>
              <form className="chat-compose" onSubmit={sendMessage}>
                <input
                  value={chatMessage}
                  onChange={(event) => {
                    setChatMessage(event.target.value);
                    setChatSent(false);
                  }}
                  placeholder={text.chatPlaceholder}
                  aria-label={text.chatPlaceholder}
                />
                <button type="submit" aria-label="Send message">
                  →
                </button>
              </form>
              <Link className="chat-contact-link" href="/contact">
                {text.chatContact}
              </Link>
            </div>
          )}
          <button type="button" onClick={() => setChatOpen((open) => !open)} aria-expanded={chatOpen}>
            <i aria-hidden="true">◌</i> {text.chatToggle}
          </button>
        </aside>
        {subscribeOpen && (
          <aside className="subscribe-modal" aria-label={text.subscribe} role="dialog" aria-modal="true">
            <form className="subscribe-card" onSubmit={subscribe}>
              <button className="subscribe-close" type="button" onClick={() => setSubscribeOpen(false)} aria-label={text.closeSubscribe}>
                ×
              </button>
              <div className="subscribe-brand">
                <SiteLogo alt="Poilian" width={168} height={64} />
              </div>
              <h2>{text.letterTitle}</h2>
              <p className="subscribe-lead">{text.letterBody}</p>
              <label className="sr-only" htmlFor="home-subscribe-email">
                {text.emailLabel}
              </label>
              <input
                id="home-subscribe-email"
                type="email"
                name="email"
                placeholder={text.emailLabel}
                required
                autoComplete="email"
              />
              <button className="subscribe-submit" type="submit">
                {text.subscribeCta}
              </button>
              <button className="subscribe-dismiss" type="button" onClick={() => setSubscribeOpen(false)}>
                {text.noThanks}
              </button>
              {subscribeNotice ? (
                <small className="subscribe-notice">{subscribeNotice}</small>
              ) : (
                <p className="subscribe-legal">
                  {text.privacyNote}
                  <Link href="/privacy">{text.privacyLink}</Link>.
                </p>
              )}
            </form>
          </aside>
        )}
        <nav className="home-scroll-controls" aria-label="Quick page navigation">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" })}
            aria-label="Scroll to bottom"
          >
            ↓
          </button>
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Scroll to top">
            ↑
          </button>
        </nav>
      </div>
    </section>
  );
}
