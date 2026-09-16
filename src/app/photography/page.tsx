import type { Metadata } from "next";
import Link from "next/link";
import { readdir } from "fs/promises";
import path from "path";
import { PhotographyFooter, PhotographyHeader } from "@/components/PhotographyChrome";

export const metadata: Metadata = {
  title: "Photography",
  description:
    "Trips, frames and career moments — a black-and-white photography journal by Belhachemia Mohammed.",
  alternates: { canonical: "/photography" },
  openGraph: {
    title: "Photography | Bitt-i.com",
    description:
      "Trips, frames and career moments — a black-and-white photography journal by Belhachemia Mohammed.",
    type: "website",
    url: "/photography",
    siteName: "Bitt-i.com",
    images: [{ url: "/Bitti.png", width: 466, height: 143, alt: "Bitt-i.com" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Photography | Bitt-i.com",
    description:
      "Trips, frames and career moments — a black-and-white photography journal by Belhachemia Mohammed.",
    images: ["/Bitti.png"],
  },
};

const imageExt = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

const captionFallback = [
  {
    title: "Road light, long horizon",
    body: "A frame from travel — quiet roads, open sky, and the pause between destinations.",
  },
  {
    title: "Ceremony and recognition",
    body: "A career milestone captured in place: formal light, gathered people, and a moment that mattered.",
  },
  {
    title: "Work in the field",
    body: "Across projects and trips, these stills keep a record of places, people, and progress.",
  },
];

async function loadPhotographyImages() {
  const dir = path.join(process.cwd(), "public", "PHOTOGRAPHY");
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && imageExt.has(path.extname(entry.name).toLowerCase()))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((name, index) => {
        const caption = captionFallback[index % captionFallback.length];
        return {
          src: `/PHOTOGRAPHY/${encodeURIComponent(name)}`,
          title: caption.title,
          body: caption.body,
          file: name,
        };
      });
  } catch {
    return [];
  }
}

function CertificateIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <rect x="6" y="5" width="20" height="16" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 10h12M10 14h8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M13 21.5 16 24l3-2.5v4.2l-3 1.8-3-1.8v-4.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AwardIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="12" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12.2 17.2 10 27l6-3.2L22 27l-2.2-9.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M13.5 12h5M16 9.5v5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function TimelineIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M8 7v18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="8" cy="10" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="16" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="22" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 10h12M12 16h9M12 22h11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default async function PhotographyPage() {
  const images = await loadPhotographyImages();

  return (
    <div className="standalone-page photo-journey">
      <PhotographyHeader />
      <main>
        <header className="photo-journey-hero">
          <div className="photo-chrome-shell photo-journey-hero-grid">
            <h1>
              Photography across
              <br />
              trips &amp; career.
            </h1>
            <div className="photo-journey-hero-points">
              <article>
                <h2>Trips &amp; places</h2>
                <p>
                  A visual record of roads, cities and quiet horizons — frames kept in black and white so light and
                  form stay in focus across every journey.
                </p>
              </article>
              <article>
                <h2>Career moments</h2>
                <p>
                  Ceremonies, projects and recognition along the way: rooms where work happened, people who gathered,
                  and milestones that marked progress in study and innovation.
                </p>
              </article>
            </div>
          </div>
        </header>

        <section className="photo-journey-gallery" id="gallery" aria-labelledby="gallery-title">
          <div className="photo-journey-section-head">
            <h2 id="gallery-title">Trips &amp; career frames</h2>
            <p>Selected stills from travel and professional life, presented in monochrome.</p>
          </div>
          {images.length > 0 ? (
            <ul className="photo-journey-grid">
              {images.map((image, index) => (
                <li key={image.file}>
                  <figure>
                    <div className="photo-journey-frame">
                      <img src={image.src} alt={image.title} loading={index < 2 ? "eager" : "lazy"} />
                    </div>
                    <figcaption>
                      <span className="photo-journey-index">{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <strong>{image.title}</strong>
                        <p>{image.body}</p>
                      </div>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          ) : (
            <p className="photo-journey-empty">No images found in the photography archive yet.</p>
          )}
        </section>

        <section className="photo-journey-milestone" id="milestone" aria-labelledby="milestone-title">
          <div className="photo-journey-section-head">
            <h2 id="milestone-title">Milestone &amp; Achievement</h2>
            <p>
              Recognition Award for Academic and Innovation Achievement — an important step in an academic and
              professional journey committed to innovation, technology, entrepreneurship and continuous development.
            </p>
          </div>

          <div className="photo-journey-prose">
            <p>
              A significant milestone marking recognition for outstanding participation and achievement in an academic
              and innovation-focused event. I was honored with an official certificate of recognition and an award
              during a formal ceremony, celebrating contribution, dedication, and involvement in developing and
              presenting innovative work.
            </p>
            <p>
              The achievement represents an important step in my academic and professional journey, reflecting a
              commitment to innovation, technology, entrepreneurship, and continuous development.
            </p>
          </div>

          <ol className="photo-journey-rows">
            <li>
              <span className="photo-journey-badge" aria-hidden="true">
                1
              </span>
              <div className="photo-journey-row-copy">
                <strong>Achievement Label: Awarded &amp; Recognized for Innovation Achievement</strong>
                <p>
                  Official certificate and award for outstanding participation and contribution to an academic
                  innovation event.
                </p>
              </div>
              <span className="photo-journey-row-icon" aria-hidden="true">
                <CertificateIcon />
              </span>
            </li>
            <li>
              <span className="photo-journey-badge" aria-hidden="true">
                2
              </span>
              <div className="photo-journey-row-copy">
                <strong>Innovation Achievement Award</strong>
                <p>
                  Recognized with an official certificate and award for outstanding participation and contribution to
                  an academic innovation event.
                </p>
              </div>
              <span className="photo-journey-row-icon" aria-hidden="true">
                <AwardIcon />
              </span>
            </li>
            <li>
              <span className="photo-journey-badge" aria-hidden="true">
                3
              </span>
              <div className="photo-journey-row-copy">
                <strong>Short version for a profile / timeline</strong>
                <p>
                  Innovation Achievement Award — Recognized with an official certificate and award for outstanding
                  participation and contribution to an academic innovation event.
                </p>
              </div>
              <span className="photo-journey-row-icon" aria-hidden="true">
                <TimelineIcon />
              </span>
            </li>
          </ol>
        </section>

        <section className="photo-journey-cta">
          <p>Looking for a collaboration, portrait session, or editorial frame?</p>
          <div className="photo-journey-cta-actions">
            <Link href="/photographyapply">Book a shoot</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </section>
      </main>
      <PhotographyFooter />
    </div>
  );
}
