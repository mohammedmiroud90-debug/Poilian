import type { Metadata } from "next";
import Link from "next/link";
import { BlogHeader } from "@/components/BlogHeader";
import { getNotes } from "@/lib/notes";

export const metadata: Metadata = {
  title: "Personal Notes | Bitt-i.com",
  description: "Short observations, working notes and ideas from Bitt-i.com. Quick thoughts, unfinished ideas, and things worth remembering.",
  keywords: "notes, observations, ideas, thoughts, personal journal, quick insights",
  alternates: { canonical: "/notes" },
  openGraph: {
    type: "website",
    url: "/notes",
    siteName: "Bitt-i.com",
    title: "Personal Notes | Bitt-i.com",
    description: "Short observations, working notes and ideas from Bitt-i.com. Quick thoughts and insights worth remembering.",
    images: [{ url: "/Bitti.png", width: 466, height: 143, alt: "Bitt-i.com" }],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Personal Notes | Bitt-i.com",
    description: "Short observations, working notes and ideas from Bitt-i.com. Quick thoughts and insights worth remembering.",
    images: ["/Bitti.png"],
    site: "@bitticom",
    creator: "@bitticom",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function NotesPage() {
  const notes = await getNotes();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${process.env.NEXT_PUBLIC_SITE_URL || "https://bitt-i.com"}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Notes",
        item: `${process.env.NEXT_PUBLIC_SITE_URL || "https://bitt-i.com"}/notes`,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogHeader />
      <main className="content-page notes-page">
        <p className="section-label">PERSONAL NOTES</p>
        <h1>Notes</h1>
        <p className="page-intro">Short observations, unfinished ideas and things worth remembering.</p>
        {notes.length > 0 ? (
          <div className="notes-list">
            {notes.map((note, index) => (
              <article key={note.id}>
                <span className="note-number">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h2>{note.title}</h2>
                  <p>{note.excerpt || note.content.slice(0, 180)}</p>
                  {note.updatedAt && (
                    <time dateTime={note.updatedAt}>
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </time>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <section className="notes-empty">
            <span aria-hidden="true">✦</span>
            <h2>No notes published yet</h2>
            <p>New thoughts will appear here soon.</p>
          </section>
        )}
        <Link className="back-link" href="/en">← Back home</Link>
      </main>
    </>
  );
}
