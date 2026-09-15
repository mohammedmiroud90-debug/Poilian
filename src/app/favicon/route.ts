import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { defaultFaviconUrl, resolveFaviconUrl } from "@/lib/branding";
import { getAuthorProfile } from "@/lib/profile";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const publicR2 = (process.env.R2_PUBLIC_URL ?? "https://pub-934e29ec90504f5c9f23a9b4f607b77a.r2.dev").replace(/\/$/, "");
const allowedHosts = new Set(
  [
    "localhost",
    "127.0.0.1",
    "bitt-i.com",
    "www.bitt-i.com",
    (() => {
      try {
        return new URL(publicR2).hostname;
      } catch {
        return "";
      }
    })(),
  ].filter(Boolean),
);

const contentTypeFor = (source: string, fallback = "image/png") => {
  const filePath = source.split("?")[0].toLowerCase();
  if (filePath.endsWith(".ico")) return "image/x-icon";
  if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) return "image/jpeg";
  if (filePath.endsWith(".webp")) return "image/webp";
  if (filePath.endsWith(".gif")) return "image/gif";
  if (filePath.endsWith(".png")) return "image/png";
  return fallback;
};

const noStore = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
};

async function serveDefault() {
  const local = await serveLocal(defaultFaviconUrl);
  if (local) return local;
  return new NextResponse(null, { status: 404 });
}

async function serveLocal(source: string) {
  const relative = source.replace(/^\/+/, "").split("?")[0];
  if (!relative || relative.includes("..") || relative.toLowerCase().endsWith(".svg")) return null;
  try {
    const file = await readFile(path.join(process.cwd(), "public", relative));
    return new NextResponse(file, {
      headers: {
        "Content-Type": contentTypeFor(relative),
        ...noStore,
      },
    });
  } catch {
    return null;
  }
}

function isAllowedRemote(source: string) {
  try {
    const parsed = new URL(source);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    if (parsed.hostname.endsWith(".r2.dev")) return true;
    return allowedHosts.has(parsed.hostname);
  } catch {
    return false;
  }
}

async function serveRemote(source: string) {
  if (!isAllowedRemote(source)) return serveDefault();
  try {
    const response = await fetch(source, { cache: "no-store", redirect: "error" });
    if (!response.ok) return serveDefault();
    const type = response.headers.get("content-type") || contentTypeFor(source);
    if (/svg|html|xml/i.test(type) && !/image\/(png|jpeg|gif|webp|x-icon|vnd\.microsoft\.icon)/i.test(type)) {
      return serveDefault();
    }
    return new NextResponse(await response.arrayBuffer(), {
      headers: {
        "Content-Type": type,
        ...noStore,
      },
    });
  } catch {
    return serveDefault();
  }
}

export async function GET() {
  const profile = await getAuthorProfile();
  const source = resolveFaviconUrl(profile.faviconUrl, defaultFaviconUrl);

  if (source.startsWith("/")) {
    return (await serveLocal(source)) || serveDefault();
  }

  return serveRemote(source);
}
