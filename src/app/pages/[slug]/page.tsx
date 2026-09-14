import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { BlogHeader } from "@/components/BlogHeader";
import { getSitePage, getSitePages, sanitizePageHtml, stripHtml } from "@/lib/pages";
import { getAuthorProfile } from "@/lib/profile";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getSitePage(slug);
  if (!page) return { title: "Page not found", robots: { index: false, follow: false } };
  const description = page.excerpt || stripHtml(page.content).slice(0, 160) || `${page.title} on ${SITE_NAME}.`;
  return {
    title: page.title,
    description,
    alternates: { canonical: `/pages/${page.slug}` },
    openGraph: {
      type: "website",
      url: `/pages/${page.slug}`,
      siteName: SITE_NAME,
      title: page.title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  };
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [page, pages, authorProfile] = await Promise.all([
    getSitePage(slug),
    getSitePages(),
    getAuthorProfile(),
  ]);

  if (!page) notFound();
  const isFounder = slug === "founder";
  const description = page.excerpt || stripHtml(page.content).slice(0, 160);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": isFounder ? "Person" : "WebPage",
    name: isFounder ? authorProfile.name : page.title,
    description,
    url: `${SITE_URL}/pages/${page.slug}`,
    ...(isFounder
      ? {
          image: authorProfile.avatarUrl,
          sameAs: authorProfile.linkedinUrl ? [authorProfile.linkedinUrl] : undefined,
        }
      : { isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL } }),
  };

  const pageContent = (
    <div className="founder-content-column">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="section-label">{page.status === "draft" ? "DRAFT" : "PAGE"}</p>
      <h1>{page.title}</h1>
      {isFounder && (
        <section className="founder-profile">
          <img
            src={authorProfile.avatarUrl}
            alt={`Portrait of ${authorProfile.name}`}
            width={104}
            height={104}
          />
          <div>
            <span>Founder</span>
            <strong>{authorProfile.name}</strong>
          </div>
        </section>
      )}
      {page.excerpt && <p className="page-intro">{page.excerpt}</p>}
      <article
        className="rich-page-content"
        dangerouslySetInnerHTML={{ __html: sanitizePageHtml(page.content) }}
      />
      {isFounder && (
        <nav className="founder-quick-links" aria-label="Founder links">
          <a href={authorProfile.linkedinUrl} target="_blank" rel="noreferrer">
            Check CV <span>↗</span>
          </a>
          <Link href="/contact?topic=careers">
            Careers <span>↗</span>
          </Link>
          <Link href="/services">
            Order services <span>↗</span>
          </Link>
        </nav>
      )}
    </div>
  );

  return (
    <>
      <BlogHeader pages={pages.filter((item) => item.showInNavigation)} />
      <main className={`content-page dynamic-page${isFounder ? " founder-page" : ""}`}>
        {isFounder ? (
          <div className="founder-page-layout">
            {pageContent}
            <aside className="founder-promotion-sidebar" aria-label="Work with Poilian">
              <a className="toc-promotion" href="/contact">
                <img src={authorProfile.promotionImage} alt="Work with Poilian" />
                <span>Work with Poilian <b>↗</b></span>
              </a>
            </aside>
          </div>
        ) : (
          pageContent
        )}
      </main>
    </>
  );
}
