"use client";

import { FormEvent, useState } from "react";

type Entry = { id: string; author: string; content: string; createdAt: string; parentId?: string; post: string; postId: string; slug: string };

export function AdminComments({ initialEntries, author }: { initialEntries: Entry[]; author: string }) {
  const [entries, setEntries] = useState(initialEntries);
  const [replyingTo, setReplyingTo] = useState<Entry | null>(null);
  const [content, setContent] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!replyingTo || !content.trim() || saving) return;
    setSaving(true); setNotice("Saving reply…");
    const response = await fetch("/api/admin/comments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postId: replyingTo.postId, parentId: replyingTo.id, slug: replyingTo.slug, author, content }) });
    const result = await response.json() as { id?: string; author?: string; content?: string; parentId?: string; createdAt?: string; error?: string };
    if (!response.ok) { setNotice(result.error || "Reply could not be saved."); setSaving(false); return; }
    setEntries((current) => [...current, { id: result.id || crypto.randomUUID(), author: result.author || author, content: result.content || content.trim(), parentId: result.parentId || replyingTo.id, createdAt: result.createdAt || new Date().toISOString(), post: replyingTo.post, postId: replyingTo.postId, slug: replyingTo.slug }]);
    setContent(""); setReplyingTo(null); setNotice("Reply published."); setSaving(false);
  }
  const children = (id: string) => entries.filter((entry) => entry.parentId === id);
  const renderEntry = (entry: Entry, nested = false) => <article className={`admin-comment${nested ? " is-reply" : ""}`} key={entry.id}><div><strong>{entry.author}</strong><span>{nested ? "Reply on" : "On"} {entry.post} · {new Date(entry.createdAt).toLocaleDateString()}</span><p>{entry.content}</p><button type="button" onClick={() => { setReplyingTo(entry); setContent(""); setNotice(""); }}>Reply</button>{children(entry.id).map((child) => renderEntry(child, true))}</div></article>;
  return <section className="admin-list-page"><div className="admin-page-title"><div><p className="section-label">MODERATION</p><h1>Comments</h1><p>Reader responses published on your articles.</p></div></div><div className="admin-data-list admin-comments-list">{entries.length ? entries.filter((entry) => !entry.parentId).map((entry) => renderEntry(entry)) : <p className="admin-empty">No comments yet.</p>}</div>{replyingTo && <form className="admin-reply-composer" onSubmit={submit}><div><span>Replying to {replyingTo.author}</span><button type="button" onClick={() => { setReplyingTo(null); setContent(""); }}>Cancel</button></div><textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder={`Reply to ${replyingTo.author}…`} maxLength={6000} autoFocus required /><footer><small>{notice}</small><button disabled={!content.trim() || saving}>{saving ? "Sending…" : "Publish reply"}</button></footer></form>}</section>;
}
