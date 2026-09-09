"use client";

import { FormEvent, useRef, useState } from "react";

type EditablePost = { id: string; className?: string; title: string; excerpt: string; content: string; category: string; author: string };

export function InlinePostEditor({ post }: { post: EditablePost }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [content, setContent] = useState(post.content);
  const [notice, setNotice] = useState("");
  const body = useRef<HTMLTextAreaElement>(null);

  function wrap(before: string, after = before, fallback = "text") {
    const input = body.current;
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const selected = content.slice(start, end) || fallback;
    const next = `${content.slice(0, start)}${before}${selected}${after}${content.slice(end)}`;
    setContent(next);
    requestAnimationFrame(() => { input.focus(); input.setSelectionRange(start + before.length, start + before.length + selected.length); });
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("Saving…");
    const response = await fetch("/api/admin/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...post, title, excerpt, content, status: "published" }) });
    const result = await response.json() as { error?: string };
    if (!response.ok) { setNotice(result.error || "Could not save this post."); return; }
    setNotice("Saved. Refreshing the article…");
    window.location.reload();
  }

  return <><button className="inline-edit-trigger" type="button" onClick={() => setOpen(true)} aria-label="Edit this post" title="Edit this post">✎ <span>Edit</span></button>{open && <div className="inline-editor-overlay" role="dialog" aria-modal="true" aria-labelledby="inline-editor-title"><form className="inline-post-editor" onSubmit={save}><header><div><p className="section-label">ADMIN EDITOR</p><h2 id="inline-editor-title">Edit post</h2></div><button type="button" className="inline-editor-close" onClick={() => setOpen(false)} aria-label="Close editor">×</button></header><label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} required /></label><label>Excerpt<textarea value={excerpt} onChange={(event) => setExcerpt(event.target.value)} required /></label><div className="inline-editor-toolbar" role="toolbar" aria-label="Content formatting"><button type="button" onClick={() => wrap("**")}>Bold</button><button type="button" onClick={() => wrap("_")}>Italic</button><button type="button" onClick={() => wrap("## ", "", "Heading")}>Heading</button><button type="button" onClick={() => wrap("- ", "", "List item")}>List</button><button type="button" onClick={() => wrap("> ", "", "Quote")}>Quote</button><button type="button" onClick={() => wrap("[", "](https://)", "Link text")}>Link</button></div><label>Content<textarea ref={body} className="inline-editor-content" value={content} onChange={(event) => setContent(event.target.value)} required /></label><footer><small role="status">{notice}</small><div><button type="button" className="inline-editor-cancel" onClick={() => setOpen(false)}>Cancel</button><button type="submit">Save changes</button></div></footer></form></div>}</>;
}
