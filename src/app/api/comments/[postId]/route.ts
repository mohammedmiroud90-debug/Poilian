import { NextResponse } from "next/server";
import { submitToParse } from "@/lib/parse";

export async function POST(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params; const body = await request.json(); const author = typeof body.author === "string" ? body.author.trim().slice(0, 80) : "Guest"; const content = typeof body.content === "string" ? body.content.replace(/<[^>]*>/g, "").trim().slice(0, 6000) : ""; const parentId = typeof body.parentId === "string" ? body.parentId.trim().slice(0, 80) : "";
  if (!content) return NextResponse.json({ error: "Comment is required." }, { status: 400 });
  const saved = await submitToParse("Comment", { postId, author, content, parentId, isActive: true });
  if (!saved) return NextResponse.json({ error: "Comment service is unavailable." }, { status: 503 });
  return NextResponse.json({ id: crypto.randomUUID(), author, content, parentId: parentId || undefined, createdAt: new Date().toISOString() }, { status: 201 });
}
