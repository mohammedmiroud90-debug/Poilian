import { NextResponse } from "next/server";
import { searchSite } from "@/lib/search";
import type { SearchKind } from "@/lib/searchShared";
import { clientKey, rateLimit } from "@/lib/rateLimit";

const kinds = new Set<SearchKind | "all">(["all", "post", "page", "note", "project", "photo", "ask", "site"]);

export async function GET(request: Request) {
  const limited = rateLimit(clientKey(request, "search"), { limit: 40, windowMs: 60_000 });
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many searches. Please wait a moment." }, { status: 429 });
  }
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().slice(0, 120);
  const typeParam = (searchParams.get("type") || "all").toLowerCase();
  const type = kinds.has(typeParam as SearchKind | "all") ? (typeParam as SearchKind | "all") : "all";
  if (!q) return NextResponse.json({ results: [] });
  const results = await searchSite(q, type);
  return NextResponse.json({ results, q, type });
}
