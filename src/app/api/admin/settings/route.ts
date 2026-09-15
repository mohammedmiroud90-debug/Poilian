import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { adminWriteHeaders, currentAdmin, parseConfigured, url } from "@/lib/admin";
import { defaultCommentAvatarUrl, defaultFaviconUrl, defaultLogoUrl } from "@/lib/branding";

const isImageSource = (value: string) => /^https?:\/\//i.test(value) || value.startsWith("/");

export async function PUT(request: Request) {
  if (!(await currentAdmin())) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  if (!parseConfigured) return NextResponse.json({ error: "Parse is not configured." }, { status: 503 });

  const body = (await request.json()) as {
    promotionImage?: unknown;
    logoUrl?: unknown;
    commentAvatarUrl?: unknown;
    faviconUrl?: unknown;
  };
  const payload: {
    key: string;
    promotionImage?: string;
    logoUrl?: string;
    commentAvatarUrl?: string;
    faviconUrl?: string;
  } = { key: "primary" };

  if ("promotionImage" in body) {
    const promotionImage = typeof body.promotionImage === "string" ? body.promotionImage.trim() : "";
    if (!isImageSource(promotionImage)) return NextResponse.json({ error: "Use a valid image URL." }, { status: 400 });
    payload.promotionImage = promotionImage;
  }
  if ("logoUrl" in body) {
    const logoUrl = typeof body.logoUrl === "string" ? body.logoUrl.trim() : "";
    if (!isImageSource(logoUrl)) return NextResponse.json({ error: "Use a valid logo image URL." }, { status: 400 });
    payload.logoUrl = logoUrl;
  }
  if ("commentAvatarUrl" in body) {
    const commentAvatarUrl = typeof body.commentAvatarUrl === "string" ? body.commentAvatarUrl.trim() : "";
    if (!isImageSource(commentAvatarUrl)) return NextResponse.json({ error: "Use a valid comment avatar URL." }, { status: 400 });
    payload.commentAvatarUrl = commentAvatarUrl;
  }
  if ("faviconUrl" in body) {
    const faviconUrl = typeof body.faviconUrl === "string" ? body.faviconUrl.trim() : "";
    if (!isImageSource(faviconUrl)) return NextResponse.json({ error: "Use a valid favicon image URL." }, { status: 400 });
    payload.faviconUrl = faviconUrl;
  }
  if (!payload.promotionImage && !payload.logoUrl && !payload.commentAvatarUrl && !payload.faviconUrl) {
    return NextResponse.json({ error: "Nothing to save." }, { status: 400 });
  }

  const lookup = new URL(`${url}/classes/SiteProfile`);
  lookup.searchParams.set("where", JSON.stringify({ key: "primary" }));
  lookup.searchParams.set("limit", "1");
  const existing = await fetch(lookup, { headers: adminWriteHeaders, cache: "no-store" });
  const id = existing.ok
    ? ((await existing.json()) as { results?: { objectId?: string }[] }).results?.[0]?.objectId
    : undefined;
  const response = await fetch(
    id ? `${url}/classes/SiteProfile/${encodeURIComponent(id)}` : `${url}/classes/SiteProfile`,
    { method: id ? "PUT" : "POST", headers: adminWriteHeaders, body: JSON.stringify(payload) },
  );
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("SiteProfile favicon/settings save failed", response.status, detail);
    return NextResponse.json(
      { error: detail.includes("faviconUrl") ? "Parse rejected faviconUrl. Check the SiteProfile schema allows that field." : "Settings could not be saved." },
      { status: 500 },
    );
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  revalidatePath("/posts", "layout");
  revalidatePath("/admin", "layout");
  revalidatePath("/favicon");

  return NextResponse.json({
    ok: true,
    promotionImage: payload.promotionImage,
    logoUrl: payload.logoUrl || defaultLogoUrl,
    commentAvatarUrl: payload.commentAvatarUrl || defaultCommentAvatarUrl,
    faviconUrl: payload.faviconUrl || defaultFaviconUrl,
  });
}
