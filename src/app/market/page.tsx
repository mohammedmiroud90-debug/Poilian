import type { Metadata } from "next";
import Link from "next/link";
import { SiteLogo } from "@/components/SiteLogo";

export const metadata: Metadata = {
  title: "Marketplace | Bitt-i.com",
  description: "Discover curated products, local services and community opportunities on the Bitt-i.com marketplace. Quality goods, skilled professionals, and meaningful connections.",
  keywords: "marketplace, products, services, local talent, community, curated, quality goods, professionals",
  alternates: { canonical: "/market" },
  openGraph: {
    type: "website",
    url: "/market",
    siteName: "Bitt-i.com",
    title: "Marketplace | Bitt-i.com",
    description: "Discover curated products, local services and community opportunities on the Bitt-i.com marketplace.",
    images: [{ url: "/Bitti.png", width: 466, height: 143, alt: "Bitt-i.com" }],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Marketplace | Bitt-i.com",
    description: "Discover curated products, local services and community opportunities on the Bitt-i.com marketplace.",
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

const listings = [
  {
    id: "products",
    date: "PRODUCTS",
    title: "Handpicked goods from trusted makers",
    description:
      "A shortlist of quality products chosen for craft, usefulness and community values — launching soon on Bitt-i.com.",
    tag: "Coming soon",
  },
  {
    id: "services",
    date: "SERVICES",
    title: "Local talent you can hire with confidence",
    description:
      "Connect with skilled professionals for research, writing, design and creative work through a curated marketplace.",
    tag: "Professionals",
  },
  {
    id: "community",
    date: "COMMUNITY",
    title: "Opportunities shaped with the community",
    description:
      "Listings, collaborations and launches built for people who care about thoughtful work — not noise.",
    tag: "Opportunities",
  },
];

export default function MarketPage() {
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
        name: "Marketplace",
        item: `${process.env.NEXT_PUBLIC_SITE_URL || "https://bitt-i.com"}/market`,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="standalone-page bitti-board">
      <div className="bitti-board-brand">
        <Link href="/en" className="bitti-brand-mark" aria-label="Bitt-i.com home">
          <SiteLogo alt="Bitt-i.com" width={168} height={44} />
        </Link>
        <nav aria-label="Standalone links">
          <Link href="/services">Services</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>

      <section className="bitti-feature-hero">
        <div className="bitti-feature-hero-copy">
          <h1>
            (re)introducing <span>Bitt-i Marketplace</span>
          </h1>
          <p>
            A cleaner place to discover products, services and opportunities — curated for quality, not clutter.
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
                  <strong>Marketplace</strong>
                  <small>Curated by Bitt-i.com</small>
                </div>
              </div>
              <p>Quality products, local services and community-driven opportunities in one calm storefront.</p>
              <div className="bitti-mock-stats">
                <div>
                  <b>3</b>
                  <span>Launch categories</span>
                </div>
                <div>
                  <b>Soon</b>
                  <span>Public listings</span>
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
        <h2>A marketplace built for thoughtful work</h2>
        <p>
          Bitt-i.com Marketplace is being shaped as a selective space — fewer listings, clearer stories, and
          vendors you can trust. Join the waitlist through contact while we prepare the first wave.
        </p>
      </section>

      <section className="bitti-dark-grid" aria-label="Marketplace categories">
        {listings.map((item) => (
          <article key={item.id} className="bitti-dark-card">
            <p className="bitti-dark-date">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              {item.date}
            </p>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <div className="bitti-dark-meta">
              <span className="bitti-pill">{item.tag}</span>
              <Link href="/contact">Notify me →</Link>
            </div>
          </article>
        ))}
      </section>

      <section className="bitti-board-cta">
        <div>
          <h2>Want early access?</h2>
          <p>Tell us whether you are a buyer, maker or service provider — we will keep you posted.</p>
        </div>
        <Link href="/contact" className="bitti-cta-button">
          Get in touch
        </Link>
      </section>
    </main>
    </>
  );
}
