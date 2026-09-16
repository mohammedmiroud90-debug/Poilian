import { NextResponse } from "next/server";
import { clientKey, rateLimit } from "@/lib/rateLimit";
import { notifyNewComment } from "@/lib/email/notifications";
import { getPostBriefById, submitToParse } from "@/lib/parse";

export async function POST(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  const limited = rateLimit(clientKey(request, "comment-post"), { limit: 20, windowMs: 10 * 60 * 1000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many comments. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  const { postId } = await params;
  const safePostId = typeof postId === "string" ? postId.trim().slice(0, 80) : "";
  if (!safePostId) return NextResponse.json({ error: "Invalid post." }, { status: 400 });

  const body = (await request.json().catch(() => ({}))) as {
    author?: unknown;
    content?: unknown;
    parentId?: unknown;
  };
  const author = typeof body.author === "string" ? body.author.trim().slice(0, 80) : "Guest";
  const content = typeof body.content === "string" ? body.content.replace(/<[^>]*>/g, "").trim().slice(0, 6000) : "";
  const parentId = typeof body.parentId === "string" ? body.parentId.trim().slice(0, 80) : "";
  if (!content) return NextResponse.json({ error: "Comment is required." }, { status: 400 });

  const saved = await submitToParse("Comment", {
    postId: safePostId,
    author: author || "Guest",
    content,
    parentId,
    isActive: true,
    likeCount: 0,
  });
  if (!saved) return NextResponse.json({ error: "Comment service is unavailable." }, { status: 503 });

  void getPostBriefById(safePostId).then((post) => {
    const title = post?.title || "A post";
    const slug = post?.slug || safePostId;
    return notifyNewComment({
      author: author || "Guest",
      content,
      postTitle: title,
      postSlug: slug,
    });
  }).catch((error) => console.error("[notify:comment]", error));

  return NextResponse.json(
    {
      id: saved.objectId || crypto.randomUUID(),
      author: author || "Guest",
      content,
      parentId: parentId || undefined,
      createdAt: new Date().toISOString(),
      likeCount: 0,
      className: "Comment",
    },
    { status: 201 },
  );
}
