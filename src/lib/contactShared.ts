export const CONTACT_TOPICS = [
  { id: "general", label: "General enquiry" },
  { id: "collaboration", label: "Collaboration" },
  { id: "services", label: "Research & writing services" },
  { id: "careers", label: "Careers" },
  { id: "photography", label: "Photography" },
  { id: "market", label: "Marketplace" },
  { id: "press", label: "Press" },
  { id: "other", label: "Something else" },
] as const;

export type ContactTopicId = (typeof CONTACT_TOPICS)[number]["id"];
export const MESSAGE_LIMIT = 6000;

export function normalizeTopic(value: unknown): ContactTopicId {
  const id = typeof value === "string" ? value.trim().toLowerCase() : "";
  return CONTACT_TOPICS.some((topic) => topic.id === id) ? (id as ContactTopicId) : "general";
}

export function plainTextFromHtml(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|li|h[1-6]|blockquote)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}
