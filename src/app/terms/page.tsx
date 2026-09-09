import { LegalPage } from "@/components/LegalPage";

export default function TermsPage() {
  return <LegalPage label="TERMS" title="Terms of Service" intro="The basic terms for using the Poilian website and its published content." sections={[{ heading: "Use of this website", body: "You may use this website for lawful, personal, and informational purposes. Do not interfere with its operation or attempt to gain unauthorised access." }, { heading: "Content", body: "Unless otherwise stated, site content is provided for general information and remains the property of its respective owner. Please request permission before reproducing material beyond fair use." }, { heading: "Changes", body: "We may update these terms or the website from time to time. Continuing to use the site after an update means you accept the current terms." }]} />;
}
