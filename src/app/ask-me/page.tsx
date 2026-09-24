import type { Metadata } from "next";
import { AskMePage } from "@/components/AskMePage";
import { getAuthorProfile } from "@/lib/profile";
import { getAnsweredQuestions } from "@/lib/questions";

export const metadata: Metadata = {
  title: "Ask Me | Bitt-i.com",
  description: "Ask a public question and read answered visitor questions. Engage with the community and get insights on various topics.",
  keywords: "ask me, questions, answers, community, engagement, public questions",
  alternates: { canonical: "/ask-me" },
  openGraph: {
    type: "website",
    url: "/ask-me",
    siteName: "Bitt-i.com",
    title: "Ask Me | Bitt-i.com",
    description: "Ask a public question and read answered visitor questions. Engage with the community and get insights.",
    images: [{ url: "/Bitti.png", width: 466, height: 143, alt: "Bitt-i.com" }],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ask Me | Bitt-i.com",
    description: "Ask a public question and read answered visitor questions. Engage with the community and get insights.",
    images: ["/Bitti.png"],
    site: "@bitticom",
    creator: "@bitticom",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function AskMeRoute() {
  const [questions, profile] = await Promise.all([getAnsweredQuestions(), getAuthorProfile()]);
  return <AskMePage questions={questions} profile={profile} />;
}
