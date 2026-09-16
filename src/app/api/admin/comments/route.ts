import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { adminWriteHeaders, currentAdmin, parseConfigured, url } from "@/lib/admin";
import { notifyAdminCommentReply } from "@/lib/email/notifications";

export async function POST(request: Request) {
  if (!await currentAdmin()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  if (!parseConfigured) return NextResponse.json({ error: "Parse is not configured." }, { status: 503 });
  const body = await request.json() as Record<string, unknown>;
  const postId = typeof body.postId === "string" ? body.postId.trim().slice(0, 80) : "";
  const parentId = typeof body.parentId === "string" ? body.parentId.trim().slice(0, 80) : "";
  const content = typeof body.content === "string" ? body.content.replace(/<[^>]*>/g, "").trim().slice(0, 6000) : "";
  const author = typeof body.author === "string" && body.author.trim() ? body.author.trim().slice(0, 80) : "Poilian";
  const slug = typeof body.slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug) ? body.slug : "";
  const postTitle = typeof body.postTitle === "string" ? body.postTitle.trim().slice(0, 200) : "A post";
  const replyToAuthor =
    typeof body.replyToAuthor === "string" ? body.replyToAuthor.trim().slice(0, 80) : "Reader";
  if (!postId || !parentId || !content) return NextResponse.json({ error: "Choose a comment and write a reply." }, { status: 400 });
  const response = await fetch(`${url}/classes/Comment`, { method: "POST", headers: adminWriteHeaders, body: JSON.stringify({ postId, parentId, author, content, isActive: true }) });
  if (!response.ok) return NextResponse.json({ error: "Reply could not be saved." }, { status: response.status });
  const saved = await response.json() as { objectId?: string; createdAt?: string };
  if (slug) revalidatePath(`/posts/${slug}`);
  revalidatePath("/admin/comments");

  void notifyAdminCommentReply({
    authorName: author,
    replyToAuthor,
    content,
    postTitle,
    postSlug: slug || postId,
  }).catch((error) => console.error("[notify:comment-reply]", error));

  return NextResponse.json({ id: saved.objectId, author, content, parentId, createdAt: saved.createdAt || new Date().toISOString() }, { status: 201 });
}
