import { NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/admin";
import { sanitizeContactHtml, plainTextFromHtml } from "@/lib/contact";
import { notifyAskSubmission } from "@/lib/email/notifications";
import { createQuestion, getAnsweredQuestions, normalizeAskTopic } from "@/lib/questions";
import { clientKey, rateLimit } from "@/lib/rateLimit";

function textField(value: unknown, max: number) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

export async function GET() {
  const questions = await getAnsweredQuestions();
  return NextResponse.json(
    questions.map(({ id, name, title, topic, question, answer, createdAt, answeredAt }) => ({
      id,
      name,
      title,
      topic,
      question,
      answer,
      createdAt,
      answeredAt,
    })),
  );
}

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  const limited = rateLimit(clientKey(request, "ask"), { limit: 6, windowMs: 10 * 60 * 1000 });
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many questions. Please try again later." }, { status: 429 });
  }
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (textField(body.website, 200)) return NextResponse.json({ ok: true });
  const name = textField(body.name, 80);
  const email = textField(body.email, 254);
  const title = textField(body.title, 150);
  const topic = normalizeAskTopic(body.topic);
  const html = sanitizeContactHtml(typeof body.question === "string" ? body.question : "");
  const plain = plainTextFromHtml(html);
  if (!name || title.length < 15) {
    return NextResponse.json({ error: "Enter your name and a title of at least 15 characters." }, { status: 400 });
  }
  if (!plain || plain.length < 20) {
    return NextResponse.json(
      { error: "Add a bit more detail to your question (at least 20 characters)." },
      { status: 400 },
    );
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email, or leave it blank." }, { status: 400 });
  }
  const id = await createQuestion({ name, email: email || undefined, title, topic, question: html || `<p>${plain}</p>` });
  if (!id) return NextResponse.json({ error: "The question desk is unavailable right now." }, { status: 503 });

  void notifyAskSubmission({
    name,
    email: email || undefined,
    title,
    topic,
    questionPlain: plain,
  }).catch((error) => console.error("[notify:ask]", error));

  return NextResponse.json({ ok: true });
}
