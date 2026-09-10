"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { LanguageSelect, type Locale } from "@/components/LanguageSelect";

const copy = {
  en: { links: ["Home", "Posts", "Projects & Companies", "Research", "About me", "Contact"], search: "Search posts", submit: "Search", menu: "Open menu" },
  fr: { links: ["Accueil", "Articles", "Projets & entreprises", "Recherche", "À propos", "Contact"], search: "Rechercher des articles", submit: "Rechercher", menu: "Ouvrir le menu" },
  ar: { links: ["الرئيسية", "المقالات", "المشاريع والشركات", "الأبحاث", "من أنا", "تواصل"], search: "البحث في المقالات", submit: "بحث", menu: "فتح القائمة" },
} as const;
const paths = ["/en", "/posts", "/projects", "/research", "/about", "/contact"];
type NavigationPage = { slug: string; navigationLabel: string };

export function BlogHeader({ pages: initialPages = [], category }: { pages?: NavigationPage[]; category?: string }) {
  const pathname = usePathname();
  const [pages, setPages] = useState<NavigationPage[]>(initialPages);
  const [locale, setLocale] = useState<Locale>("en");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const text = copy[locale];

  useEffect(() => { const saved = localStorage.getItem("poilian-locale"); if (saved === "en" || saved === "fr" || saved === "ar") setLocale(saved); const update = () => setScrolled(window.scrollY > 38); update(); window.addEventListener("scroll", update, { passive: true }); return () => window.removeEventListener("scroll", update); }, []);
  useEffect(() => { if (searchOpen) inputRef.current?.focus(); }, [searchOpen]);
  useEffect(() => { if (!initialPages.length) fetch("/api/pages").then((response) => response.ok ? response.json() : []).then(setPages).catch(() => undefined); }, [initialPages.length]);
  function search(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const term = query.trim(); window.location.assign(term ? `/posts?query=${encodeURIComponent(term)}` : "/posts"); }
  function closeMenu() { setMenuOpen(false); }

  return <header className={`page-header poilian-locale-copy${scrolled ? " is-scrolled" : ""}${pathname.startsWith("/posts/") ? " post-header" : ""}`} dir={locale === "ar" ? "rtl" : "ltr"}>
    <div className="page-header-top page-shell">
      <Link className="page-header-logo" href="/en"><Image src="/TankBL.png" alt="TankBL" width={155} height={64} priority /></Link>
      <div className="header-utilities">
        <LanguageSelect value={locale} onLocaleChange={setLocale} />
        <button className="header-search-toggle" type="button" onClick={() => { setSearchOpen((open) => !open); setMenuOpen(false); }} aria-expanded={searchOpen} aria-controls="header-search" aria-label={text.search}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="5.8" /><path d="m15.2 15.2 4.2 4.2" /></svg></button>
        <a className="header-linkedin" href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label="Visit LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.2 8.4A2.2 2.2 0 1 0 6.2 4a2.2 2.2 0 0 0 0 4.4ZM4.3 20h3.8V10H4.3v10ZM10.5 10v10h3.8v-5c0-1.3.2-2.6 1.9-2.6 1.7 0 1.7 1.6 1.7 2.7V20h3.8v-5.6c0-3.5-.8-6.1-4.9-6.1-2 0-3.3 1.1-3.8 2.1h-.1V10h-3.4Z" /></svg><span>LinkedIn</span></a>
        <button className={`header-menu-toggle${menuOpen ? " is-open" : ""}`} type="button" onClick={() => { setMenuOpen((open) => !open); setSearchOpen(false); }} aria-expanded={menuOpen} aria-controls="header-navigation" aria-label={text.menu}><i /><i /><i /></button>
      </div>
    </div>
    {searchOpen && <form id="header-search" className="header-search page-shell" onSubmit={search}><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text.search} /><button type="submit">{text.submit}</button></form>}
    <nav id="header-navigation" className={`page-header-nav page-shell${menuOpen ? " is-menu-open" : ""}`} aria-label="Main navigation">{text.links.map((label, index) => <Link href={paths[index]} onClick={closeMenu} key={paths[index]}>{label}</Link>)}{pages.map((page) => <Link href={`/pages/${page.slug}`} onClick={closeMenu} key={page.slug}>{page.navigationLabel}</Link>)}</nav>
    {category && <span className="post-header-category">{category}</span>}
  </header>;
}
