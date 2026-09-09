"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { LanguageSelect, type Locale } from "@/components/LanguageSelect";

type Copy = { nav: string[]; contact: string; subscribe: string; title: React.ReactNode; subtitle: string; posts: string; services: string; search: string; menu: string };
const copy: Record<Locale, Copy> = {
  en: { nav: ["Home", "Blog posts", "Projects & Companies", "Personal notes", "Photography", "About me"], contact: "Contact", subscribe: "Subscribe", title: <>Belhachemia, this is<br />my personal corner.</>, subtitle: "Stories, thoughts, photography and the moments worth remembering.", posts: "View all posts", services: "Services", search: "Search posts", menu: "Open menu" },
  fr: { nav: ["Accueil", "Articles", "Projets et entreprises", "Notes personnelles", "Photographie", "À propos"], contact: "Contact", subscribe: "S’abonner", title: <>Belhachemia, voici<br />mon espace personnel.</>, subtitle: "Histoires, réflexions, photographie et moments qui méritent d’être gardés en mémoire.", posts: "Voir tous les articles", services: "Services", search: "Rechercher des articles", menu: "Ouvrir le menu" },
  ar: { nav: ["الرئيسية", "المقالات", "المشاريع والشركات", "ملاحظات شخصية", "التصوير", "من أنا"], contact: "تواصل", subscribe: "اشترك", title: <>بلحاشمية، هذه<br />مساحتي الشخصية.</>, subtitle: "قصص وأفكار وتصوير ولحظات تستحق التذكر.", posts: "عرض كل المقالات", services: "الخدمات", search: "البحث في المقالات", menu: "فتح القائمة" },
};
const paths = ["/en", "/posts", "/projects", "/posts", "/posts", "/about"];

export function HomeHero() {
  const [locale, setLocale] = useState<Locale>("en");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatSent, setChatSent] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [subscribeNotice, setSubscribeNotice] = useState("");
  const [query, setQuery] = useState("");
  const text = copy[locale];

  useEffect(() => { const saved = localStorage.getItem("poilian-locale"); if (saved === "en" || saved === "fr" || saved === "ar") setLocale(saved); }, []);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); window.location.assign(query.trim() ? `/posts?query=${encodeURIComponent(query.trim())}` : "/posts"); }
  function sendMessage(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (chatMessage.trim()) setChatSent(true); }
  function subscribe(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSubscribeNotice("Thank you — you are on the list."); }

  return <section className="personal-hero poilian-locale-copy" dir={locale === "ar" ? "rtl" : "ltr"}><div className="personal-shell">
    <header className="personal-topbar"><Link className="personal-logo" href="/en"><Image src="/brand.png" alt="Poilian" width={190} height={78} priority /></Link><div className="personal-account"><LanguageSelect value={locale} onLocaleChange={setLocale} /><button className="search-toggle" type="button" onClick={() => setSearchOpen((open) => !open)} aria-label={text.search}>⌕</button><Link href="/contact">{text.contact}</Link><button className="hero-subscribe" type="button" onClick={() => { setSubscribeNotice(""); setSubscribeOpen(true); }}>{text.subscribe}</button><a className="linkedin-link" href="https://www.linkedin.com" target="_blank" rel="noreferrer">in</a><button className={`menu-toggle${menuOpen ? " is-open" : ""}`} type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="home-menu" aria-label={text.menu}><i /><i /><i /></button></div></header>
    {searchOpen && <div className="hero-search-overlay" role="dialog" aria-modal="true" aria-label={text.search}><form className="hero-search" onSubmit={submit}><button className="hero-search-close" type="button" onClick={() => setSearchOpen(false)} aria-label="Close search">×</button><p>SEARCH THE JOURNAL</p><input value={query} onChange={(event) => setQuery(event.target.value)} autoFocus placeholder={text.search} /><button type="submit">{text.search} <span>↗</span></button></form></div>}
    <nav id="home-menu" className={`personal-nav${menuOpen ? " is-open" : ""}`}>{text.nav.map((label, index) => <Link className={index === 0 ? "active" : ""} href={paths[index]} onClick={() => setMenuOpen(false)} key={`${index}-${label}`}>{label}</Link>)}</nav>
    <div className="personal-copy"><h1>{text.title}</h1><h2>{text.subtitle}</h2><div className="hero-links"><Link className="hero-post-link" href="/posts">{text.posts} <span>↗</span></Link><Link className="hero-post-link" href="/services">{text.services} <span>↗</span></Link></div></div>
    <Image className="hero-right-image" src="/heroright.png" alt="" width={520} height={520} priority />
    <aside className={`home-chat${chatOpen ? " is-open" : ""}`} aria-label="Chat with Poilian">
      {chatOpen && <div className="home-chat-panel"><header><span className="chat-avatar" aria-hidden="true">P</span><div><strong>Chat with Poilian</strong><small>Usually replies by email</small></div></header><div className="chat-thread">{chatSent ? <p className="chat-message mine">{chatMessage}</p> : <p className="chat-message">Hello! How can I help you today?</p>}</div><form className="chat-compose" onSubmit={sendMessage}><input value={chatMessage} onChange={(event) => { setChatMessage(event.target.value); setChatSent(false); }} placeholder="Write a message…" aria-label="Your message" /><button type="submit" aria-label="Send message">→</button></form><Link className="chat-contact-link" href="/contact">Open full contact form</Link></div>}
      <button type="button" onClick={() => setChatOpen((open) => !open)} aria-expanded={chatOpen}><i aria-hidden="true">◌</i> Chat with me</button>
    </aside>
    {subscribeOpen && <aside className="subscribe-modal" aria-label="Subscribe to Poilian"><form onSubmit={subscribe}><span className="subscribe-hand" aria-hidden="true">☝</span><button className="subscribe-close" type="button" onClick={() => setSubscribeOpen(false)} aria-label="Close subscription form">×</button><p className="section-label">POILIAN LETTER</p><h2>Keep in touch.</h2><p>Get occasional notes, new posts, and selected work delivered to your inbox.</p><label>Email address<input type="email" placeholder="you@example.com" required /></label><button type="submit">Subscribe <span>→</span></button>{subscribeNotice && <small className="subscribe-notice">{subscribeNotice}</small>}</form></aside>}
    <nav className="home-scroll-controls" aria-label="Quick page navigation"><button type="button" onClick={() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" })} aria-label="Scroll to bottom">↓</button><button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Scroll to top">↑</button></nav>
  </div></section>;
}
