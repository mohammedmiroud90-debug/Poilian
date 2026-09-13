import Link from "next/link";

export function ServicesPromotion() {
  return (
    <aside className="services-promotion-sidebar" aria-label="Our Services">
      <div className="services-promo-card">
        <div className="services-promo-header">
          <h3>Work With Us</h3>
          <p>Transform your ideas into reality</p>
        </div>
        
        <div className="services-promo-list">
          <Link href="/services?service=development" className="service-item">
            <div className="service-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
            </div>
            <div className="service-content">
              <strong>Development</strong>
              <span>Web, Mobile & Software Solutions</span>
            </div>
          </Link>
          
          <Link href="/services?service=consultation" className="service-item">
            <div className="service-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <div className="service-content">
              <strong>Consultation</strong>
              <span>Strategic Tech Advisory</span>
            </div>
          </Link>
          
          <Link href="/services?service=design" className="service-item">
            <div className="service-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
            <div className="service-content">
              <strong>UI/UX Design</strong>
              <span>Beautiful User Experiences</span>
            </div>
          </Link>
          
          <Link href="/services?service=cloud" className="service-item">
            <div className="service-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
              </svg>
            </div>
            <div className="service-content">
              <strong>Cloud Solutions</strong>
              <span>Scalable Infrastructure</span>
            </div>
          </Link>
        </div>
        
        <Link href="/contact" className="services-promo-cta">
          Get Started
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </Link>
      </div>
    </aside>
  );
}
