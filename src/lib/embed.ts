// Shared helper so every rich editor (posts, pages, inline post editor) and every
// public reading view agree on which video URLs are embeddable and how.
export function toVideoEmbedUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  const youtube = value.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/i);
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`;
  const vimeo = value.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

export const allowedIframeSrc = /^https:\/\/(www\.)?(youtube(-nocookie)?\.com\/embed\/|player\.vimeo\.com\/video\/)/i;

export function videoEmbedHtml(embedUrl: string) {
  return `<div class="video-embed" contenteditable="false"><iframe src="${embedUrl}" title="Embedded video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
}
