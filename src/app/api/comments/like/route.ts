import { NextResponse } from "next/server";
import { headers, parseConfigured, url } from "@/lib/admin";
import { clientKey, rateLimit } from "@/lib/rateLimit";
import { submitToParse } from "@/lib/parse";

const visitorPattern = /^[a-zA-Z0-9_-]{8,80}$/;

async function findLike(commentId: string, visitorId: string) {
  const endpoint = new URL(`${url}/classes/CommentLike`);
  endpoint.searchParams.set("where", JSON.stringify({ commentId, visitorId }));
  endpoint.searchParams.set("limit", "1");
  const response = await fetch(endpoint, { headers, cache: "no-store" });
  if (!response.ok) return null;
  const data = (await response.json()) as { results?: { objectId?: string }[] };
  return data.results?.[0]?.objectId ?? null;
}

async function countLikes(commentId: string) {
  const endpoint = new URL(`${url}/classes/CommentLike`);
  endpoint.searchParams.set("where", JSON.stringify({ commentId }));
  endpoint.searchParams.set("limit", "0");
  endpoint.searchParams.set("count", "1");
  const response = await fetch(endpoint, { headers, cache: "no-store" });
  if (!response.ok) return null;
  const data = (await response.json()) as { count?: number };
  return Math.max(0, Number(data.count) || 0);
}

async function commentExists(className: "Comment" | "BlogComment", commentId: string) {
  const response = await fetch(`${url}/classes/${className}/${encodeURIComponent(commentId)}?keys=objectId`, {
    headers,
    cache: "no-store",
  });
  return response.ok;
}

/** Best-effort denormalized counter; never uses the master key. */
async function bumpLikeCount(className: "Comment" | "BlogComment", commentId: string, amount: 1 | -1) {
  await fetch(`${url}/classes/${className}/${encodeURIComponent(commentId)}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ likeCount: { __op: "Increment", amount } }),
  }).catch(() => undefined);
}

export async function POST(request: Request) {
  if (!parseConfigured) {
    return NextResponse.json({ error: "Comment likes are unavailable." }, { status: 503 });
  }

  const limited = rateLimit(clientKey(request, "comment-like"), { limit: 60, windowMs: 10 * 60 * 1000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many like actions. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    commentId?: string;
    visitorId?: string;
    className?: string;
  };
  const commentId = typeof body.commentId === "string" ? body.commentId.trim().slice(0, 80) : "";
  const visitorId = typeof body.visitorId === "string" ? body.visitorId.trim().slice(0, 80) : "";
  const preferred = body.className === "BlogComment" ? "BlogComment" : "Comment";
  if (!commentId || !visitorPattern.test(visitorId)) {
    return NextResponse.json({ error: "Invalid like request." }, { status: 400 });
  }

  const classes =
    preferred === "BlogComment" ? (["BlogComment", "Comment"] as const) : (["Comment", "BlogComment"] as const);
  let className: "Comment" | "BlogComment" | null = null;
  for (const candidate of classes) {
    if (await commentExists(candidate, commentId)) {
      className = candidate;
      break;
    }
  }
  if (!className) {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }

  const existingLikeId = await findLike(commentId, visitorId);
  if (existingLikeId) {
    const remove = await fetch(`${url}/classes/CommentLike/${encodeURIComponent(existingLikeId)}`, {
      method: "DELETE",
      headers,
    });
    if (!remove.ok) {
      return NextResponse.json({ error: "Could not remove like." }, { status: 502 });
    }
    await bumpLikeCount(className, commentId, -1);
    const likeCount = (await countLikes(commentId)) ?? 0;
    return NextResponse.json({ liked: false, likeCount });
  }

  const created = await submitToParse("CommentLike", { commentId, visitorId });
  if (!created) {
    return NextResponse.json({ error: "Could not save like." }, { status: 502 });
  }
  await bumpLikeCount(className, commentId, 1);
  const likeCount = (await countLikes(commentId)) ?? 1;
  return NextResponse.json({ liked: true, likeCount });
}
