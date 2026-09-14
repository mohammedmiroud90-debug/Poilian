import { allowedIframeSrc } from "@/lib/embed";

export type SitePage = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: "published" | "draft";
  showInNavigation: boolean;
  navigationLabel: string;
  updatedAt?: string;
};

const url = process.env.PARSE_SERVER_URL ?? "";
const appId = process.env.PARSE_APP_ID ?? "";
const key = process.env.PARSE_JAVASCRIPT_KEY ?? "";
const configured = Boolean(url && appId && key);
const headers = { "Content-Type": "application/json", "X-Parse-Application-Id": appId, "X-Parse-Javascript-Key": key };

const defaults: SitePage[] = [
  { id: "founder", title: "About me", slug: "founder", excerpt: "I’m Belhachemia Mohammed. This is my place for personal writing, ideas and observations.", content: "<p>I’m Belhachemia Mohammed. This is my place for personal writing, ideas and observations.</p><p>Here I share the work, questions and experiences that deserve more than a short update.</p>", status: "published", showInNavigation: true, navigationLabel: "Founder" },
  { id: "research", title: "Research", slug: "research", excerpt: "Notes, references and ongoing work collected in one place.", content: "<p>Research entries will be published here as they are ready to share.</p>", status: "published", showInNavigation: false, navigationLabel: "Research" },
];

function string(value: unknown) { return typeof value === "string" ? value : ""; }
function dateString(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "iso" in value && typeof (value as { iso?: unknown }).iso === "string") {
    return (value as { iso: string }).iso;
  }
  return "";
}
function mapPage(item: Record<string, unknown>): SitePage {
  return { id: string(item.objectId), title: string(item.title) || "Untitled page", slug: string(item.slug), excerpt: string(item.excerpt), content: string(item.content), status: item.status === "draft" ? "draft" : "published", showInNavigation: item.showInNavigation === true, navigationLabel: string(item.navigationLabel) || string(item.title), updatedAt: dateString(item.updatedAt) || dateString(item.createdAt) };
}

export async function getSitePages(includeDrafts = false): Promise<SitePage[]> {
  if (!configured) return defaults;
  const endpoint = new URL(`${url}/classes/SitePage`);
  endpoint.searchParams.set("where", JSON.stringify(includeDrafts ? {} : { status: "published" }));
  endpoint.searchParams.set("order", "title");
  endpoint.searchParams.set("limit", "100");
  const response = await fetch(endpoint, { headers, cache: "no-store" });
  if (!response.ok) return defaults;
  const result = await response.json() as { results?: Record<string, unknown>[] };
  const pages = (result.results ?? []).map(mapPage);
  // Keep the original Founder page available until it is explicitly saved in Parse.
  return [...defaults.filter((fallback) => !pages.some((page) => page.slug === fallback.slug)), ...pages];
}

export async function getSitePage(slug: string): Promise<SitePage | null> {
  const pages = await getSitePages();
  return pages.find((page) => page.slug === slug) ?? null;
}

export function stripHtml(html: string) { return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(); }
export function sanitizePageHtml(html: string) {
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
