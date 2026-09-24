import type { Metadata } from "next";
import { HomeHero } from "@/components/HomeHero";
import { HomePostList } from "@/components/HomePostList";
import { HomeFooter } from "@/components/HomeFooter";
import { StayConnected } from "@/components/StayConnected";
import { MarketplaceSection } from "@/components/MarketplaceSection";
import { getPosts } from "@/lib/parse";
import { getAuthorProfile } from "@/lib/profile";
import { absoluteUrl, DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} | Stories, Services & Marketplace` },
  description: "Discover thoughtful stories, in-depth research, professional services, and marketplace experiences at Bitt-i.com. Your destination for quality content and creative collaboration.",
  keywords: "blog, research, services, marketplace, stories, writing, photography, creative collaboration, Bitt-i",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Stories, Services & Marketplace`,
    description: "Discover thoughtful stories, in-depth research, professional services, and marketplace experiences at Bitt-i.com. Your destination for quality content and creative collaboration.",
    images: [DEFAULT_OG_IMAGE],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Stories, Services & Marketplace`,
    description: "Discover thoughtful stories, in-depth research, professional services, and marketplace experiences at Bitt-i.com.",
    images: [DEFAULT_OG_IMAGE.url],
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

export default async function PersonalBlogHome() {
  const [posts, authorProfile] = await Promise.all([getPosts(), getAuthorProfile()]);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: "Discover thoughtful stories, in-depth research, professional services, and marketplace experiences at Bitt-i.com.",
        publisher: { "@id": `${SITE_URL}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/posts?query={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}${DEFAULT_OG_IMAGE.url}`,
          width: DEFAULT_OG_IMAGE.width,
          height: DEFAULT_OG_IMAGE.height,
        },
        description: "Stories, research, services and marketplace experiences from Bitt-i.com.",
        sameAs: authorProfile.linkedinUrl ? [authorProfile.linkedinUrl] : undefined,
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: authorProfile.name,
        url: absoluteUrl("/pages/founder"),
        image: authorProfile.avatarUrl,
        description: authorProfile.bio,
        sameAs: authorProfile.linkedinUrl ? [authorProfile.linkedinUrl] : undefined,
        worksFor: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
        ],
      },
    ],
  };

  return (
    <main className="personal-home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HomeHero authorAvatarUrl={authorProfile.avatarUrl} />
      <HomePostList posts={posts} authorName={authorProfile.name} />
      <StayConnected />
      <HomeFooter />
    </main>
  );
}
