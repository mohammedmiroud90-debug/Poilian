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

export function pdfEmbedHtml(url: string, title = "View PDF") {
  const safeUrl = url.replace(/"/g, "&quot;");
  const safeTitle = title.replace(/"/g, "&quot;");
  return `<div class="pdf-embed" contenteditable="false"><a class="pdf-embed-link" href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeTitle}</a><iframe src="${safeUrl}" title="${safeTitle}" loading="lazy"></iframe></div>`;
}

export function imageEmbedHtml(url: string, alt = "", caption = "") {
  const safeUrl = url.replace(/"/g, "&quot;");
  const safeAlt = alt.replace(/"/g, "&quot;");
  const safeCaption = caption
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<figure class="editor-figure"><img src="${safeUrl}" alt="${safeAlt}" title="${safeAlt}" /><figcaption contenteditable="true" data-placeholder="Add a short caption…">${safeCaption}</figcaption></figure>`;
}

/** Human-readable title from an uploaded filename. */
export function imageTitleFromFileName(name: string) {
  return name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
}
