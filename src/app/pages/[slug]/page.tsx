import { notFound } from "next/navigation";
import Link from "next/link";
import { BlogHeader } from "@/components/BlogHeader";
import { getSitePage, getSitePages } from "@/lib/pages";
import { getAuthorProfile } from "@/lib/profile";

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; 
  const [page, pages, authorProfile] = await Promise.all([
    getSitePage(slug), 
    getSitePages(), 
    getAuthorProfile()
  ]);
  
  if (!page) notFound();
  const isFounder = slug === "founder";
  
  const pageContent = (
    <div className="founder-content-column">
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
        dangerouslySetInnerHTML={{ __html: page.content }}
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
