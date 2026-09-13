import type { Metadata } from "next";
import { BlogFooter } from "@/components/BlogFooter";
import { BlogHeader } from "@/components/BlogHeader";

export const metadata: Metadata = {
  title: "Photography application | Poilian",
  description: "Explore the gallery and send a photography project request.",
};

const gallery = [
  { title: "Desert light", type: "Landscape", image: "/heroright2.png" },
  { title: "Quiet details", type: "Editorial", image: "/heroright2.png" },
  { title: "City stories", type: "Street", image: "/heroright2.png" },
];

const projectTypes = [
  { number: "01", title: "Portraits", text: "Personal, editorial, or team portraits with a natural point of view." },
  { number: "02", title: "Events", text: "Thoughtful coverage for launches, gatherings, and meaningful moments." },
  { number: "03", title: "Brand stories", text: "A visual library built around the people and details behind your work." },
];

export default function PhotographyApplyPage() {
  return (
    <main className="photography-apply-page">
      <BlogHeader />
      <section className="apply-hero">
        <div className="apply-hero-copy">
          <p className="section-label">PHOTOGRAPHY / PROJECTS</p>
          <h1>Make room for the moments worth keeping.</h1>
          <p>Photography with a calm, documentary feel — made for people, places, and ideas with a story.</p>
          <a className="apply-primary-link" href="#request">Start a project <span aria-hidden="true">↗</span></a>
        </div>
        <div className="apply-hero-note"><span>AVAILABLE FOR SELECT PROJECTS</span><strong>Algeria · Remote</strong></div>
      </section>

      <section className="apply-gallery" aria-labelledby="gallery-title">
        <div className="apply-section-heading"><div><p className="section-label">A SMALL SELECTION</p><h2 id="gallery-title">From my gallery</h2></div><p>Light, texture, and honest frames from recent visual stories.</p></div>
        <div className="apply-gallery-grid">
          {gallery.map((item, index) => <figure className={`apply-gallery-card gallery-card-${index + 1}`} key={item.title}><img src={item.image} alt={item.title} /><figcaption><span>{item.type}</span><strong>{item.title}</strong></figcaption></figure>)}
        </div>
      </section>

      <section className="apply-types" aria-labelledby="types-title">
        <div className="apply-section-heading"><div><p className="section-label">WAYS TO WORK TOGETHER</p><h2 id="types-title">Choose your frame</h2></div></div>
        <div className="apply-type-grid">{projectTypes.map((type) => <article key={type.number}><span>{type.number}</span><h3>{type.title}</h3><p>{type.text}</p><a href="#request" aria-label={`Request ${type.title} photography`}>Request this <span aria-hidden="true">↗</span></a></article>)}</div>
      </section>

      <section className="apply-request" id="request" aria-labelledby="request-title">
        <div><p className="section-label">LET&apos;S TALK</p><h2 id="request-title">Tell me about your idea.</h2><p>Share a few details and I&apos;ll come back with next steps, availability, and a clear proposal.</p></div>
        <form className="apply-form">
          <label>Name<input type="text" name="name" placeholder="Your name" required /></label>
          <label>Email<input type="email" name="email" placeholder="you@example.com" required /></label>
          <label>Project type<select name="project"><option>Portraits</option><option>Events</option><option>Brand stories</option><option>Something else</option></select></label>
          <label>Tell me a little more<textarea name="message" rows={4} placeholder="What are you imagining?" required /></label>
          <button type="submit">Send request <span aria-hidden="true">→</span></button>
        </form>
      </section>
      <BlogFooter />
    </main>
  );
}
