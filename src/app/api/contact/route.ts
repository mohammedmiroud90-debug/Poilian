import { NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/admin";
import { sanitizeContactHtml, plainTextFromHtml, createContactChallenge, verifyContactChallenge } from "@/lib/contact";
import { normalizeTopic } from "@/lib/contactShared";
import { notifyContactSubmission } from "@/lib/email/notifications";
import { submitToParse } from "@/lib/parse";
import { clientKey, rateLimit } from "@/lib/rateLimit";

function textField(value: unknown, max: number) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

export async function GET() {
  return NextResponse.json(createContactChallenge());
}

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (request.headers.get("content-type") !== "application/json") {
    return NextResponse.json({ error: "Unsupported request." }, { status: 415 });
  }

  const limited = rateLimit(clientKey(request, "contact"), { limit: 5, windowMs: 10 * 60 * 1000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many messages. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (textField(body.website, 200)) return NextResponse.json({ ok: true });

  const name = textField(body.name, 100);
  const email = textField(body.email, 254);
  const company = textField(body.company, 120);
  const phone = textField(body.phone, 40);
  const subject = textField(body.subject, 160);
  const topic = normalizeTopic(body.topic);
  const rawMessage = typeof body.message === "string" ? body.message : "";
  const html = sanitizeContactHtml(rawMessage);
  const plain = plainTextFromHtml(html) || textField(rawMessage, 6000);

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !plain) {
    return NextResponse.json({ error: "Enter a name, valid email address, and message." }, { status: 400 });
  }

  // Optional challenge — older contact forms without tokens still work.
  if (body.humanToken || body.humanIssuedAt) {
    const ok = verifyContactChallenge({
      first: body.humanFirst,
      second: body.humanSecond,
      issuedAt: body.humanIssuedAt,
      token: body.humanToken,
      answer: body.humanAnswer,
    });
    if (!ok) {
      return NextResponse.json({ error: "Please answer the human check correctly." }, { status: 400 });
    }
  } else if (body.humanAnswer != null && body.humanFirst != null && body.humanSecond != null) {
    if (Number(body.humanAnswer) !== Number(body.humanFirst) + Number(body.humanSecond)) {
      return NextResponse.json({ error: "Please answer the human check correctly." }, { status: 400 });
    }
  }

  const saved = await submitToParse("ContactMessage", {
    name,
    email,
    company,
    phone,
    subject,
    topic,
    message: plain,
    messageHtml: html,
    status: "new",
  });

  if (!saved) {
    return NextResponse.json({ error: "Contact service is unavailable." }, { status: 503 });
  }

  void notifyContactSubmission({
    name,
    email,
    topic,
    subject: subject || topic,
    message: plain,
  }).catch((error) => console.error("[notify:contact]", error));

  return NextResponse.json({ ok: true });
}
