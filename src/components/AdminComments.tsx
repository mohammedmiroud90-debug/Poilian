"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { RichTextEditor, type RichTextEditorHandle } from "@/components/RichTextEditor";
import { plainTextFromHtml } from "@/lib/contactShared";

type Entry = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  parentId?: string;
  post: string;
  postId: string;
  slug: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function CommentGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 5h14v10H9l-4 4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M8 9h8M8 12h5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function AdminComments({ initialEntries, author }: { initialEntries: Entry[]; author: string }) {
  const editorRef = useRef<RichTextEditorHandle>(null);
  const [entries, setEntries] = useState(initialEntries);
  const [replyingTo, setReplyingTo] = useState<Entry | null>(null);
  const [bodyHtml, setBodyHtml] = useState("<p></p>");
  const [editorKey, setEditorKey] = useState(0);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  const roots = entries.filter((entry) => !entry.parentId);
  const children = (id: string) => entries.filter((entry) => entry.parentId === id);

  function closeComposer() {
    setReplyingTo(null);
    setBodyHtml("<p></p>");
    setEditorKey((value) => value + 1);
    setNotice("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!replyingTo || saving) return;
    const html = editorRef.current?.getHtml() || bodyHtml;
    const content = plainTextFromHtml(html);
    if (!content.trim()) return;

    setSaving(true);
    setNotice("Saving reply…");
    const response = await fetch("/api/admin/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId: replyingTo.postId,
        parentId: replyingTo.id,
        slug: replyingTo.slug,
        postTitle: replyingTo.post,
        replyToAuthor: replyingTo.author,
        author,
        content,
      }),
    });
    const result = (await response.json()) as {
      id?: string;
      author?: string;
      content?: string;
      parentId?: string;
      createdAt?: string;
      error?: string;
    };
    if (!response.ok) {
      setNotice(result.error || "Reply could not be saved.");
      setSaving(false);
      return;
    }

    setEntries((current) => [
      ...current,
      {
        id: result.id || crypto.randomUUID(),
        author: result.author || author,
        content: result.content || content,
        parentId: result.parentId || replyingTo.id,
        createdAt: result.createdAt || new Date().toISOString(),
        post: replyingTo.post,
        postId: replyingTo.postId,
        slug: replyingTo.slug,
      },
    ]);
    closeComposer();
    setNotice("Reply published.");
    setSaving(false);
  }

  function renderEntry(entry: Entry, nested = false) {
    const isActive = replyingTo?.id === entry.id;
    return (
      <article className={`admin-comment${nested ? " is-reply" : ""}${isActive ? " is-active" : ""}`} key={entry.id}>
        <div className="admin-comment-icon" aria-hidden="true">
          <CommentGlyph />
        </div>
        <div className="admin-comment-body">
          <header className="admin-comment-head">
            <div>
              <strong>{entry.author}</strong>
              <span>
                {nested ? "Reply on" : "On"}{" "}
                {entry.slug ? (
                  <Link href={`/posts/${entry.slug}`} target="_blank" rel="noreferrer">
                    {entry.post}
                  </Link>
                ) : (
                  entry.post
                )}{" "}
                · {formatDate(entry.createdAt)}
              </span>
            </div>
            <button
              type="button"
              className="admin-comment-reply-btn"
              onClick={() => {
                setReplyingTo(entry);
                setBodyHtml("<p></p>");
                setEditorKey((value) => value + 1);
                setNotice("");
              }}
            >
              Reply
            </button>
          </header>
          <p className="admin-comment-text">{entry.content}</p>
          {children(entry.id).map((child) => renderEntry(child, true))}
        </div>
      </article>
    );
  }

  return (
    <section className="admin-list-page admin-comments-page">
      <div className="admin-page-title admin-comments-title">
        <div>
          <p className="section-label">MODERATION</p>
          <h1>Comments</h1>
          <p>Reader responses published on your articles. Replies are posted as {author}.</p>
        </div>
        <div className="admin-comments-stats" aria-label="Comment totals">
          <span>
            <strong>{roots.length}</strong>
            threads
          </span>
          <span>
            <strong>{entries.length}</strong>
            total
          </span>
        </div>
      </div>

      <div className="admin-data-list admin-comments-list">
        {roots.length ? roots.map((entry) => renderEntry(entry)) : <p className="admin-empty">No comments yet.</p>}
      </div>

      {replyingTo && (
        <form className="admin-reply-composer admin-reply-composer--rich" onSubmit={submit}>
          <div className="admin-reply-composer-head">
            <div>
              <p className="admin-reply-label">Replying to {replyingTo.author}</p>
              <p className="admin-reply-context">
                On{" "}
                {replyingTo.slug ? (
                  <Link href={`/posts/${replyingTo.slug}`} target="_blank" rel="noreferrer">
                    {replyingTo.post}
                  </Link>
                ) : (
                  replyingTo.post
                )}
              </p>
            </div>
            <button type="button" onClick={closeComposer}>
              Cancel
            </button>
          </div>

          <RichTextEditor
            key={editorKey}
            ref={editorRef}
            variant="medium"
            showHelp={false}
            label="Your reply"
            hint="Keep it concise. Basic formatting is supported; published replies appear as plain text on the post."
            placeholder={`Reply to ${replyingTo.author}…`}
            initialHtml={bodyHtml}
            onChange={setBodyHtml}
            className="admin-comment-editor"
          />

          <footer>
            <small role="status">{notice}</small>
            <button type="submit" disabled={saving}>
              {saving ? "Sending…" : "Publish reply"}
            </button>
          </footer>
        </form>
      )}
    </section>
  );
}
