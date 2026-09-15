import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { adminWriteHeaders, currentAdmin, parseConfigured, url } from "@/lib/admin";

const slugValid = (value: unknown) => typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const isAudioSource = (value: string) => !value || /^https?:\/\//i.test(value) || value.startsWith("/");

export async function POST(request: Request) {
  if (!await currentAdmin()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  if (!parseConfigured) return NextResponse.json({ error: "Parse is not configured." }, { status: 503 });
  const body = await request.json() as Record<string, unknown>;
  if (typeof body.title !== "string" || !body.title.trim() || !slugValid(body.slug)) {
    return NextResponse.json({ error: "Add a title and a valid lowercase URL slug." }, { status: 400 });
  }
  const audioUrl = typeof body.audioUrl === "string" ? body.audioUrl.trim() : undefined;
  if (audioUrl !== undefined && !isAudioSource(audioUrl)) {
    return NextResponse.json({ error: "Use a valid audio URL." }, { status: 400 });
  }
  const payload = {
    title: body.title.trim(),
    slug: body.slug,
    excerpt: typeof body.excerpt === "string" ? body.excerpt : "",
    content: typeof body.content === "string" ? body.content : "",
    category: typeof body.category === "string" && body.category.trim() ? body.category : "Personal notes",
    author: typeof body.author === "string" && body.author.trim() ? body.author : "Belhachemia Mohammed",
    status: body.status === "draft" ? "draft" : "published",
    publishedAt: { __type: "Date", iso: new Date().toISOString() },
    ...(audioUrl !== undefined ? { audioUrl } : {}),
  };
  const className = body.className === "BlogPost" ? "BlogPost" : "Article";
  const id = typeof body.id === "string" && body.id !== "welcome" ? body.id : "";
  const response = await fetch(id ? `${url}/classes/${className}/${encodeURIComponent(id)}` : `${url}/classes/${className}`, {
    method: id ? "PUT" : "POST",
    headers: adminWriteHeaders,
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const failure = await response.json().catch(() => ({})) as { error?: string; code?: number };
    console.error("Parse post save failed", { status: response.status, code: failure.code, error: failure.error });
    return NextResponse.json({ error: failure.error || "Post could not be saved.", code: failure.code }, { status: response.status });
  }
  const saved = await response.json() as { objectId?: string };
  revalidatePath("/en");
  revalidatePath("/posts");
  revalidatePath(`/posts/${body.slug}`);
  return NextResponse.json({ ok: true, id: id || saved.objectId, className });
}
