"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import type { Note } from "@/lib/notes";
import { defaultPromotionImage } from "@/lib/promotion";

export function SettingsManager({ initialImage, initialNotes }: { initialImage: string; initialNotes: Note[] }) {
  const [image, setImage] = useState(initialImage || defaultPromotionImage);
  const [notes, setNotes] = useState(initialNotes);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [notice, setNotice] = useState("");
  const [uploading, setUploading] = useState(false);

  async function saveBanner(next = image) {
    setNotice("Saving banner…");
    const response = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ promotionImage: next }) });
    const result = await response.json() as { error?: string };
    setNotice(response.ok ? "Banner image saved." : result.error || "Image could not be saved.");
  }

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true); setNotice("Uploading image…");
    const form = new FormData(); form.set("image", file);
    const response = await fetch("/api/admin/profile/upload", { method: "POST", body: form });
    const result = await response.json() as { url?: string; error?: string };
    if (response.ok && result.url) { setImage(result.url); await saveBanner(result.url); } else setNotice(result.error || "Image upload failed.");
    setUploading(false); event.target.value = "";
  }

  async function saveNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setNotice("Saving note…");
    const response = await fetch("/api/admin/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, excerpt, content }) });
    const result = await response.json() as { id?: string; error?: string };
    if (!response.ok) return setNotice(result.error || "Note could not be saved.");
    setNotes([{ id: result.id || crypto.randomUUID(), title: title.trim(), excerpt: excerpt.trim(), content: content.trim(), status: "published", updatedAt: new Date().toISOString() }, ...notes]);
    setTitle(""); setExcerpt(""); setContent(""); setNotice("Note published.");
  }

  async function removeNote(id: string) {
    const response = await fetch(`/api/admin/notes/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (response.ok) { setNotes((items) => items.filter((note) => note.id !== id)); setNotice("Note deleted."); }
  }

  return <section className="admin-list-page settings-manager">
    <header className="admin-page-title"><div><p className="section-label">SITE SETTINGS</p><h1>Settings</h1><p>Manage your article banner and personal notes.</p></div></header>
    <section className="settings-section"><div className="settings-section-heading"><div><p className="section-label">NOTES</p><h2>Manage notes</h2></div><span>{notes.length} {notes.length === 1 ? "note" : "notes"}</span></div>
      <form className="note-form" onSubmit={saveNote}><label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="A small thought…" required /></label><label>Short description<input value={excerpt} onChange={(event) => setExcerpt(event.target.value)} placeholder="What is this note about?" /></label><label>Note<textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write your note here…" rows={5} required /></label><button type="submit">Add note <span>→</span></button></form>
      <div className="notes-admin-list">{notes.map((note) => <article key={note.id}><div><strong>{note.title}</strong><span>{note.excerpt || note.content.slice(0, 100)}</span></div><button type="button" onClick={() => void removeNote(note.id)} aria-label={`Delete ${note.title}`}>Delete</button></article>)}</div>
    </section>
    <section className="settings-section settings-banner-section"><header className="settings-section-heading"><div><p className="section-label">ARTICLE PROMOTION</p><h2>Promotional banner</h2><p>Choose the image shown below article tables of contents.</p></div></header><form onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void saveBanner(); }}><div className="settings-banner-preview"><img src={image} alt="Article promotional banner preview" /></div><label>Banner image URL<input type="url" value={image} onChange={(event) => setImage(event.target.value)} required /></label><label className="settings-upload">Upload a new banner image<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={upload} disabled={uploading} /><span>{uploading ? "Uploading…" : "Choose image"}</span></label><footer><small>{notice}</small><button disabled={uploading}>Save banner</button></footer></form></section>
  </section>;
}
