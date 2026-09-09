import { NextResponse } from "next/server";
import { submitToParse } from "@/lib/parse";

const attempts = new Map<string, { count: number; resetAt: number }>();
const windowMs = 10 * 60 * 1000;
const limit = 5;

function allowed(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now(); const record = attempts.get(ip);
  if (!record || record.resetAt <= now) { attempts.set(ip, { count: 1, resetAt: now + windowMs }); return true; }
  if (record.count >= limit) return false;
  record.count++; return true;
}

export async function POST(request: Request) {
  if (request.headers.get("content-type") !== "application/json") return NextResponse.json({ error: "Unsupported request." }, { status: 415 });
  if (!allowed(request)) return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429, headers: { "Retry-After": "600" } });
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : "";
  const email = typeof body.email === "string" ? body.email.trim().slice(0, 254) : "";
  const message = typeof body.message === "string" ? body.message.replace(/<[^>]*>/g, "").trim().slice(0, 6000) : "";
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message) return NextResponse.json({ error: "Enter a name, valid email address, and message." }, { status: 400 });
  const saved = await submitToParse("ContactMessage", { name, email, message, status: "new" });
  return saved ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Contact service is unavailable." }, { status: 503 });
}
