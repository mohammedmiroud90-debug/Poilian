"use client";
import { ChangeEvent, FormEvent, useState } from "react";
import type { AuthorProfile } from "@/lib/profile";

export function ProfileManager({ initialProfile }: { initialProfile: AuthorProfile }) {
  const [profile, setProfile] = useState(initialProfile);
  const [notice, setNotice] = useState("");
  const [uploading, setUploading] = useState(false);
  const update = (key: keyof AuthorProfile, value: string) => setProfile((current) => ({ ...current, [key]: value }));
  async function persist(next: AuthorProfile, successMessage: string) {
    const response = await fetch("/api/admin/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) });
    const result = await response.json() as { error?: string };
    setNotice(response.ok ? successMessage : result.error ?? "Unable to save your profile.");
    return response.ok;
  }
  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true); setNotice("Uploading image…");
    const data = new FormData(); data.set("image", file);
    const response = await fetch("/api/admin/profile/upload", { method: "POST", body: data });
    const result = await response.json() as { url?: string; storage?: string; error?: string };
    if (response.ok && result.url) {
      const next = { ...profile, avatarUrl: result.url };
      setProfile(next);
      setNotice("Avatar uploaded. Linking it to your profile…");
      await persist(next, result.storage === "r2" ? "Avatar uploaded to R2 and saved to your profile." : "Avatar uploaded and saved to your profile.");
    } else setNotice(result.error ?? "Image upload failed.");
    setUploading(false); event.target.value = "";
  }
  async function save(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setNotice("Saving…"); await persist(profile, "Profile saved. Your author details are ready to use across the blog."); }
  return <section className="profile-manager"><header className="admin-page-title"><div><p className="section-label">AUTHOR PROFILE</p><h1>Your public profile</h1><p>Control the details readers see beside your writing.</p></div></header><form onSubmit={save} className="profile-form"><div className="profile-preview"><img src={profile.avatarUrl || "/brand.png"} alt="Profile preview" /><div><strong>{profile.name || "Your name"}</strong><span>{profile.bio || "Your author biography will appear here."}</span></div></div><div className="field-grid"><label>Display name<input value={profile.name} onChange={(event) => update("name", event.target.value)} maxLength={100} required /></label><label>LinkedIn profile URL<input type="url" value={profile.linkedinUrl} onChange={(event) => update("linkedinUrl", event.target.value)} placeholder="https://www.linkedin.com/in/your-name" /></label></div><div className="profile-image-fields"><label>Profile image URL<input type="url" value={profile.avatarUrl} onChange={(event) => update("avatarUrl", event.target.value)} placeholder="https://…" /></label><label className="profile-upload">Upload profile image<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={uploadImage} disabled={uploading} /><span>{uploading ? "Uploading…" : "Choose image"}</span></label></div><label>Short biography<textarea value={profile.bio} onChange={(event) => update("bio", event.target.value)} maxLength={400} rows={5} /></label><footer className="save-bar"><span role="status">{notice}</span><button type="submit" disabled={uploading}>{uploading ? "Uploading…" : "Save profile"}</button></footer></form></section>;
}
