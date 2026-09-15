import { NextResponse } from "next/server";
import { assertSameOrigin, headers, isAdminUser, parseConfigured, url } from "@/lib/admin";
import { clientKey, rateLimit } from "@/lib/rateLimit";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (!parseConfigured) {
    return NextResponse.json({ error: "Parse is not configured. Add the Parse values to .env.local first." }, { status: 503 });
  }

  const limited = rateLimit(clientKey(request, "admin-login"), { limit: 8, windowMs: 15 * 60 * 1000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  const body = (await request.json().catch(() => ({}))) as { username?: string; email?: string; password?: string };
  const identity = (body.email || body.username || "").trim().toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  if (!identity || !password) {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }

  // Parse REST login must use POST body — never put passwords in the query string.
  const response = await fetch(`${url}/login`, {
    method: "POST",
    headers,
    cache: "no-store",
    body: JSON.stringify({ username: identity, password }),
  });
  if (!response.ok) {
    return NextResponse.json({ error: "Those login details were not accepted." }, { status: 401 });
  }

  const user = (await response.json()) as {
    sessionToken?: string;
    isAdmin?: boolean;
    email?: string;
    username?: string;
  };
  if (!isAdminUser(user) || !user.sessionToken) {
    return NextResponse.json({ error: "This account does not have administrator access." }, { status: 403 });
  }

  const result = NextResponse.json({ ok: true });
  result.cookies.set("poilian_admin_session", user.sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return result;
}
