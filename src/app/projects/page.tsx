import type { Metadata } from "next";
import Link from "next/link";
import { BlogHeader } from "@/components/BlogHeader";
import { getProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects & Companies | Bitt-i.com",
  description: "Explore our portfolio of innovative projects, companies, and creative ventures. Discover the work we're building and contributing to at Bitt-i.com.",
  keywords: "projects, companies, portfolio, startups, innovation, creative ventures, technology",
  alternates: { canonical: "/projects" },
  openGraph: {
    type: "website",
    url: "/projects",
    siteName: "Bitt-i.com",
    title: "Projects & Companies | Bitt-i.com",
    description: "Explore our portfolio of innovative projects, companies, and creative ventures.",
    images: [{ url: "/Bitti.png", width: 466, height: 143, alt: "Bitt-i.com" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects & Companies | Bitt-i.com",
    description: "Explore our portfolio of innovative projects, companies, and creative ventures.",
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

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getProjects();
  const logos = projects.filter((project) => project.imageUrl);

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
        name: "Projects",
        item: `${process.env.NEXT_PUBLIC_SITE_URL || "https://bitt-i.com"}/projects`,
      },
    ],
  };

  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><BlogHeader /><main className="content-page projects-page"><p className="section-label">SELECTED WORK</p><header className="projects-heading"><div><h1>Projects &amp; Companies</h1><p className="page-intro">A collection of the projects, ideas and companies I&apos;m building and contributing to.</p></div>{logos.length > 0 && <aside className="projects-logo-group" aria-label="Project and company logos">{logos.map((project) => <img src={project.imageUrl} alt={`${project.title} logo - ${project.company || 'Project'} brand identity`} key={project.id} width={120} height={120} />)}</aside>}</header><div className="project-showcase">{projects.map((project) => <article key={project.id}><div className="project-copy"><p>{project.company || "PROJECT"}</p><h2>{project.title}</h2><span>{project.summary}</span>{project.url && <a href={project.url} target="_blank" rel="noreferrer">View project <b>↗</b></a>}</div>{project.imageUrl ? <img src={project.imageUrl} alt={`${project.title} - ${project.company || 'Project'} screenshot and visual showcase`} width={600} height={400} /> : <div className="project-mark" aria-hidden="true">{project.title.slice(0, 1)}</div>}</article>)}</div><Link className="back-link" href="/en">← Back home</Link></main></>;
}
