import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/parse";
import { getSitePages } from "@/lib/pages";
import { SITE_URL } from "@/lib/seo";

const staticRoutes: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/posts", changeFrequency: "daily", priority: 0.9 },
  { path: "/projects", changeFrequency: "weekly", priority: 0.8 },
  { path: "/categories", changeFrequency: "weekly", priority: 0.7 },
  { path: "/research", changeFrequency: "monthly", priority: 0.7 },
  { path: "/notes", changeFrequency: "weekly", priority: 0.7 },
  { path: "/market", changeFrequency: "weekly", priority: 0.8 },
  { path: "/services", changeFrequency: "weekly", priority: 0.8 },
  { path: "/photography", changeFrequency: "monthly", priority: 0.7 },
  { path: "/photographyapply", changeFrequency: "monthly", priority: 0.6 },
  { path: "/ask-me", changeFrequency: "weekly", priority: 0.8 },
  { path: "/search", changeFrequency: "weekly", priority: 0.5 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
  { path: "/legal", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/security", changeFrequency: "yearly", priority: 0.3 },
  { path: "/accessibility", changeFrequency: "yearly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [posts, pages] = await Promise.all([getPosts(500), getSitePages()]);

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map(({ path, changeFrequency, priority }) => ({
    url: path === "/" ? SITE_URL : `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/posts/${post.slug}`,
    lastModified: post.publishedAt ? new Date(post.publishedAt) : now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const pageEntries: MetadataRoute.Sitemap = pages
    .filter((page) => page.status === "published")
    .map((page) => ({
      url: `${SITE_URL}/pages/${page.slug}`,
      lastModified: page.updatedAt ? new Date(page.updatedAt) : now,
      changeFrequency: "monthly",
      priority: page.slug === "founder" ? 0.8 : 0.6,
    }));

  return [...staticEntries, ...postEntries, ...pageEntries];
}
