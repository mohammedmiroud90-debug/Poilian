import type { Metadata } from "next";
import Link from "next/link";
import { BlogHeader } from "@/components/BlogHeader";
import { englishCategories, postsInCategory } from "@/lib/categories";
import { getPosts } from "@/lib/parse";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse Bitt-i.com writing by topic and category.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const posts = await getPosts();
  return <><BlogHeader /><main className="content-page categories-page"><p className="section-label">BROWSE THE JOURNAL</p><h1>Categories</h1><p className="page-intro">Explore writing by topic.</p><div>{englishCategories.map((category) => { const count = postsInCategory(posts, category).length; return <Link href={`/posts?category=${encodeURIComponent(category)}`} key={category}><span>{category}</span><small>{count} {count === 1 ? "post" : "posts"} <b aria-hidden="true">↗</b></small></Link>; })}</div></main></>;
}
