import type { Metadata } from "next";
import { BlogHeader } from "@/components/BlogHeader";
import { getSitePage, stripHtml } from "@/lib/pages";

export const metadata: Metadata = {
  title: "Research | Bitt-i.com",
  description: "Explore our ongoing research, notes, and references on topics including technology, business, and innovation. Stay updated with our latest findings.",
  keywords: "research, notes, references, technology, business, innovation, findings, studies",
  alternates: { canonical: "/research" },
  openGraph: {
    type: "website",
    url: "/research",
    siteName: "Bitt-i.com",
    title: "Research | Bitt-i.com",
    description: "Explore our ongoing research, notes, and references on technology, business, and innovation.",
    images: [{ url: "/Bitti.png", width: 466, height: 143, alt: "Bitt-i.com" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Research | Bitt-i.com",
    description: "Explore our ongoing research, notes, and references on technology, business, and innovation.",
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

export default async function ResearchPage() {
  const page = await getSitePage("research");

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
        name: "Research",
        item: `${process.env.NEXT_PUBLIC_SITE_URL || "https://bitt-i.com"}/research`,
      },
    ],
  };

  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><BlogHeader /><main className="content-page"><p className="section-label">ONGOING WORK</p><h1>{page?.title || "Research"}</h1><p className="page-intro">{page?.excerpt || "Notes, references and ongoing work collected in one place."}</p><div className="research-content">{stripHtml(page?.content || "Research entries will be published here as they are ready to share.")}</div></main></>;
}
