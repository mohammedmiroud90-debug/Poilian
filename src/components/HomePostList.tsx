"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { type Locale } from "@/components/LanguageSelect";
import { ServicesShowcase } from "@/components/ServicesShowcase";
import type { Post } from "@/lib/parse";

const copy: Record<Locale, { journal: string; recentPosts: string; allPosts: string; explore: string; tags: string; tagsList: string[]; dateLocale: string }> = {
  en: { journal: "FROM THE JOURNAL", recentPosts: "Recent posts", allPosts: "All posts →", explore: "EXPLORE BY TOPIC", tags: "Tags", tagsList: ["Algeria", "Technology", "Cybersecurity", "Research", "Photography", "Personal notes"], dateLocale: "en-US" },
  fr: { journal: "DU JOURNAL", recentPosts: "Articles récents", allPosts: "Tous les articles →", explore: "EXPLORER PAR SUJET", tags: "Étiquettes", tagsList: ["Algérie", "Technologie", "Cybersécurité", "Recherche", "Photographie", "Notes personnelles"], dateLocale: "fr-FR" },
  ar: { journal: "من المدوّنة", recentPosts: "أحدث المقالات", allPosts: "كل المقالات ←", explore: "استكشف حسب الموضوع", tags: "الوسوم", tagsList: ["الجزائر", "التكنولوجيا", "الأمن السيبراني", "البحث", "التصوير", "ملاحظات شخصية"], dateLocale: "ar-DZ" },
};

export function HomePostList({ posts, authorName }: { posts: Post[]; authorName: string }) {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("poilian-locale");
    if (saved === "en" || saved === "fr" || saved === "ar") setLocale(saved);
    const updateLocale = (event: Event) => {
      const nextLocale = (event as CustomEvent<Locale>).detail;
      if (nextLocale === "en" || nextLocale === "fr" || nextLocale === "ar") setLocale(nextLocale);
    };
    window.addEventListener("poilian-locale-change", updateLocale);
    return () => window.removeEventListener("poilian-locale-change", updateLocale);
  }, []);

  const text = copy[locale];

  return (
    <>
      <section className="home-posts" id="posts" dir={locale === "ar" ? "rtl" : "ltr"}>
        <div className="personal-shell">
          <div className="home-posts-heading poilian-locale-copy">
            <div>
              <p>{text.journal}</p>
              <h2>{text.recentPosts}</h2>
            </div>
            <Link href="/posts">{text.allPosts}</Link>
          </div>
          <ol className="home-recent-list">
            {posts.slice(0, 5).map((post) => (
              <li key={post.id}>
                <Link href={`/posts/${post.slug}`}>
                  {post.title} <span>↗</span>
                </Link>
                <p>
                  {new Date(post.publishedAt).toLocaleDateString(text.dateLocale, { 
                    year: "numeric", 
                    month: "long", 
                    day: "numeric" 
                  })} · {authorName || post.author}
                </p>
                <small>{post.category}</small>
              </li>
            ))}
          </ol>
          <section className="home-tags poilian-locale-copy" aria-labelledby="tags-title">
            <p>{text.explore}</p>
            <h3 id="tags-title">{text.tags}</h3>
            <div>
              {text.tagsList.map((tag, index) => (
                <Link 
                  href={`/posts?category=${encodeURIComponent(copy.en.tagsList[index])}`} 
                  key={tag}
                >
                  {tag}
                </Link>
              ))}
            </div>
            <Link className="categories-link" href="/categories">
              Browse all categories ↗
            </Link>
          </section>
        </div>
      </section>
      
      {/* Services Showcase Section */}
      <ServicesShowcase />
    </>
  );
}
