import { NextResponse } from "next/server";
import { clientKey, rateLimit } from "@/lib/rateLimit";
import { notifyNewComment } from "@/lib/email/notifications";
import { getPostBriefById, submitToParse } from "@/lib/parse";

function textField(value: unknown, max: number) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

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
    email?: unknown;
    content?: unknown;
    parentId?: unknown;
  };

  const author = textField(body.author, 80);
  const email = textField(body.email, 254).toLowerCase();
  const content = typeof body.content === "string" ? body.content.replace(/<[^>]*>/g, "").trim().slice(0, 6000) : "";
  const parentId = typeof body.parentId === "string" ? body.parentId.trim().slice(0, 80) : "";

  if (!author || author.length < 2) {
    return NextResponse.json({ error: "Enter your name (at least 2 characters)." }, { status: 400 });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!content) return NextResponse.json({ error: "Comment is required." }, { status: 400 });

  const saved = await submitToParse("Comment", {
    postId: safePostId,
    author,
    email,
    content,
    parentId,
    isActive: true,
    likeCount: 0,
  });
  if (!saved) return NextResponse.json({ error: "Comment service is unavailable." }, { status: 503 });

  void getPostBriefById(safePostId)
    .then((post) => {
      const title = post?.title || "A post";
      const slug = post?.slug || safePostId;
      return notifyNewComment({
        author,
        email,
        content,
        postTitle: title,
        postSlug: slug,
      });
    })
    .catch((error) => console.error("[notify:comment]", error));

  return NextResponse.json(
    {
      id: saved.objectId || crypto.randomUUID(),
      author,
      content,
      parentId: parentId || undefined,
      createdAt: new Date().toISOString(),
      likeCount: 0,
      className: "Comment",
    },
    { status: 201 },
  );
}
