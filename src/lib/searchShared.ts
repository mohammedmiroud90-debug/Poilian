export type SearchKind = "post" | "page" | "note" | "project" | "photo" | "ask" | "site";

export type SearchHit = {
  id: string;
  type: SearchKind;
  title: string;
  excerpt: string;
  snippet: string;
  href: string;
  category: string;
  date?: string;
  score: number;
};

export const searchKindLabel: Record<SearchKind, string> = {
  post: "Post",
  page: "Page",
  note: "Note",
  project: "Project",
  photo: "Photography",
  ask: "Ask me",
  site: "Site",
};
