"use client";

import { FormEvent, useEffect, useState } from "react";
import { resolveCommentAvatarUrl } from "@/lib/branding";
import { useDefaultCommentAvatar } from "@/components/SiteLogo";

type Comment = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  parentId?: string;
  avatarUrl?: string;
  likeCount?: number;
  className?: "Comment" | "BlogComment";
};

const visitorKey = "poilian-comment-visitor";
const likesKey = "poilian-comment-likes";

function formatCommentDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getUTCFullYear()}`;
}

function hueFromSeed(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  return [12, 32, 52, 92, 132, 168, 196, 212, 228, 258, 292, 328][hash % 12];
}

function getVisitorId() {
  try {
    const existing = localStorage.getItem(visitorKey);
    if (existing && /^[a-zA-Z0-9_-]{8,80}$/.test(existing)) return existing;
    const next = crypto.randomUUID().replace(/-/g, "");
    localStorage.setItem(visitorKey, next);
    return next;
  } catch {
    return `guest${Date.now().toString(36)}`;
  }
}

function readLocalLikes() {
  try {
    const raw = JSON.parse(localStorage.getItem(likesKey) ?? "{}") as Record<string, boolean>;
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

function writeLocalLikes(value: Record<string, boolean>) {
  try {
    localStorage.setItem(likesKey, JSON.stringify(value));
  } catch {
    /* Ignore quota errors. */
  }
}

function CommentAvatar({ src, seed }: { src?: string; seed: string }) {
  const fallback = useDefaultCommentAvatar();
  const resolved = resolveCommentAvatarUrl(src, fallback);
  const usesDefault = !src?.trim() || resolved === fallback;
  return (
    <span
      className={`comment-avatar${usesDefault ? " is-tinted" : ""}`}
      style={usesDefault ? { ["--comment-avatar-hue" as string]: `${hueFromSeed(seed)}deg` } : undefined}
      aria-hidden="true"
    >
      <img src={resolved} alt="" width={32} height={32} />
    </span>
  );
}

export function CommentSection({ postId, initialComments }: { postId: string; initialComments: Comment[] }) {
  const fallbackAvatar = useDefaultCommentAvatar();
  const [comments, setComments] = useState(initialComments);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [liking, setLiking] = useState<string>("");
  const [status, setStatus] = useState("");
  const [content, setContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const storageKey = `poilian-local-comments-${postId}`;

  useEffect(() => {
    setLiked(readLocalLikes());
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? "[]") as Comment[];
      if (saved.length) {
        setComments((current) => [
          ...current,
          ...saved.filter((savedComment) => !current.some((comment) => comment.id === savedComment.id)),
        ]);
      }
    } catch {
      /* Ignore malformed local data. */
    }
  }, [storageKey]);

  function save(comment: Comment, local: boolean) {
    setComments((current) => [
      ...current,
      {
        ...comment,
        likeCount: comment.likeCount ?? 0,
        avatarUrl: resolveCommentAvatarUrl(comment.avatarUrl, fallbackAvatar),
      },
    ]);
    if (local) {
      try {
        const existing = JSON.parse(localStorage.getItem(storageKey) ?? "[]") as Comment[];
        localStorage.setItem(storageKey, JSON.stringify([...existing, comment]));
      } catch {
        /* The in-memory comment remains visible. */
      }
    }
    setContent("");
    setReplyingTo(null);
    setStatus(local ? "Saved locally in this browser." : "Your response is live.");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    setStatus("Publishing your response…");
    const parentId = replyingTo?.id;
    const response = await fetch(`/api/comments/${postId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author: "Guest", content, parentId }),
    });
    if (response.ok) save(await response.json(), false);
    else {
      save(
        {
          id: crypto.randomUUID(),
          author: "Guest",
          content,
          parentId,
          createdAt: new Date().toISOString(),
          avatarUrl: fallbackAvatar,
          likeCount: 0,
        },
        true,
      );
    }
    setSubmitting(false);
  }

  async function toggleLike(comment: Comment) {
    if (liking) return;
    setLiking(comment.id);
    const wasLiked = Boolean(liked[comment.id]);
    const previousCount = Math.max(0, comment.likeCount ?? 0);
    const nextLiked = !wasLiked;
    const nextCount = Math.max(0, previousCount + (nextLiked ? 1 : -1));

    setLiked((current) => {
      const next = { ...current, [comment.id]: nextLiked };
      writeLocalLikes(next);
      return next;
    });
    setComments((current) =>
      current.map((item) => (item.id === comment.id ? { ...item, likeCount: nextCount } : item)),
    );

    try {
      const response = await fetch("/api/comments/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId: comment.id,
          visitorId: getVisitorId(),
          className: comment.className,
        }),
      });
      if (response.ok) {
        const result = (await response.json()) as { liked?: boolean; likeCount?: number };
        setLiked((current) => {
          const next = { ...current, [comment.id]: Boolean(result.liked) };
          writeLocalLikes(next);
          return next;
        });
        setComments((current) =>
          current.map((item) =>
            item.id === comment.id
              ? { ...item, likeCount: Math.max(0, Number(result.likeCount) || 0) }
              : item,
          ),
        );
      } else {
        // Keep optimistic local like when Parse is unavailable.
        if (response.status !== 503) {
          setLiked((current) => {
            const next = { ...current, [comment.id]: wasLiked };
            writeLocalLikes(next);
            return next;
          });
          setComments((current) =>
            current.map((item) => (item.id === comment.id ? { ...item, likeCount: previousCount } : item)),
          );
        }
      }
    } catch {
      /* Local optimistic state already applied. */
    } finally {
      setLiking("");
    }
  }

  const roots = comments.filter((comment) => !comment.parentId);
  const replies = (id: string) => comments.filter((comment) => comment.parentId === id);

  const renderComment = (comment: Comment, reply = false) => {
    const isLiked = Boolean(liked[comment.id]);
    const count = Math.max(0, comment.likeCount ?? 0);
    return (
      <article className={reply ? "comment-reply" : ""} key={comment.id}>
        <CommentAvatar src={comment.avatarUrl} seed={`${comment.author}-${comment.id}`} />
        <div>
          <strong>{comment.author}</strong>
          <time dateTime={comment.createdAt}>{formatCommentDate(comment.createdAt)}</time>
          <p>{comment.content}</p>
          <div className="comment-actions">
            <button
              type="button"
              className={`comment-like${isLiked ? " is-liked" : ""}`}
              aria-pressed={isLiked}
              disabled={liking === comment.id}
              onClick={() => void toggleLike(comment)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M7 11v10H4.5A1.5 1.5 0 0 1 3 19.5v-6A1.5 1.5 0 0 1 4.5 12H7Zm0 0 3.2-6.4A2.2 2.2 0 0 1 12.2 3.5h.3A2.5 2.5 0 0 1 15 6v3.5h4.2a2.3 2.3 0 0 1 2.3 2.7l-1.1 7.2A2.5 2.5 0 0 1 17.9 22H7"
                  fill={isLiked ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{count > 0 ? count : "Like"}</span>
            </button>
            <button type="button" className="comment-reply-btn" onClick={() => setReplyingTo(comment)}>
              Reply
            </button>
          </div>
          {replies(comment.id).map((child) => renderComment(child, true))}
        </div>
      </article>
    );
  };

  return (
    <section className="comments" id="comments">
      <div className="comments-heading">
        <h2>{comments.length ? `${comments.length} response${comments.length === 1 ? "" : "s"}` : "No responses yet"}</h2>
      </div>
      {roots.map((comment) => renderComment(comment))}
      <form onSubmit={submit} className="response-composer">
        <div className="response-prompt">
          <CommentAvatar seed="guest-composer" />
          <label htmlFor="response">{replyingTo ? `Replying to ${replyingTo.author}` : "Write a response"}</label>
          {replyingTo && (
            <button className="cancel-reply" type="button" onClick={() => setReplyingTo(null)}>
              Cancel
            </button>
          )}
        </div>
        <textarea
          id="response"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder={replyingTo ? `Reply to ${replyingTo.author}` : "What are your thoughts?"}
          required
          maxLength={6000}
        />
        <div className="response-actions">
          <small>{status}</small>
          <button disabled={!content.trim() || submitting}>
            {submitting ? "Publishing…" : replyingTo ? "Reply" : "Publish"}
          </button>
        </div>
      </form>
    </section>
  );
}
