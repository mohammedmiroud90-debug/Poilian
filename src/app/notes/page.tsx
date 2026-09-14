import type { Metadata } from "next";
import Link from "next/link";
import { BlogHeader } from "@/components/BlogHeader";
import { getNotes } from "@/lib/notes";

export const metadata: Metadata = {
  title: "Personal notes",
  description: "Short observations, working notes and ideas from Bitt-i.com.",
  alternates: { canonical: "/notes" },
};

export default async function NotesPage() {
  const notes = await getNotes();
  return (
    <>
      <BlogHeader />
      <main className="content-page notes-page">
        <p className="section-label">PERSONAL NOTES</p>
        <h1>Notes</h1>
        <p className="page-intro">Short observations, unfinished ideas and things worth remembering.</p>
        {notes.length > 0 ? (
          <div className="notes-list">{notes.map((note, index) => <article key={note.id}><span className="note-number">{String(index + 1).padStart(2, "0")}</span><div><h2>{note.title}</h2><p>{note.excerpt || note.content.slice(0, 180)}</p>{note.updatedAt && <time dateTime={note.updatedAt}>{new Date(note.updatedAt).toLocaleDateString()}</time>}</div></article>)}</div>
        ) : (
          <section className="notes-empty"><span aria-hidden="true">✦</span><h2>No notes published yet</h2><p>New thoughts will appear here soon.</p></section>
        )}
        <Link className="back-link" href="/en">← Back home</Link>
      </main>
    </>
  );
}
