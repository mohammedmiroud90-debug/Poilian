import { notFound } from "next/navigation";
import { BlogHeader } from "@/components/BlogHeader";
import { getSitePage, getSitePages, stripHtml } from "@/lib/pages";
import { getAuthorProfile } from "@/lib/profile";

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const [page, pages, authorProfile] = await Promise.all([getSitePage(slug), getSitePages(), getAuthorProfile()]);
  if (!page) notFound();
  return <><BlogHeader pages={pages.filter((item) => item.showInNavigation)} /><main className="content-page dynamic-page"><p className="section-label">{page.status === "draft" ? "DRAFT" : "PAGE"}</p><h1>{page.title}</h1>{slug === "founder" && <section className="founder-profile"><img src={authorProfile.avatarUrl} alt={`Portrait of ${authorProfile.name}`} width={104} height={104} /><div><span>Founder</span><strong>{authorProfile.name}</strong></div></section>}{page.excerpt && <p className="page-intro">{page.excerpt}</p>}<article className="rich-page-content">{stripHtml(page.content)}</article></main></>;
}
