import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { adminWriteHeaders, currentAdmin, parseConfigured, url } from "@/lib/admin";

const text = (value: unknown, limit: number) => typeof value === "string" ? value.trim().slice(0, limit) : "";

export async function POST(request: Request) {
  if (!await currentAdmin()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  if (!parseConfigured) return NextResponse.json({ error: "Parse is not configured." }, { status: 503 });
  const body = await request.json() as Record<string, unknown>;
  const title = text(body.title, 140);
  const content = text(body.content, 5000);
  const excerpt = text(body.excerpt, 300);
  if (!title || !content) return NextResponse.json({ error: "Add a title and note content." }, { status: 400 });
  const payload = { title, excerpt, content, status: body.status === "draft" ? "draft" : "published" };
  const id = text(body.id, 80);
  const response = await fetch(id ? `${url}/classes/Note/${encodeURIComponent(id)}` : `${url}/classes/Note`, {
    method: id ? "PUT" : "POST",
    headers: adminWriteHeaders,
    body: JSON.stringify(payload),
  });
  if (!response.ok) return NextResponse.json({ error: "Note could not be saved." }, { status: 500 });
  const saved = await response.json() as { objectId?: string };
  revalidatePath("/notes");
  revalidatePath("/admin/settings");
  return NextResponse.json({ ok: true, id: id || saved.objectId });
}
