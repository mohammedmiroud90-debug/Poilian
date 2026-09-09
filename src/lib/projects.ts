export type Project = { id: string; title: string; company: string; summary: string; url: string; imageUrl: string; status: "published" | "draft"; updatedAt?: string };
const url = process.env.PARSE_SERVER_URL ?? "";
const appId = process.env.PARSE_APP_ID ?? "";
const key = process.env.PARSE_JAVASCRIPT_KEY ?? "";
const configured = Boolean(url && appId && key);
const headers = { "Content-Type": "application/json", "X-Parse-Application-Id": appId, "X-Parse-Javascript-Key": key };
const fallback: Project[] = [
  { id: "poilian", title: "Poilian", company: "Poilian", summary: "A personal space for thoughtful writing, research and creative work.", url: "", imageUrl: "", status: "published" },
];
const text = (value: unknown) => typeof value === "string" ? value : "";
const map = (item: Record<string, unknown>): Project => ({ id: text(item.objectId), title: text(item.title) || "Untitled project", company: text(item.company), summary: text(item.summary), url: text(item.url), imageUrl: text(item.imageUrl), status: item.status === "draft" ? "draft" : "published", updatedAt: text(item.updatedAt) });
export async function getProjects(includeDrafts = false): Promise<Project[]> {
  if (!configured) return fallback;
  const endpoint = new URL(`${url}/classes/Project`); endpoint.searchParams.set("where", JSON.stringify(includeDrafts ? {} : { status: "published" })); endpoint.searchParams.set("order", "-updatedAt"); endpoint.searchParams.set("limit", "100");
  const response = await fetch(endpoint, { headers, cache: "no-store" }); if (!response.ok) return fallback;
  const result = await response.json() as { results?: Record<string, unknown>[] }; const projects = (result.results ?? []).map(map);
  return projects.length ? projects : fallback;
}
