import type { Metadata } from "next";
import { AskMePage } from "@/components/AskMePage";
import { getAuthorProfile } from "@/lib/profile";
import { getAnsweredQuestions } from "@/lib/questions";

export const metadata: Metadata = {
  title: "Ask me",
  description: "Ask a public question and read answered visitor questions.",
};

export default async function AskMeRoute() {
  const [questions, profile] = await Promise.all([getAnsweredQuestions(), getAuthorProfile()]);
  return <AskMePage questions={questions} profile={profile} />;
}
