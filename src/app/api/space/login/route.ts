import { NextResponse } from "next/server";
import { assertSameOrigin, headers, parseConfigured, url, type ParseUser } from "@/lib/admin";
import { SPACE_COOKIE } from "@/lib/space";
import { clientKey, rateLimit } from "@/lib/rateLimit";

async function parseLogin(identity: string, password: string) {
  const response = await fetch(`${url}/login`, {
    method: "POST",
    headers,
    cache: "no-store",
    body: JSON.stringify({ username: identity, password }),
  });
  if (response.ok) return response;
  return fetch(`${url}/login`, {
    method: "POST",
    headers,
    cache: "no-store",
    body: JSON.stringify({ email: identity, password }),
  });
}

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (!parseConfigured) {
    return NextResponse.json({ error: "Parse is not configured." }, { status: 503 });
  }

  const limited = rateLimit(clientKey(request, "space-login"), { limit: 10, windowMs: 15 * 60 * 1000 });
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many login attempts." }, { status: 429 });
  }

  const body = (await request.json().catch(() => ({}))) as { email?: string; password?: string };
  const identity = (body.email || "").trim().toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  if (!identity || !password) {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }

  const response = await parseLogin(identity, password);
  if (!response.ok) {
    return NextResponse.json({ error: "Those login details were not accepted." }, { status: 401 });
  }

  const user = (await response.json()) as ParseUser;
  if (!user.sessionToken) {
    return NextResponse.json({ error: "Those login details were not accepted." }, { status: 401 });
  }

  const result = NextResponse.json({ ok: true });
  result.cookies.set(SPACE_COOKIE, user.sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return result;
}
