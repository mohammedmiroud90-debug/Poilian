import { LegalPage } from "@/components/LegalPage";

export default function AccessibilityPage() {
  return <LegalPage label="ACCESSIBILITY" title="Accessibility statement" intro="Poilian is committed to making this website usable by as many people as possible." sections={[{ heading: "Our approach", body: "We aim to use clear structure, readable text, keyboard-friendly controls, meaningful labels, and responsive layouts throughout the site." }, { heading: "Ongoing improvements", body: "Accessibility is an ongoing effort. We review new features and content to identify and address barriers." }, { heading: "Need assistance?", body: "If you encounter an accessibility issue or need content in another format, please contact us and describe the page or feature involved." }]} />;
}
