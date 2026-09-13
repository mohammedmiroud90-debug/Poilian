export type Note = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  status: "published" | "draft";
  createdAt?: string;
  updatedAt?: string;
};

const url = process.env.PARSE_SERVER_URL ?? "";
const appId = process.env.PARSE_APP_ID ?? "";
const key = process.env.PARSE_JAVASCRIPT_KEY ?? "";
const configured = Boolean(url && appId && key);
const headers = { "Content-Type": "application/json", "X-Parse-Application-Id": appId, "X-Parse-Javascript-Key": key };
const text = (value: unknown) => typeof value === "string" ? value : "";

function mapNote(item: Record<string, unknown>): Note {
  return {
    id: text(item.objectId),
    title: text(item.title) || "Untitled note",
    excerpt: text(item.excerpt),
    content: text(item.content),
    status: item.status === "draft" ? "draft" : "published",
    createdAt: text(item.createdAt),
    updatedAt: text(item.updatedAt),
  };
}

export async function getNotes(includeDrafts = false): Promise<Note[]> {
  if (!configured) return [];
  const endpoint = new URL(`${url}/classes/Note`);
  endpoint.searchParams.set("where", JSON.stringify(includeDrafts ? {} : { status: "published" }));
  endpoint.searchParams.set("order", "-updatedAt");
  endpoint.searchParams.set("limit", "100");
  const response = await fetch(endpoint, { headers, cache: "no-store" });
  if (!response.ok) return [];
  const result = await response.json() as { results?: Record<string, unknown>[] };
  return (result.results ?? []).map(mapNote);
}
