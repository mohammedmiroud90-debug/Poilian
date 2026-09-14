import type { Metadata } from "next";
import Link from "next/link";
import { BlogHeader } from "@/components/BlogHeader";

export const metadata: Metadata = {
  title: "Legal information",
  description: "Legal policies that govern use of Bitt-i.com and its content.",
  alternates: { canonical: "/legal" },
};

export default function LegalPage() {
  return <><BlogHeader /><main className="content-page legal-page"><p className="section-label">LEGAL</p><h1>Legal information</h1><p className="page-intro">The policies that govern use of Poilian and its content.</p><ul><li><Link href="/privacy">Privacy</Link></li><li><Link href="/accessibility">Accessibility</Link></li><li><Link href="/security">Security</Link></li><li><Link href="/terms">Terms of Service</Link></li></ul></main></>;
}
