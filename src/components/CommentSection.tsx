"use client";

import { FormEvent, useEffect, useState } from "react";
import { resolveCommentAvatarUrl } from "@/lib/branding";
import { useDefaultCommentAvatar } from "@/components/SiteLogo";

type Comment = { id: string; author: string; content: string; createdAt: string; parentId?: string; avatarUrl?: string };

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
  const [status, setStatus] = useState("");
  const [content, setContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const storageKey = `poilian-local-comments-${postId}`;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? "[]") as Comment[];
      if (saved.length) setComments((current) => [...current, ...saved.filter((savedComment) => !current.some((comment) => comment.id === savedComment.id))]);
    } catch {
      /* Ignore malformed local data. */
    }
  }, [storageKey]);

  function save(comment: Comment, local: boolean) {
    setComments((current) => [...current, { ...comment, avatarUrl: resolveCommentAvatarUrl(comment.avatarUrl, fallbackAvatar) }]);
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
    const response = await fetch(`/api/comments/${postId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ author: "Guest", content, parentId }) });
    if (response.ok) save(await response.json(), false);
    else save({ id: crypto.randomUUID(), author: "Guest", content, parentId, createdAt: new Date().toISOString(), avatarUrl: fallbackAvatar }, true);
    setSubmitting(false);
  }

  const roots = comments.filter((comment) => !comment.parentId);
  const replies = (id: string) => comments.filter((comment) => comment.parentId === id);

  const renderComment = (comment: Comment, reply = false) => (
    <article className={reply ? "comment-reply" : ""} key={comment.id}>
      <CommentAvatar src={comment.avatarUrl} seed={`${comment.author}-${comment.id}`} />
      <div>
        <strong>{comment.author}</strong>
        <time dateTime={comment.createdAt}>{formatCommentDate(comment.createdAt)}</time>
        <p>{comment.content}</p>
        <button type="button" onClick={() => setReplyingTo(comment)}>Reply</button>
        {replies(comment.id).map((child) => renderComment(child, true))}
      </div>
    </article>
  );

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
          {replyingTo && <button className="cancel-reply" type="button" onClick={() => setReplyingTo(null)}>Cancel</button>}
        </div>
        <textarea id="response" value={content} onChange={(event) => setContent(event.target.value)} placeholder={replyingTo ? `Reply to ${replyingTo.author}` : "What are your thoughts?"} required maxLength={6000} />
        <div className="response-actions">
          <small>{status}</small>
          <button disabled={!content.trim() || submitting}>{submitting ? "Publishing…" : replyingTo ? "Reply" : "Publish"}</button>
        </div>
      </form>
    </section>
  );
}
