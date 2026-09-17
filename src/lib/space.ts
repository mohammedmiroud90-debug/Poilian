import { cookies } from "next/headers";
import { adminWriteHeaders, headers, parseConfigured, url, type ParseUser } from "@/lib/admin";

const SPACE_COOKIE = "poilian_space_session";

export type SpaceUser = {
  objectId: string;
  email: string;
  username: string;
  sessionToken: string;
};

export async function currentSpaceUser(): Promise<SpaceUser | null> {
  if (!parseConfigured) return null;
  const token = (await cookies()).get(SPACE_COOKIE)?.value;
  if (!token) return null;
  try {
    const response = await fetch(`${url}/users/me`, {
      headers: { ...headers, "X-Parse-Session-Token": token },
      cache: "no-store",
    });
    if (!response.ok) return null;
    const user = (await response.json()) as ParseUser;
    const email = (user.email || user.username || "").trim().toLowerCase();
    if (!user.objectId || !email) return null;
    return {
      objectId: user.objectId,
      email,
      username: (user.username || user.email || "Member").trim(),
      sessionToken: token,
    };
  } catch {
    return null;
  }
}

export { SPACE_COOKIE };

async function queryClass(className: string, where: Record<string, unknown>, limit = 100) {
  if (!parseConfigured) return [];
  const endpoint = new URL(`${url}/classes/${className}`);
  endpoint.searchParams.set("where", JSON.stringify(where));
  endpoint.searchParams.set("order", "-createdAt");
  endpoint.searchParams.set("limit", String(limit));
  try {
    const response = await fetch(endpoint, {
      headers: adminWriteHeaders,
      cache: "no-store",
    });
    if (!response.ok) return [];
    const result = (await response.json()) as { results?: Record<string, unknown>[] };
    return result.results ?? [];
  } catch {
    return [];
  }
}

export type SpaceAnswer = {
  id: string;
  title: string;
  question: string;
  answer: string;
  status: string;
  createdAt: string;
  answeredAt?: string;
};

export type SpaceMessage = {
  id: string;
  subject: string;
  topic: string;
  message: string;
  status: string;
  createdAt: string;
};

export type SpaceQuote = {
  id: string;
  author: string;
  content: string;
  postId: string;
  createdAt: string;
};

export async function getSpaceAnswers(email: string): Promise<SpaceAnswer[]> {
  const rows = await queryClass("AskQuestion", { email: email.toLowerCase() });
  return rows.map((item) => ({
    id: String(item.objectId || ""),
    title: String(item.title || "Question"),
    question: String(item.question || ""),
    answer: String(item.answer || ""),
    status: String(item.status || "pending"),
    createdAt: String(item.createdAt || ""),
    answeredAt: typeof item.answeredAt === "string" ? item.answeredAt : undefined,
  }));
}

export async function getSpaceMessages(email: string): Promise<SpaceMessage[]> {
  const rows = await queryClass("ContactMessage", { email: email.toLowerCase() });
  return rows.map((item) => ({
    id: String(item.objectId || ""),
    subject: String(item.subject || item.topic || "Message"),
    topic: String(item.topic || ""),
    message: String(item.message || ""),
    status: String(item.status || "new"),
    createdAt: String(item.createdAt || ""),
  }));
}

export async function getSpaceQuotes(email: string): Promise<SpaceQuote[]> {
  // Guest comments that include this email (saved on Comment.email).
  const rows = await queryClass("Comment", { email: email.toLowerCase() });
  return rows.map((item) => ({
    id: String(item.objectId || ""),
    author: String(item.author || "You"),
    content: String(item.content || ""),
    postId: String(item.postId || ""),
    createdAt: String(item.createdAt || ""),
  }));
}
