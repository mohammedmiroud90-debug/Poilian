import Link from "next/link";
import { BlogHeader } from "@/components/BlogHeader";

type LegalSection = { heading: string; body: string };

export function LegalPage({ label, title, intro, sections }: { label: string; title: string; intro: string; sections: LegalSection[] }) {
  return <><BlogHeader /><main className="content-page legal-page"><p className="section-label">{label}</p><h1>{title}</h1><p className="page-intro">{intro}</p>{sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2><p>{section.body}</p></section>)}<p>Questions about these policies? <Link href="/contact">Contact us</Link>.</p></main></>;
}
