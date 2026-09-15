"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import type { Note } from "@/lib/notes";
import { defaultCommentAvatarUrl, defaultFaviconUrl, defaultLogoUrl } from "@/lib/branding";
import { defaultPromotionImage } from "@/lib/promotion";

type UploadKind = "banner" | "logo" | "comment" | "favicon";

export function SettingsManager({
  initialImage,
  initialLogo,
  initialCommentAvatar,
  initialFavicon,
  initialNotes,
}: {
  initialImage: string;
  initialLogo: string;
  initialCommentAvatar: string;
  initialFavicon: string;
  initialNotes: Note[];
}) {
  const [image, setImage] = useState(initialImage || defaultPromotionImage);
  const [logo, setLogo] = useState(initialLogo || defaultLogoUrl);
  const [commentAvatar, setCommentAvatar] = useState(initialCommentAvatar || defaultCommentAvatarUrl);
  const [favicon, setFavicon] = useState(initialFavicon || defaultFaviconUrl);
  const [notes, setNotes] = useState(initialNotes);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [notice, setNotice] = useState("");
  const [uploading, setUploading] = useState<UploadKind | "">("");

  async function saveSettings(
    body: { promotionImage?: string; logoUrl?: string; commentAvatarUrl?: string; faviconUrl?: string },
    success: string,
  ) {
    setNotice("Saving…");
    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = (await response.json()) as { error?: string };
    setNotice(response.ok ? success : result.error || "Could not be saved.");
    return response.ok;
  }

  async function saveBanner(next = image) {
    await saveSettings({ promotionImage: next }, "Banner image saved.");
  }

  async function saveLogo(next = logo) {
    await saveSettings({ logoUrl: next }, "Logo saved. Refresh the site to see it everywhere.");
  }

  async function saveCommentAvatar(next = commentAvatar) {
    await saveSettings(
      { commentAvatarUrl: next },
      "Comment avatar saved. Guests without a profile photo will use this image.",
    );
  }

  async function saveFavicon(next = favicon) {
    const ok = await saveSettings({ faviconUrl: next }, "Favicon saved. Reloading so the new tab icon appears…");
    if (ok && typeof window !== "undefined") {
      window.setTimeout(() => window.location.reload(), 400);
    }
  }

  async function upload(kind: UploadKind, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(kind);
    setNotice("Uploading image…");
    const form = new FormData();
    form.set("image", file);
    const response = await fetch("/api/admin/profile/upload", { method: "POST", body: form });
    const result = (await response.json()) as { url?: string; error?: string };
    if (response.ok && result.url) {
      if (kind === "banner") {
        setImage(result.url);
        await saveBanner(result.url);
      } else if (kind === "logo") {
        setLogo(result.url);
        await saveLogo(result.url);
      } else if (kind === "favicon") {
        setFavicon(result.url);
        await saveFavicon(result.url);
      } else {
        setCommentAvatar(result.url);
        await saveCommentAvatar(result.url);
      }
    } else setNotice(result.error || "Image upload failed.");
    setUploading("");
    event.target.value = "";
  }

  async function saveNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("Saving note…");
    const response = await fetch("/api/admin/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, excerpt, content }),
    });
    const result = (await response.json()) as { id?: string; error?: string };
    if (!response.ok) return setNotice(result.error || "Note could not be saved.");
    setNotes([
      {
        id: result.id || crypto.randomUUID(),
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        status: "published",
        updatedAt: new Date().toISOString(),
      },
      ...notes,
    ]);
    setTitle("");
    setExcerpt("");
    setContent("");
    setNotice("Note published.");
  }

  async function removeNote(id: string) {
    const response = await fetch(`/api/admin/notes/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (response.ok) {
      setNotes((items) => items.filter((note) => note.id !== id));
      setNotice("Note deleted.");
    }
  }

  return (
    <section className="admin-list-page settings-manager">
      <header className="admin-page-title">
        <div>
          <p className="section-label">SITE SETTINGS</p>
          <h1>Settings</h1>
          <p>Manage your logo, favicon, comment avatars, article banner and personal notes.</p>
        </div>
      </header>

      <section className="settings-section">
        <div className="settings-section-heading">
          <div>
            <p className="section-label">NOTES</p>
            <h2>Manage notes</h2>
          </div>
          <span>
            {notes.length} {notes.length === 1 ? "note" : "notes"}
          </span>
        </div>
        <form className="note-form" onSubmit={saveNote}>
          <label>
            Title
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="A small thought…" required />
          </label>
          <label>
            Short description
            <input value={excerpt} onChange={(event) => setExcerpt(event.target.value)} placeholder="What is this note about?" />
          </label>
          <label>
            Note
            <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write your note here…" rows={5} required />
          </label>
          <button type="submit">
            Add note <span>→</span>
          </button>
        </form>
        <div className="notes-admin-list">
          {notes.map((note) => (
            <article key={note.id}>
              <div>
                <strong>{note.title}</strong>
                <span>{note.excerpt || note.content.slice(0, 100)}</span>
              </div>
              <button type="button" onClick={() => void removeNote(note.id)} aria-label={`Delete ${note.title}`}>
                Delete
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="settings-section settings-logo-section">
        <header className="settings-section-heading">
          <div>
            <p className="section-label">BRANDING</p>
            <h2>Site logo</h2>
            <p>Upload an image to replace the logo in the header, footer and admin.</p>
          </div>
        </header>
        <form
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            void saveLogo();
          }}
        >
          <div className="settings-logo-preview">
            <img src={logo} alt="Site logo preview" />
          </div>
          <label>
            Logo image URL
            <input value={logo} onChange={(event) => setLogo(event.target.value)} required />
          </label>
          <label className="settings-upload">
            Upload a logo image
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(event) => void upload("logo", event)}
              disabled={Boolean(uploading)}
            />
            <span>{uploading === "logo" ? "Uploading…" : "Choose image"}</span>
          </label>
          <footer>
            <small>{notice}</small>
            <div className="settings-logo-actions">
              <button
                type="button"
                className="settings-reset"
                disabled={Boolean(uploading)}
                onClick={() => {
                  setLogo(defaultLogoUrl);
                  void saveLogo(defaultLogoUrl);
                }}
              >
                Use default
              </button>
              <button disabled={Boolean(uploading)}>Save logo</button>
            </div>
          </footer>
        </form>
      </section>

      <section className="settings-section settings-favicon-section">
        <header className="settings-section-heading">
          <div>
            <p className="section-label">BROWSER TAB</p>
            <h2>Favicon</h2>
            <p>Set the icon shown in browser tabs. Paste an image URL or upload a PNG, JPG, WebP, GIF, or ICO file.</p>
          </div>
        </header>
        <form
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            void saveFavicon();
          }}
        >
          <div className="settings-favicon-preview">
            <img src={favicon} alt="Favicon preview" width={48} height={48} />
          </div>
          <label>
            Favicon image URL
            <input value={favicon} onChange={(event) => setFavicon(event.target.value)} required />
          </label>
          <label className="settings-upload">
            Upload a favicon
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/x-icon,image/vnd.microsoft.icon,.ico"
              onChange={(event) => void upload("favicon", event)}
              disabled={Boolean(uploading)}
            />
            <span>{uploading === "favicon" ? "Uploading…" : "Choose image"}</span>
          </label>
          <footer>
            <small>{notice}</small>
            <div className="settings-logo-actions">
              <button
                type="button"
                className="settings-reset"
                disabled={Boolean(uploading)}
                onClick={() => {
                  setFavicon(defaultFaviconUrl);
                  void saveFavicon(defaultFaviconUrl);
                }}
              >
                Use default
              </button>
              <button disabled={Boolean(uploading)}>Save favicon</button>
            </div>
          </footer>
        </form>
      </section>

      <section className="settings-section settings-comment-avatar-section">
        <header className="settings-section-heading">
          <div>
            <p className="section-label">COMMENTS</p>
            <h2>Default comment avatar</h2>
            <p>This image is shown for readers who have not uploaded a profile photo.</p>
          </div>
        </header>
        <form
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            void saveCommentAvatar();
          }}
        >
          <div className="settings-comment-avatar-preview">
            <img src={commentAvatar} alt="Default comment avatar preview" />
          </div>
          <label>
            Comment avatar URL
            <input value={commentAvatar} onChange={(event) => setCommentAvatar(event.target.value)} required />
          </label>
          <label className="settings-upload">
            Upload a comment avatar
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(event) => void upload("comment", event)}
              disabled={Boolean(uploading)}
            />
            <span>{uploading === "comment" ? "Uploading…" : "Choose image"}</span>
          </label>
          <footer>
            <small>{notice}</small>
            <div className="settings-logo-actions">
              <button
                type="button"
                className="settings-reset"
                disabled={Boolean(uploading)}
                onClick={() => {
                  setCommentAvatar(defaultCommentAvatarUrl);
                  void saveCommentAvatar(defaultCommentAvatarUrl);
                }}
              >
                Use default
              </button>
              <button disabled={Boolean(uploading)}>Save avatar</button>
            </div>
          </footer>
        </form>
      </section>

      <section className="settings-section settings-banner-section">
        <header className="settings-section-heading">
          <div>
            <p className="section-label">ARTICLE PROMOTION</p>
            <h2>Promotional banner</h2>
            <p>Choose the image shown below article tables of contents.</p>
          </div>
        </header>
        <form
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            void saveBanner();
          }}
        >
          <div className="settings-banner-preview">
            <img src={image} alt="Article promotional banner preview" />
          </div>
          <label>
            Banner image URL
            <input type="url" value={image} onChange={(event) => setImage(event.target.value)} required />
          </label>
          <label className="settings-upload">
            Upload a new banner image
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(event) => void upload("banner", event)}
              disabled={Boolean(uploading)}
            />
            <span>{uploading === "banner" ? "Uploading…" : "Choose image"}</span>
          </label>
          <footer>
            <small>{notice}</small>
            <button disabled={Boolean(uploading)}>Save banner</button>
          </footer>
        </form>
      </section>
    </section>
  );
}
