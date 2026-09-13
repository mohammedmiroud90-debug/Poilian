import { BlogHeader } from "@/components/BlogHeader";
import Link from "next/link";

export const metadata = {
  title: "Market | Poilian",
  description: "Explore our marketplace for quality products and services.",
};

export default function MarketPage() {
  return (
    <>
      <BlogHeader />
      <main className="content-page">
        <p className="section-label">MARKETPLACE</p>
        <h1>Market</h1>
        <p className="page-intro">
          Discover quality products, services, and opportunities curated for our community.
        </p>

        <div className="market-coming-soon">
          <div className="coming-soon-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </div>
          <h2>Coming Soon</h2>
          <p>
            We're building something special for you. Our marketplace will feature carefully selected products, 
            services, and opportunities that align with our community values.
          </p>
          <div className="coming-soon-features">
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <div>
                <strong>Quality Products</strong>
                <p>Handpicked items from trusted vendors</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <div>
                <strong>Local Services</strong>
                <p>Connect with skilled professionals</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <div>
                <strong>Community Driven</strong>
                <p>Built for and by our community</p>
              </div>
            </div>
          </div>
          <div className="coming-soon-cta">
            <p>Want to be notified when we launch?</p>
            <Link href="/contact" className="primary-button">
              Get in Touch
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
