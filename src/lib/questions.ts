import { adminWriteHeaders, parseConfigured, url, headers } from "@/lib/admin";
import { normalizeAskTopic } from "@/lib/askShared";
import type { AskTopicId } from "@/lib/askShared";

export { ASK_TOPICS, normalizeAskTopic } from "@/lib/askShared";
export type { AskTopicId } from "@/lib/askShared";

export type AskQuestion = {
  id: string;
  name: string;
  email?: string;
  title: string;
  topic: AskTopicId;
  question: string;
  answer: string;
  status: "pending" | "answered" | "hidden";
  createdAt: string;
  answeredAt?: string;
};

const CLASS_NAME = "AskQuestion";

const fallback: AskQuestion[] = [
  {
    id: "welcome-ask",
    name: "A reader",
    title: "What is this site for?",
    topic: "general",
    question: "<p>What is this site for?</p>",
    answer:
      "Poilian is my personal corner for writing, research, photography and the work I want to keep in one place. Ask a question below and I publish replies here.",
    status: "answered",
    createdAt: "2026-09-01T10:00:00.000Z",
    answeredAt: "2026-09-01T18:00:00.000Z",
  },
];

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

function mapQuestion(item: Record<string, unknown>): AskQuestion {
  const status = item.status === "answered" || item.status === "hidden" ? item.status : "pending";
  const question = text(item.question);
  return {
    id: text(item.objectId) || crypto.randomUUID(),
    name: text(item.name) || "Visitor",
    email: text(item.email) || undefined,
    title: text(item.title) || question.replace(/<[^>]+>/g, " ").trim().slice(0, 140),
    topic: normalizeAskTopic(item.topic),
    question,
    answer: text(item.answer),
    status,
    createdAt: text(item.createdAt) || new Date().toISOString(),
    answeredAt: text(item.answeredAt) || undefined,
  };
}

async function queryQuestions(where: Record<string, unknown>, limit = 200) {
  if (!parseConfigured) return null;
  const endpoint = new URL(`${url}/classes/${CLASS_NAME}`);
  endpoint.searchParams.set("where", JSON.stringify(where));
  endpoint.searchParams.set("order", "-createdAt");
  endpoint.searchParams.set("limit", String(limit));
  try {
    const response = await fetch(endpoint, { headers, cache: "no-store" });
    if (!response.ok) return null;
    const result = (await response.json()) as { results?: Record<string, unknown>[] };
    return (result.results ?? []).map(mapQuestion);
  } catch (error) {
    console.error("Parse AskQuestion query failed", error);
    return null;
  }
}

export async function getAnsweredQuestions(): Promise<AskQuestion[]> {
  const rows = await queryQuestions({ status: "answered" });
  if (rows?.length) return rows.filter((item) => item.question && item.answer);
  return fallback;
}

export async function getAdminQuestions(): Promise<AskQuestion[]> {
  const rows = await queryQuestions({});
  return rows ?? [];
}

export async function createQuestion(input: {
  name: string;
  email?: string;
  title: string;
  topic: AskTopicId;
  question: string;
}) {
  if (!parseConfigured) return null;
  const response = await fetch(`${url}/classes/${CLASS_NAME}`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: input.name,
      email: input.email || "",
      title: input.title,
      topic: input.topic,
      question: input.question,
      answer: "",
      status: "pending",
    }),
    cache: "no-store",
  });
  if (!response.ok) return null;
  const saved = (await response.json().catch(() => ({}))) as { objectId?: string };
  return saved.objectId || "";
}

export async function updateQuestion(id: string, body: Record<string, unknown>) {
  if (!parseConfigured || !id) return false;
  const response = await fetch(`${url}/classes/${CLASS_NAME}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: adminWriteHeaders,
    body: JSON.stringify(body),
    cache: "no-store",
  });
  return response.ok;
}
