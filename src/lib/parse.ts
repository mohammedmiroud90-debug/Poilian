export type Post = { id: string; slug: string; title: string; excerpt: string; content: string; author: string; publishedAt: string; category: string; className?: "Article" | "BlogPost" };
export type Comment = { id: string; author: string; content: string; createdAt: string; parentId?: string };

const url = process.env.PARSE_SERVER_URL ?? "";
const appId = process.env.PARSE_APP_ID ?? "";
const key = process.env.PARSE_JAVASCRIPT_KEY ?? "";
const configured = Boolean(url && appId && key);
const headers = { "Content-Type": "application/json", "X-Parse-Application-Id": appId, "X-Parse-Javascript-Key": key };
const fallback: Post[] = [{ id: "welcome", slug: "welcome", title: "Welcome to my personal corner", excerpt: "A place for notes, research and personal writing.", content: "This is the beginning of my personal blog. New posts will appear here once the Parse connection is configured.", author: "Belhachemia Mohammed", publishedAt: "2026-09-06", category: "Personal notes" }];

const text = (value: unknown) => typeof value === "string" ? value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "";
const postContent = (value: unknown) => typeof value === "string" ? value.replace(/\\n/g, "\n").replace(/<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi, "\n```\n$1\n```\n").replace(/<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/gi, "\n## $2\n").replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "\n- $1").replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, "\n> $1\n").replace(/<br\s*\/?>/gi, "\n").replace(/<\/(?:p|div)>/gi, "\n").replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/\r\n?/g, "\n").trim() : "";
const mapPost = (item: Record<string, unknown>, className?: "Article" | "BlogPost"): Post => ({ id: String(item.objectId), slug: text(item.slug) || String(item.objectId), title: text(item.title) || "Untitled post", excerpt: text(item.excerpt || item.summary || item.description), content: postContent(item.content || item.body || item.details), author: text(item.author) || "Belhachemia Mohammed", publishedAt: text(item.publishedAt || item.createdAt) || new Date().toISOString(), category: text(item.category || item.type) || "Personal notes", className });

async function query(className: string, params: Record<string, string>) {
  if (!configured) return null;
  const endpoint = new URL(`${url}/classes/${className}`);
  Object.entries(params).forEach(([name, value]) => endpoint.searchParams.set(name, value));
  const response = await fetch(endpoint, { headers, next: { revalidate: 60 } });
  return response.ok ? response.json() as Promise<{ results?: Record<string, unknown>[] }> : null;
}

export async function getPosts(): Promise<Post[]> { for (const className of ["Article", "BlogPost"] as const) { const result = await query(className, { where: JSON.stringify({ status: "published" }), order: "-publishedAt", limit: "24" }); if (result?.results?.length) return result.results.map((item) => mapPost(item, className)); } return fallback; }
export async function getPost(slug: string) { return (await getPosts()).find((post) => post.slug === slug) ?? null; }
export async function getComments(postId: string): Promise<Comment[]> { for (const className of ["Comment", "BlogComment"]) { const result = await query(className, { where: JSON.stringify({ postId, isActive: { $ne: false } }), order: "createdAt", limit: "100" }); if (result?.results) return result.results.map((item) => ({ id: String(item.objectId), author: text(item.author) || "Guest", content: text(item.content || item.comment), createdAt: text(item.createdAt), parentId: text(item.parentId) || undefined })); } return []; }
export async function submitToParse(className: string, body: Record<string, unknown>) { if (!configured) return false; const response = await fetch(`${url}/classes/${className}`, { method: "POST", headers, body: JSON.stringify(body) }); return response.ok; }
