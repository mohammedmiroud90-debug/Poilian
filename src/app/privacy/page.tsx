import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How Bitt-i.com handles information collected when you visit this website.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <LegalPage label="PRIVACY" title="Privacy policy" intro="How Poilian handles information collected when you visit this website." sections={[{ heading: "Information we collect", body: "We may collect information you provide through forms, such as your name, email address, and message, along with limited technical data needed to operate and improve the site." }, { heading: "How we use information", body: "We use this information to respond to enquiries, provide requested services, maintain site security, and understand how the website is used." }, { heading: "Your choices", body: "You can contact us to ask about, correct, or request deletion of personal information you have provided." }]} />;
}
