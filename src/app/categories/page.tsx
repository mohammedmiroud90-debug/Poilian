import type { Metadata } from "next";
import Link from "next/link";
import { BlogHeader } from "@/components/BlogHeader";
import { englishCategories, postsInCategory } from "@/lib/categories";
import { getPosts } from "@/lib/parse";

export const metadata: Metadata = {
  title: "Categories | Bitt-i.com",
  description: "Browse Bitt-i.com writing by topic and category. Explore articles on technology, business, research, and more organized by subject.",
  keywords: "categories, topics, browse, technology, business, research, articles, organized content",
  alternates: { canonical: "/categories" },
  openGraph: {
    type: "website",
    url: "/categories",
    siteName: "Bitt-i.com",
    title: "Categories | Bitt-i.com",
    description: "Browse Bitt-i.com writing by topic and category. Explore articles on technology, business, research, and more.",
    images: [{ url: "/Bitti.png", width: 466, height: 143, alt: "Bitt-i.com" }],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Categories | Bitt-i.com",
    description: "Browse Bitt-i.com writing by topic and category. Explore articles on technology, business, research, and more.",
    images: ["/Bitti.png"],
    site: "@bitticom",
    creator: "@bitticom",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function CategoriesPage() {
  const posts = await getPosts();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${process.env.NEXT_PUBLIC_SITE_URL || "https://bitt-i.com"}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Categories",
        item: `${process.env.NEXT_PUBLIC_SITE_URL || "https://bitt-i.com"}/categories`,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogHeader />
      <main className="content-page categories-page">
        <p className="section-label">BROWSE THE JOURNAL</p>
        <h1>Categories</h1>
        <p className="page-intro">Explore writing by topic.</p>
        <div>
          {englishCategories.map((category) => {
            const count = postsInCategory(posts, category).length;
            return (
              <Link href={`/posts?category=${encodeURIComponent(category)}`} key={category}>
                <span>{category}</span>
                <small>{count} {count === 1 ? "post" : "posts"} <b aria-hidden="true">↗</b></small>
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
