import type { Metadata } from "next";
import Link from "next/link";
import { SiteLogo } from "@/components/SiteLogo";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Research, writing and creative collaboration from Bitt-i.com — focused work for thoughtful projects.",
  alternates: { canonical: "/services" },
  openGraph: {
    type: "website",
    url: "/services",
    siteName: "Bitt-i.com",
    title: "Services | Bitt-i.com",
    description:
      "Research, writing and creative collaboration from Bitt-i.com — focused work for thoughtful projects.",
    images: [{ url: "/Bitti.png", width: 466, height: 143, alt: "Bitt-i.com" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Services | Bitt-i.com",
    description:
      "Research, writing and creative collaboration from Bitt-i.com — focused work for thoughtful projects.",
    images: ["/Bitti.png"],
  },
};

const services = [
  {
    id: "research",
    date: "RESEARCH",
    title: "Deep research that turns complexity into direction",
    description:
      "Literature review, competitive mapping and expert synthesis shaped into clear reports you can act on.",
    tag: "Editorial research",
    href: "/contact",
    tone: "blue",
  },
  {
    id: "writing",
    date: "WRITING",
    title: "Long-form writing with a distinctive voice",
    description:
      "Essays, technical posts and thought leadership content designed to engage readers and support SEO.",
    tag: "Content & SEO",
    href: "/contact",
    tone: "teal",
  },
  {
    id: "creative",
    date: "CREATIVE",
    title: "Photography and visual storytelling",
    description:
      "Brand photography, event documentation and creative direction for people and organisations with a story to tell.",
    tag: "Visual projects",
    href: "/photography",
    tone: "amber",
  },
];

export default function ServicesPage() {
  return (
    <main className="standalone-page bitti-board bitti-services">
      <div className="bitti-board-brand">
        <Link href="/en" className="bitti-brand-mark" aria-label="Bitt-i.com home">
          <SiteLogo alt="Bitt-i.com" width={168} height={44} />
        </Link>
        <nav aria-label="Standalone links">
          <Link href="/market">Marketplace</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>

      <section className="bitti-feature-hero">
        <div className="bitti-feature-hero-copy">
          <h1>
            (re)introducing <span>Bitt-i Services</span>
          </h1>
          <p>
            Turn a dry project brief into an engaging collaboration — research, writing and creative work with a
            clear narrative.
          </p>
        </div>
        <div className="bitti-feature-hero-visual" aria-hidden="true">
          <div className="bitti-mock-stack">
            <div className="bitti-mock-card bitti-mock-back" />
            <div className="bitti-mock-card bitti-mock-mid" />
            <div className="bitti-mock-profile">
              <div className="bitti-mock-profile-top">
                <span className="bitti-avatar" />
                <div>
                  <strong>Bitt-i.com</strong>
                  <small>Services & creative studio</small>
                </div>
              </div>
              <p>Focused research, writing and photography for thoughtful projects across Algeria and beyond.</p>
              <div className="bitti-mock-stats">
                <div>
                  <b>10+</b>
                  <span>Years building</span>
                </div>
                <div>
                  <b>50+</b>
                  <span>Projects delivered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bitti-featured-note">
        <p className="bitti-featured-label">
          <span aria-hidden="true">★</span> FEATURED
        </p>
        <h2>(Re)introducing collaborative services</h2>
        <p>
          Bitt-i.com brings research, writing and creative projects into one clean workspace — so briefs stay
          clear, timelines stay honest, and the finished work still feels human.
        </p>
      </section>

      <section className="bitti-dark-grid" aria-label="Service offerings">
        {services.map((service) => (
          <article key={service.id} className={`bitti-dark-card bitti-card-${service.tone}`}>
            <p className="bitti-dark-date">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              {service.date}
            </p>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
            <div className="bitti-dark-meta">
              <span className="bitti-pill">{service.tag}</span>
              <Link href={service.href}>Learn more →</Link>
            </div>
          </article>
        ))}
      </section>

      <section className="bitti-board-cta">
        <div>
          <h2>Ready to start a project?</h2>
          <p>Tell me what you need — research, writing, photography or a mix of all three.</p>
        </div>
        <Link href="/contact" className="bitti-cta-button">
          Get in touch
        </Link>
      </section>
    </main>
  );
}
