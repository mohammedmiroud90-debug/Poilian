import type { Metadata } from "next";
import { HomeHero } from "@/components/HomeHero";
import { HomePostList } from "@/components/HomePostList";
import { HomeFooter } from "@/components/HomeFooter";
import { getPosts } from "@/lib/parse";
import { getAuthorProfile } from "@/lib/profile";
import { absoluteUrl, DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} | Stories, Services & Marketplace` },
  description: "Stories, research, services and marketplace experiences from Bitt-i.com.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Stories, Services & Marketplace`,
    description: "Stories, research, services and marketplace experiences from Bitt-i.com.",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Stories, Services & Marketplace`,
    description: "Stories, research, services and marketplace experiences from Bitt-i.com.",
    images: [DEFAULT_OG_IMAGE.url],
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
        description: "Stories, research, services and marketplace experiences from Bitt-i.com.",
        publisher: { "@id": `${SITE_URL}/#person` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/posts?query={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: authorProfile.name,
        url: absoluteUrl("/pages/founder"),
        image: authorProfile.avatarUrl,
        description: authorProfile.bio,
        sameAs: authorProfile.linkedinUrl ? [authorProfile.linkedinUrl] : undefined,
      },
    ],
  };

  return (
    <main className="personal-home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HomeHero authorAvatarUrl={authorProfile.avatarUrl} />
      <HomePostList posts={posts} authorName={authorProfile.name} />
      <HomeFooter />
    </main>
  );
}
