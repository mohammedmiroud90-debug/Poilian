import { NextResponse } from "next/server";

const cache = new Map<string, string>();
const supported = new Set(["fr", "ar"]);
const chunkSize = 1200;
const maxBatchSize = 20;
const maxParallelRequests = 2;

function chunks(value: string) {
  const result: string[] = [];
  let remaining = value;
  while (remaining.length > chunkSize) {
    const cut = Math.max(remaining.lastIndexOf(" ", chunkSize), Math.floor(chunkSize * 0.5));
    result.push(remaining.slice(0, cut));
    remaining = remaining.slice(cut);
  }
  if (remaining) result.push(remaining);
  return result;
}

async function translate(text: string, locale: string) {
  const source = text.trim();
  if (!source || !/[a-zA-Z]{2}/.test(source)) return text;
  const cacheKey = `${locale}:${source}`;
  const saved = cache.get(cacheKey);
  if (saved) return saved;
  const translated = await Promise.all(chunks(source).map((part) => translateChunk(part, locale)));
  const result = translated.join("");
  if (result.trim()) cache.set(cacheKey, result);
  return result || text;
}

async function translateChunkGoogle(source: string, locale: string) {
  const endpoint = new URL("https://translate.googleapis.com/translate_a/single");
  endpoint.searchParams.set("client", "gtx");
  endpoint.searchParams.set("sl", "en");
  endpoint.searchParams.set("tl", locale);
  endpoint.searchParams.set("dt", "t");
  endpoint.searchParams.set("q", source);
  const response = await fetch(endpoint, {
    headers: { Accept: "application/json", "User-Agent": "Poilian/1.0" },
    signal: AbortSignal.timeout(8_000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Google translate unavailable");
  const data = (await response.json()) as unknown;
  const result =
    Array.isArray(data) && Array.isArray(data[0])
      ? (data[0] as unknown[])
          .map((part) => (Array.isArray(part) && typeof part[0] === "string" ? part[0] : ""))
          .join("")
      : "";
  return result || source;
}

async function translateChunkMyMemory(source: string, locale: string) {
  const endpoint = new URL("https://api.mymemory.translated.net/get");
  endpoint.searchParams.set("q", source.slice(0, 480));
  endpoint.searchParams.set("langpair", `en|${locale}`);
  const response = await fetch(endpoint, {
    headers: { Accept: "application/json", "User-Agent": "Poilian/1.0" },
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("MyMemory unavailable");
  const data = (await response.json()) as { responseData?: { translatedText?: string } };
  const result = data.responseData?.translatedText?.trim();
  if (!result || result.toUpperCase() === source.toUpperCase()) return source;
  return result;
}

async function translateChunk(source: string, locale: string) {
  try {
    return await translateChunkGoogle(source, locale);
  } catch {
    return translateChunkMyMemory(source, locale);
  }
}

async function translateBatch(texts: string[], locale: string) {
  const translations = new Array<string>(texts.length);
  let nextIndex = 0;
  const worker = async () => {
    while (nextIndex < texts.length) {
      const index = nextIndex++;
      try { translations[index] = await translate(texts[index], locale); }
      catch { translations[index] = texts[index]; }
    }
  };
  await Promise.all(Array.from({ length: Math.min(maxParallelRequests, texts.length) }, worker));
  return translations;
}

export async function POST(request: Request) {
  const { locale, texts } = await request.json() as { locale?: string; texts?: unknown };
  if (!locale || !supported.has(locale) || !Array.isArray(texts)) return NextResponse.json({ translations: [] });
  const unique = texts.slice(0, maxBatchSize).map((item) => typeof item === "string" ? item : "");
  const translations = await translateBatch(unique, locale);
  return NextResponse.json({ translations });
}
