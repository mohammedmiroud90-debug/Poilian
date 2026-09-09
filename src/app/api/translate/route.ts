import { NextResponse } from "next/server";

const cache = new Map<string, string>();
const supported = new Set(["fr", "ar"]);

async function translate(text: string, locale: string) {
  const source = text.trim();
  if (!source || source.length > 1800 || !/[a-zA-Z]{2}/.test(source)) return text;
  const cacheKey = `${locale}:${source}`;
  const saved = cache.get(cacheKey);
  if (saved) return saved;
  const endpoint = new URL("https://translate.googleapis.com/translate_a/single");
  endpoint.searchParams.set("client", "gtx"); endpoint.searchParams.set("sl", "en"); endpoint.searchParams.set("tl", locale); endpoint.searchParams.set("dt", "t"); endpoint.searchParams.set("q", source);
  const response = await fetch(endpoint, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8_000), cache: "no-store" });
  if (!response.ok) throw new Error("Translation service unavailable");
  const data = await response.json() as unknown;
  const result = Array.isArray(data) && Array.isArray(data[0]) ? (data[0] as unknown[]).map((part) => Array.isArray(part) && typeof part[0] === "string" ? part[0] : "").join("") : "";
  if (result.trim()) cache.set(cacheKey, result);
  return result || text;
}

export async function POST(request: Request) {
  const { locale, texts } = await request.json() as { locale?: string; texts?: unknown };
  if (!locale || !supported.has(locale) || !Array.isArray(texts)) return NextResponse.json({ translations: [] });
  const unique = texts.slice(0, 50).map((item) => typeof item === "string" ? item : "");
  const translations = await Promise.all(unique.map(async (text) => { try { return await translate(text, locale); } catch { return text; } }));
  return NextResponse.json({ translations });
}
