import { headers, parseConfigured, url } from "@/lib/admin";
import { defaultCommentAvatarUrl, defaultFaviconUrl, defaultLogoUrl } from "@/lib/branding";
import { defaultPromotionImage } from "@/lib/promotion";
import {
  DEFAULT_POST_CONTENT_FONT,
  DEFAULT_POST_HEADING_FONT,
  isPostFontId,
} from "@/lib/postFonts";

export { defaultCommentAvatarUrl, defaultFaviconUrl, defaultLogoUrl } from "@/lib/branding";
export { defaultPromotionImage } from "@/lib/promotion";
export type AuthorProfile = {
  id?: string;
  name: string;
  bio: string;
  avatarUrl: string;
  linkedinUrl: string;
  promotionImage: string;
  logoUrl: string;
  commentAvatarUrl: string;
  faviconUrl: string;
  postContentFont: string;
  postHeadingFont: string;
};
export const defaultAuthorProfile: AuthorProfile = {
  name: "Belhachemia Mohammed",
  bio: "Personal writing, research and practical perspectives from Algeria.",
  avatarUrl: "https://founder.brintiel.com/static/images/profile-pic.png",
  linkedinUrl: "https://www.linkedin.com",
  promotionImage: defaultPromotionImage,
  logoUrl: defaultLogoUrl,
  commentAvatarUrl: defaultCommentAvatarUrl,
  faviconUrl: defaultFaviconUrl,
  postContentFont: DEFAULT_POST_CONTENT_FONT,
  postHeadingFont: DEFAULT_POST_HEADING_FONT,
};
const clean = (value: unknown, fallback: string) => (typeof value === "string" && value.trim() ? value.trim() : fallback);
const cleanFont = (value: unknown, fallback: string) => (isPostFontId(value) ? value : fallback);

export async function getAuthorProfile(): Promise<AuthorProfile> {
  if (!parseConfigured) return defaultAuthorProfile;
  const endpoint = new URL(`${url}/classes/SiteProfile`);
  endpoint.searchParams.set("where", JSON.stringify({ key: "primary" }));
  endpoint.searchParams.set("limit", "1");
  try {
    // Public read uses the JS key — never the master key on every page render.
    const response = await fetch(endpoint, { headers, cache: "no-store" });
    if (!response.ok) return defaultAuthorProfile;
    const result = (await response.json()) as { results?: Record<string, unknown>[] };
    const item = result.results?.[0];
    if (!item) return defaultAuthorProfile;
    return {
      id: clean(item.objectId, ""),
      name: clean(item.name, defaultAuthorProfile.name),
      bio: clean(item.bio, defaultAuthorProfile.bio),
      avatarUrl: clean(item.avatarUrl, defaultAuthorProfile.avatarUrl),
      linkedinUrl: clean(item.linkedinUrl, defaultAuthorProfile.linkedinUrl),
      promotionImage: clean(item.promotionImage, defaultPromotionImage),
      logoUrl: clean(item.logoUrl, defaultLogoUrl),
      commentAvatarUrl: clean(item.commentAvatarUrl, defaultCommentAvatarUrl),
      faviconUrl: clean(item.faviconUrl, defaultFaviconUrl),
      postContentFont: cleanFont(item.postContentFont, DEFAULT_POST_CONTENT_FONT),
      postHeadingFont: cleanFont(item.postHeadingFont, DEFAULT_POST_HEADING_FONT),
    };
  } catch (error) {
    console.error("Parse author-profile lookup failed", error);
    return defaultAuthorProfile;
  }
}
