"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { LanguageSelect } from "@/components/LanguageSelect";
import { usePoilianLocale } from "@/hooks/usePoilianLocale";
import { SiteLogo } from "@/components/SiteLogo";
import { AudioWaveform, simulatedLevels } from "@/components/AudioWaveform";
import { togglePostAudio, POST_AUDIO_LEVELS, POST_AUDIO_STATE } from "@/components/PostListen";

const copy = {
  en: {
    links: ["Blog posts", "Companies", "Personal notes", "Photography", "About me"],
    search: "Search posts",
    submit: "Search",
    menu: "Open menu",
    home: "Home",
    like: "Like",
    listen: "Listen",
    pause: "Pause",
    thread: "Thread",
    subscribe: "Subscribe",
    trending: "TRENDING",
    trendingItems: [
      ["AI & security", "/posts?query=AI"],
      ["Digital culture", "/posts?query=culture"],
      ["Research notes", "/research"],
      ["Latest stories", "/posts"],
      ["Projects", "/projects"],
    ] as const,
  },
  fr: {
    links: ["Articles", "Entreprises", "Notes personnelles", "Photographie", "À propos"],
    search: "Rechercher des articles",
    submit: "Rechercher",
    menu: "Ouvrir le menu",
    home: "Accueil",
    like: "J’aime",
    listen: "Écouter",
    pause: "Pause",
    thread: "Fil",
    subscribe: "S’abonner",
    trending: "TENDANCES",
    trendingItems: [
      ["IA et sécurité", "/posts?query=AI"],
      ["Culture numérique", "/posts?query=culture"],
      ["Notes de recherche", "/research"],
      ["Derniers articles", "/posts"],
      ["Projets", "/projects"],
    ] as const,
  },
  ar: {
    links: ["المقالات", "الشركات", "ملاحظات شخصية", "التصوير", "من أنا"],
    search: "البحث في المقالات",
    submit: "بحث",
    menu: "فتح القائمة",
    home: "الرئيسية",
    like: "إعجاب",
    listen: "استماع",
    pause: "إيقاف",
    thread: "النقاش",
    subscribe: "اشترك",
    trending: "رائج",
    trendingItems: [
      ["الذكاء الاصطناعي والأمن", "/posts?query=AI"],
      ["الثقافة الرقمية", "/posts?query=culture"],
      ["ملاحظات بحثية", "/research"],
      ["أحدث المقالات", "/posts"],
      ["المشاريع", "/projects"],
    ] as const,
  },
} as const;
const paths = ["/posts", "/projects", "/notes", "/photography", "/about"];
type NavigationPage = { slug: string; navigationLabel: string };

export function BlogHeader({ pages: initialPages = [], category, audioUrl }: { pages?: NavigationPage[]; category?: string; audioUrl?: string }) {
  const pathname = usePathname();
  const [pages, setPages] = useState<NavigationPage[]>(initialPages);
  const [locale, setLocale] = usePoilianLocale();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const text = copy[locale];

  const [liked, setLiked] = useState(false);
  const [listening, setListening] = useState(false);
  const [audioLevels, setAudioLevels] = useState<number[]>(() => simulatedLevels(0, 16).map((value) => value * 0.3));
  const isPostView = pathname.startsWith("/posts/") && pathname !== "/posts";

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 38);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(".header-menu-burger") || target.closest("#header-navigation")) return;
      setMenuOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen || scrolled) return;
    // Burger stays available on mobile even at the top — only auto-close on desktop when sticky burger hides.
    const mobile = window.matchMedia("(max-width: 760px)").matches;
    if (!mobile) setMenuOpen(false);
  }, [scrolled, menuOpen]);

  useEffect(() => {
    const onState = (event: Event) => setListening(Boolean((event as CustomEvent<{ playing?: boolean }>).detail?.playing));
    const onLevels = (event: Event) => {
      const next = (event as CustomEvent<{ levels?: number[] }>).detail?.levels;
      if (next?.length) setAudioLevels(next);
    };
    window.addEventListener(POST_AUDIO_STATE, onState);
    window.addEventListener(POST_AUDIO_LEVELS, onLevels);
    return () => {
      window.removeEventListener(POST_AUDIO_STATE, onState);
      window.removeEventListener(POST_AUDIO_LEVELS, onLevels);
    };
  }, []);

  useEffect(() => {
    if (!listening || audioUrl) return;
    let frame = 0;
    const tick = (time: number) => {
      setAudioLevels(simulatedLevels(time, 16));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [listening, audioUrl]);
  
  useEffect(() => { if (searchOpen) inputRef.current?.focus(); }, [searchOpen]);
  
  useEffect(() => { 
    if (!initialPages.length) 
      fetch("/api/pages")
        .then((response) => response.ok ? response.json() : [])
        .then(setPages)
        .catch(() => undefined); 
  }, [initialPages.length]);
  
  function search(event: FormEvent<HTMLFormElement>) { 
    event.preventDefault(); 
    const term = query.trim(); 
    window.location.assign(term ? `/posts?query=${encodeURIComponent(term)}` : "/posts"); 
  }
  
  function closeMenu() { setMenuOpen(false); }

  function listenArticle() {
    if (audioUrl?.trim() && document.getElementById("post-listen")) {
      togglePostAudio();
      return;
    }
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setListening(false);
      return;
    }
    const title = document.querySelector(".post-page h1")?.textContent?.trim();
    const intro = document.querySelector(".post-page .page-intro")?.textContent?.trim();
    const textToSpeak = [title, intro].filter(Boolean).join(". ");
    if (!textToSpeak) return;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1;
    utterance.onend = () => setListening(false);
    setListening(true);
    window.speechSynthesis.speak(utterance);
  }

  function scrollToThread() {
    document.getElementById("comments")?.scrollIntoView({ behavior: "smooth", block: "start" });
    closeMenu();
  }

  function scrollToSubscribe() {
    const target =
      document.getElementById("post-newsletter") ||
      document.getElementById("inbox-newsletter");
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
    closeMenu();
  }

  return (
    <header 
      className={`page-header poilian-locale-copy${scrolled ? " is-scrolled" : ""}${isPostView ? " post-header" : ""}${isPostView && scrolled ? " post-sticky-mobile" : ""}`} 
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <div className="page-header-top page-shell">
        {/* Left side: Burger menu + Logo */}
        <div className="header-left">
          <button 
            className={`header-menu-burger${menuOpen ? " is-open" : ""}`} 
            type="button" 
            onClick={() => { 
              setMenuOpen((open) => !open); 
              setSearchOpen(false); 
            }} 
            aria-expanded={menuOpen} 
            aria-controls="header-navigation" 
            aria-label={text.menu}
          >
            <span className="burger-line"></span>
            <span className="burger-line"></span>
            <span className="burger-line"></span>
          </button>
          
          <Link className="page-header-logo" href="/en">
            <SiteLogo alt="Bitt-i.com" width={158} height={40} priority />
          </Link>
        </div>

        <div className="header-right">
        {isPostView && (
          <nav className="post-sticky-actions" aria-label="Article quick actions">
            <button
              type="button"
              className={liked ? "is-active" : ""}
              onClick={() => setLiked((value) => !value)}
              aria-pressed={liked}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 11v10H4.5A1.5 1.5 0 0 1 3 19.5v-6A1.5 1.5 0 0 1 4.5 12H7Zm0 0 3.2-6.4A2.2 2.2 0 0 1 12.2 3.5h.3A2.5 2.5 0 0 1 15 6v3.5h4.2a2.3 2.3 0 0 1 2.3 2.7l-1.1 7.2A2.5 2.5 0 0 1 17.9 22H7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              </svg>
              <span>{text.like}</span>
            </button>
            <button type="button" className={`post-listen-action${listening ? " is-active is-playing" : ""}`} onClick={listenArticle} aria-pressed={listening}>
              <AudioWaveform compact playing={listening} levels={audioLevels} />
              <span>{listening ? text.pause : text.listen}</span>
            </button>
            <button type="button" onClick={scrollToThread}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 6.5h10a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H10l-3.5 3v-3H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                <path d="M9 5h10a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1" fill="none" stroke="currentColor" strokeWidth="1.7" opacity=".7" />
              </svg>
              <span>{text.thread}</span>
            </button>
            <button type="button" className="post-subscribe-action" onClick={scrollToSubscribe}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 7.5h16v11H4z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                <path d="m4.5 8 7.5 6 7.5-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{text.subscribe}</span>
            </button>
          </nav>
        )}

        {/* Right side: Language, Search, LinkedIn / sticky profile */}
        <div className="header-utilities">
          {isPostView && (
            <button
              type="button"
              className="header-subscribe-toggle"
              onClick={scrollToSubscribe}
              aria-label={text.subscribe}
              title={text.subscribe}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 7.5h16v11H4z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                <path d="m4.5 8 7.5 6 7.5-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <LanguageSelect value={locale} onLocaleChange={setLocale} />
          
          <button 
            className="header-search-toggle" 
            type="button" 
            onClick={() => { 
              setSearchOpen((open) => !open); 
              setMenuOpen(false); 
            }} 
            aria-expanded={searchOpen} 
            aria-controls="header-search" 
            aria-label={text.search}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10.8" cy="10.8" r="5.8" />
              <path d="m15.2 15.2 4.2 4.2" />
            </svg>
          </button>
          
          <a 
            className="header-linkedin" 
            href="https://www.linkedin.com" 
            target="_blank" 
            rel="noreferrer" 
            aria-label="Visit LinkedIn"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6.2 8.4A2.2 2.2 0 1 0 6.2 4a2.2 2.2 0 0 0 0 4.4ZM4.3 20h3.8V10H4.3v10ZM10.5 10v10h3.8v-5c0-1.3.2-2.6 1.9-2.6 1.7 0 1.7 1.6 1.7 2.7V20h3.8v-5.6c0-3.5-.8-6.1-4.9-6.1-2 0-3.3 1.1-3.8 2.1h-.1V10h-3.4Z" />
            </svg>
            <span>LinkedIn</span>
          </a>
        </div>

        </div>
      </div>
      
      {/* Search form */}
      {searchOpen && (
        <form id="header-search" className="header-search page-shell" onSubmit={search}>
          <input 
            ref={inputRef} 
            value={query} 
            onChange={(event) => setQuery(event.target.value)} 
            placeholder={text.search} 
          />
          <button type="submit">{text.submit}</button>
        </form>
      )}
      
      {/* Navigation menu */}
      <nav 
        id="header-navigation" 
        className={`page-header-nav page-shell${menuOpen ? " is-menu-open" : ""}`} 
        aria-label="Main navigation"
      >
        <Link className="nav-home-icon" href="/en" onClick={closeMenu} aria-label={text.home}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9Z" /></svg>
        </Link>
        {text.links.map((label, index) => (
          <Link href={paths[index]} onClick={closeMenu} key={paths[index]}>
            {label}
          </Link>
        ))}
        {pages.map((page) => (
          <Link href={`/pages/${page.slug}`} onClick={closeMenu} key={page.slug}>
            {page.navigationLabel}
          </Link>
        ))}
      </nav>

      {pathname.startsWith("/posts/") && (
        <nav className="post-trending" aria-label="Trending topics">
          <div className="post-trending-inner page-shell">
            <span className="trending-label">{text.trending}</span>
            {text.trendingItems.map(([label, href]) => (
              <Link href={href} key={href}>
                {label}
              </Link>
            ))}
          </div>
        </nav>
      )}
      
      {category && <span className="post-header-category">{category}</span>}
    </header>
  );
}
