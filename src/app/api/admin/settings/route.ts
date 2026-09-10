import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { adminWriteHeaders, currentAdmin, parseConfigured, url } from "@/lib/admin";

export async function PUT(request: Request) {
  if (!await currentAdmin()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  if (!parseConfigured) return NextResponse.json({ error: "Parse is not configured." }, { status: 503 });
  const body = await request.json() as { promotionImage?: unknown };
  const promotionImage = typeof body.promotionImage === "string" ? body.promotionImage.trim() : "";
  if (!/^https?:\/\//i.test(promotionImage)) return NextResponse.json({ error: "Use a valid image URL." }, { status: 400 });
  const lookup = new URL(`${url}/classes/SiteProfile`); lookup.searchParams.set("where", JSON.stringify({ key: "primary" })); lookup.searchParams.set("limit", "1");
  const existing = await fetch(lookup, { headers: adminWriteHeaders, cache: "no-store" });
  const id = existing.ok ? ((await existing.json() as { results?: { objectId?: string }[] }).results?.[0]?.objectId) : undefined;
  const response = await fetch(id ? `${url}/classes/SiteProfile/${encodeURIComponent(id)}` : `${url}/classes/SiteProfile`, { method: id ? "PUT" : "POST", headers: adminWriteHeaders, body: JSON.stringify({ key: "primary", promotionImage }) });
  if (!response.ok) return NextResponse.json({ error: "Banner image could not be saved." }, { status: 500 });
  revalidatePath("/posts", "layout");
  return NextResponse.json({ ok: true, promotionImage });
}
