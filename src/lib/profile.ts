import { adminWriteHeaders, parseConfigured, url } from "@/lib/admin";
import { defaultPromotionImage } from "@/lib/promotion";

export { defaultPromotionImage } from "@/lib/promotion";
export type AuthorProfile = { id?: string; name: string; bio: string; avatarUrl: string; linkedinUrl: string; promotionImage: string };
export const defaultAuthorProfile: AuthorProfile = { name: "Belhachemia Mohammed", bio: "Personal writing, research and practical perspectives from Algeria.", avatarUrl: "https://founder.brintiel.com/static/images/profile-pic.png", linkedinUrl: "https://www.linkedin.com", promotionImage: defaultPromotionImage };
const clean = (value: unknown, fallback: string) => typeof value === "string" && value.trim() ? value.trim() : fallback;
export async function getAuthorProfile(): Promise<AuthorProfile> {
  if (!parseConfigured) return defaultAuthorProfile;
  const endpoint = new URL(`${url}/classes/SiteProfile`); endpoint.searchParams.set("where", JSON.stringify({ key: "primary" })); endpoint.searchParams.set("limit", "1");
  try {
    const response = await fetch(endpoint, { headers: adminWriteHeaders, cache: "no-store" }); if (!response.ok) return defaultAuthorProfile;
    const result = await response.json() as { results?: Record<string, unknown>[] }; const item = result.results?.[0]; if (!item) return defaultAuthorProfile;
    return { id: clean(item.objectId, ""), name: clean(item.name, defaultAuthorProfile.name), bio: clean(item.bio, defaultAuthorProfile.bio), avatarUrl: clean(item.avatarUrl, defaultAuthorProfile.avatarUrl), linkedinUrl: clean(item.linkedinUrl, defaultAuthorProfile.linkedinUrl), promotionImage: clean(item.promotionImage, defaultPromotionImage) };
  } catch (error) {
    console.error("Parse author-profile lookup failed", error);
    return defaultAuthorProfile;
  }
}
