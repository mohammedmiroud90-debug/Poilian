export const defaultLogoUrl = "/Bitti.png";
export const defaultFaviconUrl = "/favicon.png";
export const defaultCommentAvatarUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYuxj4s7L6KfVLpdpRCT2OwwphbNJAEzLbh3yPOua0RA&s=10";

export function resolveCommentAvatarUrl(value?: string, fallback = defaultCommentAvatarUrl) {
  return value?.trim() || fallback;
}

export function resolveFaviconUrl(value?: string, fallback = defaultFaviconUrl) {
  return value?.trim() || fallback;
}
