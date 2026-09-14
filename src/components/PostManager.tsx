"use client";

import { useRef, useState } from "react";
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
});

export function PostManager({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [notice, setNotice] = useState("");
  const editorRef = useRef<RichTextEditorHandle>(null);

  const update = (key: keyof Draft, value: string) => draft && setDraft({ ...draft, [key]: value });

  function edit(post: Post) {
    const next: Draft = { ...post, status: "published", content: post.contentHtml || post.content };
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
    const payload = { ...draft, content };
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

  return (
    <section className="post-manager post-manager-v2">
      <header className="admin-page-title">
        <div>
          <p className="section-label">CONTENT STUDIO</p>
          <h1>Posts</h1>
          <p>Write with live heading styles, clean formatting tools, and a Stack Overflow–style editor.</p>
        </div>
        <button className="new-page" type="button" onClick={create}>
          New post
        </button>
      </header>

      <div className="post-manager-layout">
        <aside className="post-manager-list" aria-label="Posts">
          {posts.map((post) => (
            <div className={draft?.id === post.id ? "selected" : ""} key={post.id}>
              <button type="button" onClick={() => edit(post)}>
                <strong>{post.title}</strong>
                <span>
                  {post.category} · {new Date(post.publishedAt).toLocaleDateString()}
                </span>
              </button>
              <button className="delete-button" type="button" onClick={() => void remove(post)} aria-label={`Delete ${post.title}`}>
                ×
              </button>
            </div>
          ))}
        </aside>

        {draft ? (
          <div className="post-composer-shell">
            <article className="post-composer">
              <div className="post-composer-actions">
                {draft.slug ? (
                  <a href={`/posts/${draft.slug}`} target="_blank" rel="noreferrer">
                    View live post
                  </a>
                ) : (
                  <span />
                )}
                <span>{notice}</span>
              </div>

              <input
                className="post-title-input"
                value={draft.title}
                onChange={(event) => {
                  update("title", event.target.value);
                  if (!draft.slug) {
                    update(
                      "slug",
                      event.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-|-$/g, ""),
                    );
                  }
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

              <RichTextEditor
                ref={editorRef}
                key={draft.id || "new-post"}
                initialHtml={draft.content}
                label="Body"
                hint="Include all the information someone would need to read your article. Headings, lists and embeds preview live below."
                placeholder="Start writing…"
                onChange={(html) => update("content", html)}
              />

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
              <ul>
                <li>
                  <strong>Headings</strong>
                  <span>Use Heading 1–3 from the style menu — sizes show live in the editor.</span>
                </li>
                <li>
                  <strong>Images</strong>
                  <span>Upload from the image tool; click an image to resize or remove it.</span>
                </li>
                <li>
                  <strong>Video</strong>
                  <span>Paste a YouTube or Vimeo URL to embed a player.</span>
                </li>
                <li>
                  <strong>Shortcuts</strong>
                  <span>Ctrl+B bold · Ctrl+I italic · lists and quotes from the toolbar.</span>
                </li>
              </ul>
            </aside>
          </div>
        ) : (
          <div className="empty-editor">
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
