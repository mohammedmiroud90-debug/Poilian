import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Security",
  description: "How Bitt-i.com works to protect the site, visitors, and entrusted information.",
  alternates: { canonical: "/security" },
};

export default function SecurityPage() {
  return <LegalPage label="SECURITY" title="Security" intro="How we work to protect Poilian, its visitors, and the information entrusted to us." sections={[{ heading: "Protecting the site", body: "We use reasonable administrative and technical measures to help protect the website and any information submitted through it." }, { heading: "Responsible disclosure", body: "If you believe you have found a security concern, please contact us with enough detail for us to investigate it responsibly." }, { heading: "Be alert", body: "Do not send passwords, payment-card numbers, or other highly sensitive information through public contact forms." }]} />;
}
