import type { Metadata } from "next";
import Link from "next/link";
import { BlogHeader } from "@/components/BlogHeader";
import { getAuthorProfile } from "@/lib/profile";

export const metadata: Metadata = {
  title: "Photography",
  description: "Explore the Bitt-i.com photography collection — visual storytelling and moments from Algeria.",
  openGraph: {
    title: "Photography | Bitt-i.com",
    description: "Explore the Bitt-i.com photography collection — visual storytelling and moments from Algeria.",
    type: "website",
    url: "/photography",
    siteName: "Bitt-i.com",
    images: [{ url: "/Bitti.png", width: 1200, height: 630, alt: "Bitt-i.com" }],
  },
};

const photographyItems = [
  {
    id: 1,
    title: "Desert Landscape",
    description: "Golden hour light across the Sahara dunes.",
    image: "/heroright2.png",
    category: "Landscape",
  },
  {
    id: 2,
    title: "Urban Architecture",
    description: "Geometry and shadow in the modern city.",
    image: "/heroright.png",
    category: "Architecture",
  },
  {
    id: 3,
    title: "Cultural Moments",
    description: "People, tradition and everyday ritual.",
    image: "/heroright2.png",
    category: "Culture",
  },
  {
    id: 4,
    title: "Nature Details",
    description: "Close studies of texture and form.",
    image: "/heroright.png",
    category: "Nature",
  },
  {
    id: 5,
    title: "Street Photography",
    description: "Candid rhythm of daily life.",
    image: "/heroright2.png",
    category: "Street",
  },
  {
    id: 6,
    title: "Sunset Reflections",
    description: "Color, water and the last light of day.",
    image: "/heroright.png",
    category: "Landscape",
  },
];

export default async function PhotographyPage() {
  const profile = await getAuthorProfile();
  const banners = [
    {
      href: "#gallery",
      image: photographyItems[0].image,
      label: "Browse the gallery",
      title: "Frames from Algeria",
      tone: "lead",
    },
    {
      href: "/photographyapply",
      image: profile.promotionImage || photographyItems[1].image,
      label: "Book a session",
      title: "Work with Bitt-i",
      tone: "promo",
    },
    {
      href: "/contact",
      image: photographyItems[2].image,
      label: "Start a brief",
      title: "Editorial & brand stories",
      tone: "story",
    },
  ] as const;

  return (
    <>
      <BlogHeader />
      <main className="photography-page">
        <section className="photo-banner-stack" aria-label="Photography publicity">
          {banners.map((banner) => (
            <a
              key={banner.href}
              className={`photo-publicity-banner photo-publicity-${banner.tone}`}
              href={banner.href}
            >
              <img src={banner.image} alt="" />
              <div className="photo-publicity-copy">
                {banner.tone === "lead" ? <h1>{banner.title}</h1> : <h2>{banner.title}</h2>}
                <span>
                  {banner.label} <b>↗</b>
                </span>
              </div>
            </a>
          ))}
        </section>

        <section className="photography-gallery" id="gallery">
          <div className="personal-shell">
            <header className="photo-gallery-head">
              <h2>Selected work</h2>
              <p>Landscapes, streets and quiet cultural details.</p>
            </header>

            <div className="gallery-grid">
              {photographyItems.map((item) => (
                <article key={item.id} className="gallery-item">
                  <div className="gallery-image-wrapper">
                    <img
                      src={item.image}
                      alt={item.title}
                      width={400}
                      height={300}
                      className="gallery-image"
                      loading="lazy"
                    />
                    <div className="gallery-overlay">
                      <span className="gallery-category">{item.category}</span>
                    </div>
                  </div>
                  <div className="gallery-content">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="photo-cta-banner">
          <div className="personal-shell">
            <h2>Need photography for a project?</h2>
            <p>Portraits, events and editorial assignments — tell me what you need.</p>
            <div className="photo-cta-actions">
              <Link href="/photographyapply" className="hero-post-link">
                Apply for a shoot <span>↗</span>
              </Link>
              <Link href="/contact" className="hero-post-link">
                Contact <span>↗</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
