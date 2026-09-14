import type { Metadata } from "next";
import { BlogHeader } from "@/components/BlogHeader";
import { getSitePage, stripHtml } from "@/lib/pages";

export const metadata: Metadata = {
  title: "Research",
  description: "Notes, references and ongoing research collected on Bitt-i.com.",
  alternates: { canonical: "/research" },
};

export default async function ResearchPage() {
  const page = await getSitePage("research");
  return <><BlogHeader /><main className="content-page"><p className="section-label">ONGOING WORK</p><h1>{page?.title || "Research"}</h1><p className="page-intro">{page?.excerpt || "Notes, references and ongoing work collected in one place."}</p><div className="research-content">{stripHtml(page?.content || "Research entries will be published here as they are ready to share.")}</div></main></>;
}
