import { allowedIframeSrc } from "@/lib/embed";

export type Post = { id: string; slug: string; title: string; excerpt: string; content: string; contentHtml?: string; author: string; publishedAt: string; category: string; className?: "Article" | "BlogPost" };
export type Comment = { id: string; author: string; content: string; createdAt: string; parentId?: string };
export type AnalyticsSummary = { posts: number; comments: number; views: number; viewsThisWeek: number; latestPost?: Post; topPosts: { title: string; slug: string; views: number }[]; activity: { date: string; views: number }[] };

const url = process.env.PARSE_SERVER_URL ?? "";
const appId = process.env.PARSE_APP_ID ?? "";
const key = process.env.PARSE_JAVASCRIPT_KEY ?? "";
const configured = Boolean(url && appId && key);
const headers = { "Content-Type": "application/json", "X-Parse-Application-Id": appId, "X-Parse-Javascript-Key": key };
const fallback: Post[] = [{ id: "welcome", slug: "welcome", title: "Welcome to my personal corner", excerpt: "A place for notes, research and personal writing.", content: "This is the beginning of my personal blog. New posts will appear here once the Parse connection is configured.", author: "Belhachemia Mohammed", publishedAt: "2026-09-06", category: "Personal notes" }];

const text = (value: unknown) => typeof value === "string" ? value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "";
const dateText = (value: unknown) => typeof value === "string" ? value : typeof value === "object" && value !== null && "iso" in value && typeof (value as { iso?: unknown }).iso === "string" ? (value as { iso: string }).iso : "";
const fallbackCommentAuthors = ["Elena Rossi", "Thomas Müller", "Sofia Dubois", "Luca Bianchi", "Amélie Martin", "Jonas Weber", "Clara Schmidt", "Mateo García"];
const missingCommentAuthor = (value: string) => !value || /^(undefined|null|guest)(?:\s+(undefined|null|guest))*$/i.test(value);
const commentAuthor = (item: Record<string, unknown>) => {
  const author = text(item.author || item.name || item.displayName);
  if (!missingCommentAuthor(author)) return author;
  const id = String(item.objectId ?? "");
  const index = Array.from(id).reduce((total, character) => total + character.charCodeAt(0), 0) % fallbackCommentAuthors.length;
  return fallbackCommentAuthors[index];
};

// Get raw HTML content (for rich editor posts)
const getHtmlContent = (value: unknown) => typeof value === "string" ? value.trim() : "";

export function sanitizeHtml(html: string) {
  return html
    .replace(/<(script|style|object|embed|form)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/?(?:script|style|object|embed|form)[^>]*>/gi, "")
    .replace(/<iframe\b([^>]*)>[\s\S]*?<\/iframe>/gi, (match, attrs) => {
      const src = (attrs.match(/\bsrc\s*=\s*"([^"]+)"/i) || attrs.match(/\bsrc\s*=\s*'([^']+)'/i))?.[1] ?? "";
      return allowedIframeSrc.test(src) ? `<iframe src="${src}" title="Embedded video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>` : "";
    })
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, "$1=\"#\"");
}

export function isRichHtmlContent(value = "") {
  const source = value.replace(/\r\n?/g, "\n").trim();
  if (!source.includes("<")) return false;
  const hasMarkdownHeading = /(?:^|\n)\s{0,3}#{1,6}\s+\S/.test(source);
  const hasHtmlBlock = /<(h[1-6]|p|ul|ol|blockquote|pre|figure|table)\b/i.test(source);
  if (hasMarkdownHeading && !hasHtmlBlock) return false;
  return hasHtmlBlock || /<(img|strong|em|b|i|u|a|br|div|span|hr)\b/i.test(source);
}

// Convert HTML to markdown (for backward compatibility with markdown-based posts)
const postContent = (value: unknown) => typeof value === "string" ? value.replace(/\\n/g, "\n").replace(/<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi, "\n```\n$1\n```\n").replace(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*\balt=["']([^"']*)["'][^>]*>/gi, "\n![$2]($1)\n").replace(/<img\b[^>]*\balt=["']([^"']*)["'][^>]*\bsrc=["']([^"']+)["'][^>]*>/gi, "\n![$1]($2)\n").replace(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi, "\n![]($1)\n").replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, "**$2**").replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, "*$2*").replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, level, inner) => `\n${"#".repeat(Math.min(Number(level), 3))} ${inner}\n`).replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "\n- $1").replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, "\n> $1\n").replace(/<br\s*\/?>/gi, "\n").replace(/<\/(?:p|div)>/gi, "\n").replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/\r\n?/g, "\n").trim() : "";

const mapPost = (item: Record<string, unknown>, className?: "Article" | "BlogPost"): Post => {
  const rawContent = item.content || item.body || item.details;
  const htmlContent = getHtmlContent(rawContent);
  
  return {
    id: String(item.objectId),
    slug: text(item.slug) || String(item.objectId),
    title: text(item.title) || "Untitled post",
    excerpt: text(item.excerpt || item.summary || item.description),
    content: postContent(rawContent), // Markdown for backward compatibility
    contentHtml: htmlContent, // Raw HTML for rich editor posts
    author: text(item.author) || "Belhachemia Mohammed",
    publishedAt: dateText(item.publishedAt) || dateText(item.createdAt) || new Date().toISOString(),
    category: text(item.category || item.type) || "Personal notes",
    className
  };
};

async function query(className: string, params: Record<string, string>) {
  if (!configured) return null;
  const endpoint = new URL(`${url}/classes/${className}`);
  Object.entries(params).forEach(([name, value]) => endpoint.searchParams.set(name, value));
  try {
    const response = await fetch(endpoint, { headers, cache: "no-store" });
    return response.ok ? response.json() as Promise<{ results?: Record<string, unknown>[] }> : null;
  } catch (error) {
    // Parse may be temporarily unreachable in local development.  Content
    // pages should remain available and simply show no remote records.
    console.error(`Parse ${className} query failed`, error);
    return null;
  }
}

export async function getPosts(): Promise<Post[]> {
  // Posts created before the CMS used both Parse classes.  Do not stop at the
  // first class with results: that hides every published BlogPost whenever an
  // Article exists (and makes their public URLs appear stale or missing).
  const classes = ["Article", "BlogPost"] as const;
  const results = await Promise.all(
    classes.map(async (className) => ({
      className,
      result: await query(className, {
        where: JSON.stringify({ status: "published" }),
        order: "-publishedAt",
        limit: "24",
      }),
    })),
  );
  const posts = results.flatMap(({ className, result }) =>
    (result?.results ?? []).map((item) => mapPost(item, className)),
  );
  return posts.length
    ? posts.sort((first, second) => Date.parse(second.publishedAt) - Date.parse(first.publishedAt))
    : fallback;
}
export async function getPost(slug: string) { return (await getPosts()).find((post) => post.slug === slug) ?? null; }
export async function getComments(postId: string): Promise<Comment[]> {
  // As with posts, support both the current and legacy Parse collections.
  // Returning an empty Comment query early meant BlogComment rows were never
  // shown in the admin, even though readers could see them on their post.
  const results = await Promise.all(
    ["Comment", "BlogComment"].map((className) =>
      query(className, {
        where: JSON.stringify({ postId, isActive: { $ne: false } }),
        order: "createdAt",
        limit: "100",
      }),
    ),
  );
  return results
    .flatMap((result) => result?.results ?? [])
    .map((item) => ({
      id: String(item.objectId),
      author: commentAuthor(item),
      content: text(item.content || item.comment),
      createdAt: text(item.createdAt),
      parentId: text(item.parentId) || undefined,
    }))
    .sort((first, second) => Date.parse(first.createdAt) - Date.parse(second.createdAt));
}
export async function getAnalytics(): Promise<AnalyticsSummary> {
  const posts = await getPosts();
  const comments = (await Promise.all(posts.map((post) => getComments(post.id)))).flat();
  const pageViews = (await query("PageView", { order: "-createdAt", limit: "1000" }))?.results ?? [];
  const now = new Date();
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    return date;
  });
  const keyFor = (value: Date) => value.toISOString().slice(0, 10);
  const activity = days.map((date) => ({ date: keyFor(date), views: 0 }));
  const viewsBySlug = new Map(posts.map((post) => [post.slug, 0]));
  let viewsThisWeek = 0;
  for (const view of pageViews) {
    const createdAt = new Date(dateText(view.createdAt));
    if (Number.isNaN(createdAt.valueOf())) continue;
    const day = activity.find((item) => item.date === keyFor(createdAt));
    if (day) { day.views++; viewsThisWeek++; }
    const path = text(view.path);
    const slug = path.match(/^\/posts\/([^/?#]+)/)?.[1];
    if (slug && viewsBySlug.has(slug)) viewsBySlug.set(slug, (viewsBySlug.get(slug) ?? 0) + 1);
  }
  return {
    posts: posts.length,
    comments: comments.length,
    views: pageViews.length,
    viewsThisWeek,
    latestPost: posts[0],
    topPosts: posts.map((post) => ({ title: post.title, slug: post.slug, views: viewsBySlug.get(post.slug) ?? 0 })).sort((first, second) => second.views - first.views).slice(0, 5),
    activity,
  };
}
export async function submitToParse(className: string, body: Record<string, unknown>) { if (!configured) return false; const response = await fetch(`${url}/classes/${className}`, { method: "POST", headers, body: JSON.stringify(body) }); return response.ok; }
