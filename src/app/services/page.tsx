"use client";

import { BlogHeader } from "@/components/BlogHeader";
import Link from "next/link";

// Inline SVG icon components
const SearchIcon = ({ size = 24, ...props }: { size?: number; [key: string]: any }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const FileTextIcon = ({ size = 24, ...props }: { size?: number; [key: string]: any }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const CameraIcon = ({ size = 24, ...props }: { size?: number; [key: string]: any }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

const ArrowRightIcon = ({ size = 24, ...props }: { size?: number; [key: string]: any }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export default function ServicesPage() {
  const services = [
    {
      id: "research",
      title: "Research",
      description: "Focused research, synthesis and clear editorial direction for your next idea.",
      longDescription: "From academic research to market analysis, I help distill complex topics into actionable insights and compelling narratives.",
      icon: SearchIcon,
      color: "#3B82F6",
      features: [
        "Deep literature review & analysis",
        "Competitive landscape mapping",
        "Expert interviews & synthesis",
        "Clear report writing & presentation"
      ],
      slug: "research"
    },
    {
      id: "writing",
      title: "Writing",
      description: "Long-form writing, essays and content shaped with care and a distinctive voice.",
      longDescription: "Whether you need blog posts, whitepapers, or complete content strategies, I deliver thoughtful writing that engages and converts.",
      icon: FileTextIcon,
      color: "#10B981",
      features: [
        "SEO-optimized blog content",
        "Technical writing & documentation",
        "Thought leadership articles",
        "Content strategy & planning"
      ],
      slug: "writing"
    },
    {
      id: "creative",
      title: "Creative Projects",
      description: "Photography and creative collaboration for people and organisations with a story to tell.",
      longDescription: "Bring your brand story to life through visual storytelling, photography, and creative direction that captures authentic moments.",
      icon: CameraIcon,
      color: "#8B5CF6",
      features: [
        "Brand photography & portraits",
        "Event documentation",
        "Creative direction & styling",
        "Visual storytelling"
      ],
      slug: "creative-projects"
    }
  ];

  return (
    <>
      <BlogHeader />
      <main className="content-page">
        <p className="section-label">SERVICES</p>
        <h1>Work together</h1>
        <p className="page-intro">Research, writing and creative collaboration for thoughtful projects.</p>
        
        <div className="services-grid">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <article key={service.id} className="service-card">
                <div className="service-icon">
                  <Icon size={24} />
                </div>
                <div className="service-content">
                  <h2>{service.title}</h2>
                  <p>{service.description}</p>
                  <ul className="service-features">
                    {service.features.slice(0, 2).map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                  <Link href={`/services/${service.slug}`} className="service-cta">
                    Learn more <ArrowRightIcon size={14} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <div className="services-process">
          <p className="section-label">PROCESS</p>
          <h2>How we'll work together</h2>
          <div className="process-steps">
            <div className="process-step">
              <span className="step-number">1</span>
              <h3>Discovery</h3>
              <p>We'll discuss your project goals, timeline, and requirements to ensure we're aligned from the start.</p>
            </div>
            <div className="process-step">
              <span className="step-number">2</span>
              <h3>Proposal</h3>
              <p>I'll provide a detailed scope of work, timeline, and transparent pricing tailored to your needs.</p>
            </div>
            <div className="process-step">
              <span className="step-number">3</span>
              <h3>Execution</h3>
              <p>Regular check-ins and updates throughout the project to ensure we're on track and you're delighted.</p>
            </div>
            <div className="process-step">
              <span className="step-number">4</span>
              <h3>Delivery</h3>
              <p>Final deliverables with revisions included, plus any post-project support you might need.</p>
            </div>
          </div>
        </div>

        <div className="services-cta">
          <h2>Ready to start your project?</h2>
          <p>Let's discuss how we can work together to bring your ideas to life.</p>
          <Link href="/contact" className="primary-button">
            Get in touch
          </Link>
        </div>
      </main>
    </>
  );
}
