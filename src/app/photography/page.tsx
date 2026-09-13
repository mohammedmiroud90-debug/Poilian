import type { Metadata } from "next";
import { BlogFooter } from "@/components/BlogFooter";
import { BlogHeader } from "@/components/BlogHeader";

export const metadata: Metadata = {
  title: "Photography | Poilian",
  description: "Explore my photography collection - visual storytelling and moments from Algeria.",
  openGraph: {
    title: "Photography | Poilian",
    description: "Explore my photography collection - visual storytelling and moments from Algeria.",
    type: "website",
    url: "https://poilian.com/photography",
    images: [{ url: "/Bitti.png", width: 1200, height: 630, alt: "Poilian" }],
  },
};

const photographyItems = [
  {
    id: 1,
    title: "Desert Landscape",
    description: "Golden hour in the Sahara",
    image: "/heroright2.png",
    category: "Landscape",
  },
  {
    id: 2,
    title: "Urban Architecture",
    description: "Modern city exploration",
    image: "/heroright2.png",
    category: "Architecture",
  },
  {
    id: 3,
    title: "Cultural Moments",
    description: "People and traditions",
    image: "/heroright2.png",
    category: "Culture",
  },
  {
    id: 4,
    title: "Nature Details",
    description: "Macro photography exploration",
    image: "/heroright2.png",
    category: "Nature",
  },
  {
    id: 5,
    title: "Street Photography",
    description: "Candid moments in daily life",
    image: "/heroright2.png",
    category: "Street",
  },
  {
    id: 6,
    title: "Sunset Reflections",
    description: "Colors of the sky",
    image: "/heroright2.png",
    category: "Landscape",
  },
];

export default function PhotographyPage() {
  return (
    <main className="photography-page">
      <BlogHeader />
      <section className="photography-hero">
        <div className="photography-hero-content">
          <h1>Photography</h1>
          <p>Visual storytelling and moments worth remembering</p>
        </div>
      </section>

      <section className="photography-gallery">
        <div className="personal-shell">
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
                  />
                  <div className="gallery-overlay">
                    <span className="gallery-category">{item.category}</span>
                  </div>
                </div>
                <div className="gallery-content">
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <BlogFooter />
    </main>
  );
}
