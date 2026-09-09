import { NextResponse } from "next/server";
import { currentAdmin, headers, parseConfigured, url } from "@/lib/admin";
const text = (value: unknown, limit: number) => typeof value === "string" ? value.trim().slice(0, limit) : "";
const validUrl = (value: string) => { if (!value) return true; try { const parsed = new URL(value); return parsed.protocol === "https:" || parsed.protocol === "http:"; } catch { return false; } };
export async function PUT(request: Request) {
  if (!await currentAdmin()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 }); if (!parseConfigured) return NextResponse.json({ error: "Parse is not configured." }, { status: 503 });
  const body = await request.json() as Record<string, unknown>; const name = text(body.name, 100); const bio = text(body.bio, 400); const avatarUrl = text(body.avatarUrl, 1000); const linkedinUrl = text(body.linkedinUrl, 1000);
  if (!name) return NextResponse.json({ error: "Add a display name." }, { status: 400 }); if (!validUrl(avatarUrl) || !validUrl(linkedinUrl)) return NextResponse.json({ error: "Use a valid http(s) URL." }, { status: 400 });
  const lookup = new URL(`${url}/classes/SiteProfile`); lookup.searchParams.set("where", JSON.stringify({ key: "primary" })); lookup.searchParams.set("limit", "1");
  const existing = await fetch(lookup, { headers, cache: "no-store" }); const results = existing.ok ? (await existing.json() as { results?: { objectId?: string }[] }).results : []; const id = results?.[0]?.objectId;
  const response = await fetch(id ? `${url}/classes/SiteProfile/${encodeURIComponent(id)}` : `${url}/classes/SiteProfile`, { method: id ? "PUT" : "POST", headers, body: JSON.stringify({ key: "primary", name, bio, avatarUrl, linkedinUrl }) });
  return response.ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Profile could not be saved. Check Parse permissions." }, { status: 500 });
}
