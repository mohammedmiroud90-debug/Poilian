"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import type { Post } from "@/lib/parse";
import { RichTextEditor, type RichTextEditorHandle } from "@/components/RichTextEditor";

type EditablePost = Pick<Post, "id" | "title" | "excerpt" | "content" | "category" | "author"> & {
  className?: string;
  slug?: string;
  contentHtml?: string;
};

function EditGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4.5 16.8 15.2 6.1a1.8 1.8 0 0 1 2.5 0l.2.2a1.8 1.8 0 0 1 0 2.5L7.2 19.5H4.5v-2.7Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="m13.8 7.5 2.7 2.7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M4.5 21h15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function InlinePostEditor({ post }: { post: EditablePost }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [category, setCategory] = useState(post.category);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const editorRef = useRef<RichTextEditorHandle>(null);
  const initialHtml = post.contentHtml || post.content || "<p></p>";

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      editorRef.current?.setHtml(initialHtml);
      editorRef.current?.focus();
    });
  }, [open, initialHtml]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice("Saving…");
    const content = editorRef.current?.getHtml() || initialHtml;
    const response = await fetch("/api/admin/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: post.id,
        className: post.className || "Article",
        slug: post.slug,
        title,
        excerpt,
        category,
        author: post.author,
        content,
        status: "published",
      }),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setNotice(result.error || "Could not save this post.");
      setSaving(false);
      return;
    }
    setNotice("Saved. Refreshing…");
    window.location.reload();
  }

  return (
    <>
      <button
        className="inline-edit-trigger"
        type="button"
        onClick={() => {
          setNotice("");
          setOpen(true);
        }}
        aria-label="Edit this post"
        title="Edit this post"
      >
        <span className="inline-edit-trigger-icon">
          <EditGlyph />
        </span>
        <span className="inline-edit-trigger-label">Edit post</span>
      </button>

      {open && (
        <div className="inline-editor-overlay" role="dialog" aria-modal="true" aria-labelledby="inline-editor-title">
          <form className="inline-post-editor poilian-admin" onSubmit={(event) => void save(event)}>
            <header className="inline-post-editor-head">
              <div>
                <p className="section-label">ADMIN</p>
                <h2 id="inline-editor-title">Edit post</h2>
                <p>Same formatting tools as the posts studio — headings, media, links and embeds.</p>
              </div>
              <button
                type="button"
                className="inline-editor-close"
                onClick={() => setOpen(false)}
                aria-label="Close editor"
              >
                ×
              </button>
            </header>

            <div className="inline-post-editor-meta">
              <label>
                Title
                <input value={title} onChange={(event) => setTitle(event.target.value)} required />
              </label>
              <label>
                Category
                <input value={category} onChange={(event) => setCategory(event.target.value)} required />
              </label>
            </div>

            <label className="inline-post-editor-excerpt">
              Excerpt
              <textarea value={excerpt} onChange={(event) => setExcerpt(event.target.value)} rows={3} required />
            </label>

            <RichTextEditor
              ref={editorRef}
              initialHtml={initialHtml}
              label="Body"
              hint="Toolbar stays visible while you scroll · select text for quick format"
              variant="medium"
              showHelp={false}
            />

            <footer className="inline-post-editor-foot">
              <small role="status">{notice}</small>
              <div>
                <button type="button" className="inline-editor-cancel" onClick={() => setOpen(false)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </footer>
          </form>
        </div>
      )}
    </>
  );
}
