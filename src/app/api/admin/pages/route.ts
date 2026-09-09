import { NextResponse } from "next/server";
import { currentAdmin, headers, parseConfigured, url } from "@/lib/admin";

function validSlug(value: unknown) { return typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value); }
export async function POST(request: Request) {
  if (!await currentAdmin()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  if (!parseConfigured) return NextResponse.json({ error: "Parse is not configured." }, { status: 503 });
  const body = await request.json() as Record<string, unknown>;
  if (typeof body.title !== "string" || !body.title.trim() || !validSlug(body.slug)) return NextResponse.json({ error: "Add a title and a URL slug using lowercase letters, numbers and hyphens." }, { status: 400 });
  const payload = { title: body.title.trim(), slug: body.slug, excerpt: typeof body.excerpt === "string" ? body.excerpt : "", content: typeof body.content === "string" ? body.content : "", status: body.status === "draft" ? "draft" : "published", showInNavigation: body.showInNavigation === true, navigationLabel: typeof body.navigationLabel === "string" ? body.navigationLabel : body.title.trim() };
  const lookup = new URL(`${url}/classes/SitePage`); lookup.searchParams.set("where", JSON.stringify({ slug: payload.slug })); lookup.searchParams.set("limit", "1");
  const existing = await fetch(lookup, { headers }); const found = existing.ok ? await existing.json() as { results?: { objectId: string }[] } : {};
  const id = found.results?.[0]?.objectId;
  const response = await fetch(id ? `${url}/classes/SitePage/${id}` : `${url}/classes/SitePage`, { method: id ? "PUT" : "POST", headers, body: JSON.stringify(payload) });
  if (!response.ok) return NextResponse.json({ error: "Page could not be saved. Check your Parse permissions." }, { status: 500 });
  return NextResponse.json({ ok: true, id: id ?? (await response.json() as { objectId: string }).objectId });
}
