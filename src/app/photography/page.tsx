import type { Metadata } from "next";
import Link from "next/link";
import { readdir } from "fs/promises";
import path from "path";
import { PhotographyFooter, PhotographyHeader } from "@/components/PhotographyChrome";
import { PhotographyFrames, type FrameImage } from "@/components/PhotographyFrames";

export const metadata: Metadata = {
  title: "Photography | Bitt-i.com",
  description: "Trips, frames and career moments — a black-and-white photography journal by Belhachemia Mohammed. Travel documentation, professional milestones, and visual storytelling.",
  keywords: "photography, black and white, travel, career, documentation, visual storytelling, Belhachemia Mohammed",
  alternates: { canonical: "/photography" },
  openGraph: {
    title: "Photography | Bitt-i.com",
    description: "Trips, frames and career moments — a black-and-white photography journal by Belhachemia Mohammed.",
    type: "website",
    url: "/photography",
    siteName: "Bitt-i.com",
    images: [{ url: "/Bitti.png", width: 466, height: 143, alt: "Bitt-i.com" }],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Photography | Bitt-i.com",
    description: "Trips, frames and career moments — a black-and-white photography journal by Belhachemia Mohammed.",
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

const imageExt = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

/** Rich captions keyed by filename when known; otherwise cycle by index. */
const frameMeta: Record<string, Omit<FrameImage, "src" | "file">> = {
  "1000045960.jpg": {
    category: "travel",
    title: "Road light, long horizon",
    body: "A travel still from the road — quiet asphalt, open sky, and the pause between destinations. Monochrome keeps the distance and the light in the foreground.",
    points: [
      "Captured in transit between places",
      "Emphasis on horizon and road geometry",
      "Part of the personal travel archive",
    ],
  },
  "1000045961.jpg": {
    category: "recognition",
    title: "Ceremony and recognition",
    body: "A career milestone in formal light: people gathered, a shared stage, and the moment achievement was acknowledged with certificate and award.",
    points: [
      "Academic and innovation recognition event",
      "Official certificate and award ceremony",
      "A marker on the professional timeline",
    ],
  },
  "1000045962.jpg": {
    category: "career",
    title: "Work in the field",
    body: "Professional life beyond the desk — a frame from projects and gatherings where ideas, people and place meet. Kept in black and white to stress gesture and setting.",
    points: [
      "Field and project context",
      "People and process in one frame",
      "Documentation of practice over time",
    ],
  },
};

const fallbackMeta: Omit<FrameImage, "src" | "file">[] = [
  {
    category: "travel",
    title: "Road light, long horizon",
    body: "A frame from travel — quiet roads, open sky, and the pause between destinations.",
    points: ["Travel archive", "Monochrome landscape", "Journey documentation"],
  },
  {
    category: "recognition",
    title: "Ceremony and recognition",
    body: "A career milestone captured in place: formal light, gathered people, and a moment that mattered.",
    points: ["Recognition event", "Certificate ceremony", "Professional milestone"],
  },
  {
    category: "career",
    title: "Work in the field",
    body: "Across projects and trips, these stills keep a record of places, people, and progress.",
    points: ["Professional practice", "Project contexts", "Visual career record"],
  },
];

async function loadPhotographyImages(): Promise<FrameImage[]> {
  const dir = path.join(process.cwd(), "public", "PHOTOGRAPHY");
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && imageExt.has(path.extname(entry.name).toLowerCase()))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((name, index) => {
        const meta = frameMeta[name] || fallbackMeta[index % fallbackMeta.length];
        return {
          src: `/PHOTOGRAPHY/${encodeURIComponent(name)}`,
          file: name,
          ...meta,
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
        name: "Photography",
        item: `${process.env.NEXT_PUBLIC_SITE_URL || "https://bitt-i.com"}/photography`,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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

        <PhotographyFrames images={images} />

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
    </>
  );
}
