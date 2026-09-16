"use client";

import { ChangeEvent, useRef, useState } from "react";
import type { Post } from "@/lib/parse";
import { RichTextEditor, type RichTextEditorHandle } from "@/components/RichTextEditor";

type Draft = Omit<Post, "id" | "publishedAt"> & { id?: string; status: "published" | "draft" };

const blank = (): Draft => ({
  title: "",
  slug: "",
  excerpt: "",
  content: "<p>Tell your story…</p>",
  author: "Belhachemia Mohammed",
  category: "Personal notes",
  className: "Article",
  status: "published",
  audioUrl: "",
});

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function PostGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 4.5h8l4 4V19.5H7z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M15 4.5V9h4M10 12h6M10 15.5h4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function HelpIcon({ kind }: { kind: "heading" | "plus" | "image" | "video" | "audio" }) {
  if (kind === "plus") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="11" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="M16 11v10M11 16h10" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "image") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <rect x="6" y="8" width="20" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="13" r="2" fill="currentColor" />
        <path d="m8 22 5-5 4 4 3-3 4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "video") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <rect x="5" y="9" width="16" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="m21 13 6-3v12l-6-3z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "audio") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M10 13v6M14 10v12M18 12v8M22 14v4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M8 10h16M8 16h12M8 22h8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

const helpTips = [
  {
    title: "Headings",
    body: "Use Heading 1–3 from the style menu — sizes show live in the editor.",
    icon: "heading" as const,
  },
  {
    title: "Insert menu",
    body: "Use the + button for images, video, PDF files, and dividers.",
    icon: "plus" as const,
  },
  {
    title: "Images & PDF",
    body: "Upload or paste a URL. PDFs embed inline with a download link.",
    icon: "image" as const,
  },
  {
    title: "Video",
    body: "Paste a YouTube or Vimeo URL to embed a player.",
    icon: "video" as const,
  },
  {
    title: "Listen",
    body: "Upload full-post audio to show the Listen player under the title.",
    icon: "audio" as const,
  },
];

export function PostManager({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [notice, setNotice] = useState("");
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const editorRef = useRef<RichTextEditorHandle>(null);

  const update = (key: keyof Draft, value: string) => draft && setDraft({ ...draft, [key]: value });

  function edit(post: Post) {
    const next: Draft = {
      ...post,
      status: "published",
      content: post.contentHtml || post.content,
      audioUrl: post.audioUrl || "",
    };
    setDraft(next);
    setNotice("");
    requestAnimationFrame(() => {
      editorRef.current?.setHtml(post.contentHtml || post.content || "<p></p>");
    });
  }

  function create() {
    const next = blank();
    setDraft(next);
    setNotice("");
    requestAnimationFrame(() => {
      editorRef.current?.setHtml(next.content);
    });
  }

  async function save() {
    if (!draft) return;
    const content = editorRef.current?.getHtml() || draft.content;
    const payload = { ...draft, content, audioUrl: draft.audioUrl || "" };
    setNotice("Saving…");
    const response = await fetch("/api/admin/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) return setNotice(result.error || "Could not save post.");
    const saved = {
      ...payload,
      id: draft.id || result.id,
      className: result.className,
      publishedAt: new Date().toISOString(),
    } as Post;
    setPosts((items) =>
      items.some((post) => post.id === saved.id)
        ? items.map((post) => (post.id === saved.id ? saved : post))
        : [saved, ...items],
    );
    setDraft({ ...saved, status: payload.status });
    setNotice("Saved. Your post is ready to publish.");
  }

  async function remove(post: Post) {
    if (!confirm(`Delete “${post.title}”?`)) return;
    const response = await fetch(`/api/admin/posts/${post.id}?class=${post.className || "Article"}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setPosts((items) => items.filter((item) => item.id !== post.id));
      setDraft(null);
      setNotice("Post deleted.");
    }
  }

  async function uploadAudio(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !draft) return;
    setUploadingAudio(true);
    setNotice("Uploading audio…");
    const form = new FormData();
    form.set("audio", file);
    const response = await fetch("/api/admin/media/audio", { method: "POST", body: form });
    const result = (await response.json()) as { url?: string; error?: string };
    if (response.ok && result.url) {
      setDraft({ ...draft, audioUrl: result.url });
      setNotice("Audio uploaded. Save the post to publish it.");
    } else {
      setNotice(result.error || "Audio upload failed.");
    }
    setUploadingAudio(false);
    event.target.value = "";
  }

  return (
    <section className="post-manager post-manager-v2 post-manager-enhanced">
      <header className="admin-page-title admin-posts-title">
        <div>
          <p className="section-label">CONTENT STUDIO</p>
          <h1>Posts</h1>
          <p>Write with live heading styles, clean formatting tools, and a Stack Overflow–style editor.</p>
        </div>
        <div className="admin-posts-title-actions">
          <div className="admin-posts-stats" aria-label="Post totals">
            <span>
              <strong>{posts.length}</strong>
              posts
            </span>
            <span>
              <strong>{draft ? "Editing" : "Ready"}</strong>
              workspace
            </span>
          </div>
          <button className="new-page" type="button" onClick={create}>
            New post
          </button>
        </div>
      </header>

      <div className="post-manager-layout">
        <aside className="post-manager-list" aria-label="Posts">
          {posts.length === 0 ? (
            <p className="admin-empty post-list-empty">No posts yet.</p>
          ) : (
            posts.map((post) => (
              <div className={`post-list-row${draft?.id === post.id ? " selected" : ""}`} key={post.id}>
                <span className="post-list-icon" aria-hidden="true">
                  <PostGlyph />
                </span>
                <button type="button" className="post-list-select" onClick={() => edit(post)}>
                  <strong>{post.title}</strong>
                  <span>
                    {post.category} · {formatDate(post.publishedAt)}
                  </span>
                </button>
                <button
                  className="delete-button"
                  type="button"
                  onClick={() => void remove(post)}
                  aria-label={`Delete ${post.title}`}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </aside>

        {draft ? (
          <div className="post-composer-shell">
            <article className="post-composer">
              <div className="post-composer-actions">
                {draft.slug ? (
                  <a href={`/posts/${draft.slug}`} target="_blank" rel="noreferrer">
                    View live post ↗
                  </a>
                ) : (
                  <span className="post-composer-draft-pill">New draft</span>
                )}
                <span role="status">{notice}</span>
              </div>

              <input
                className="post-title-input"
                value={draft.title}
                onChange={(event) => {
                  const title = event.target.value;
                  setDraft((current) => {
                    if (!current) return current;
                    const next = { ...current, title };
                    if (!current.slug) {
                      next.slug = title
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-|-$/g, "");
                    }
                    return next;
                  });
                }}
                placeholder="Write a memorable title…"
              />

              <div className="post-meta-grid">
                <label>
                  Category
                  <input value={draft.category} onChange={(event) => update("category", event.target.value)} />
                </label>
                <label>
                  Author
                  <input value={draft.author} onChange={(event) => update("author", event.target.value)} />
                </label>
                <label>
                  URL slug
                  <input
                    value={draft.slug}
                    onChange={(event) => update("slug", event.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  />
                </label>
              </div>

              <label className="post-excerpt">
                Excerpt
                <textarea
                  value={draft.excerpt}
                  onChange={(event) => update("excerpt", event.target.value)}
                  placeholder="Give readers a concise reason to open this story."
                />
              </label>

              <div className="post-audio-field">
                <label>
                  Full-post listen audio
                  <input
                    value={draft.audioUrl || ""}
                    onChange={(event) => update("audioUrl", event.target.value)}
                    placeholder="https://… or upload an MP3 of the full article"
                  />
                </label>
                <label className="post-audio-upload">
                  Upload audio
                  <input
                    type="file"
                    accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/x-m4a,audio/aac,.mp3,.wav,.ogg,.m4a"
                    onChange={(event) => void uploadAudio(event)}
                    disabled={uploadingAudio}
                  />
                  <span>{uploadingAudio ? "Uploading…" : "Choose audio file"}</span>
                </label>
                {draft.audioUrl ? (
                  <div className="post-audio-preview">
                    <audio controls src={draft.audioUrl} />
                    <button type="button" onClick={() => update("audioUrl", "")}>
                      Remove audio
                    </button>
                  </div>
                ) : (
                  <p>
                    Add a recording of the full post. The Listen control and the under-title player appear only after
                    this is saved.
                  </p>
                )}
              </div>

              <div className="post-rich-editor-wrap">
                <RichTextEditor
                  ref={editorRef}
                  key={draft.id || "new-post"}
                  initialHtml={draft.content}
                  variant="medium"
                  label="Body"
                  hint="Write like Medium: sticky toolbar, insert menu for images, video, PDF, and dividers. Formatting previews live as you type."
                  placeholder="Tell your story…"
                  onChange={(html) => update("content", html)}
                  className="admin-post-editor"
                />
              </div>

              <footer className="post-save">
                <label>
                  Status
                  <select value={draft.status} onChange={(event) => update("status", event.target.value)}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </label>
                <button type="button" onClick={() => void save()}>
                  Save post
                </button>
              </footer>
            </article>

            <aside className="post-editor-help" aria-label="Helpful links">
              <h2>Helpful links</h2>
              <ol className="df-resource-list df-resource-list--compact post-help-list">
                {helpTips.map((tip, index) => (
                  <li key={tip.title}>
                    <span className="df-resource-index" aria-hidden="true">
                      {index + 1}
                    </span>
                    <div className="df-resource-copy">
                      <strong>{tip.title}</strong>
                      <span>{tip.body}</span>
                    </div>
                    <span className="df-resource-icon" aria-hidden="true">
                      <HelpIcon kind={tip.icon} />
                    </span>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        ) : (
          <div className="empty-editor">
            <span className="empty-editor-icon" aria-hidden="true">
              <PostGlyph />
            </span>
            <h2>Start a new story</h2>
            <p>Select an article to edit or create a new post with the full rich editor.</p>
            <button type="button" className="new-page" onClick={create}>
              New post
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
