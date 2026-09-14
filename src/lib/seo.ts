export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://bitt-i.com").replace(/\/$/, "");
export const SITE_NAME = "Bitt-i.com";
export const DEFAULT_OG_IMAGE = { url: "/Bitti.png", width: 466, height: 143, alt: SITE_NAME };

export function absoluteUrl(path = "/") {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
