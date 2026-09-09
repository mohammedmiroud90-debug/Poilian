import { NextResponse } from "next/server";
import { headers, isAdminUser, parseConfigured, url } from "@/lib/admin";

export async function POST(request: Request) {
  if (!parseConfigured) return NextResponse.json({ error: "Parse is not configured. Add the Parse values to .env.local first." }, { status: 503 });
  const { username, email, password } = await request.json() as { username?: string; email?: string; password?: string };
  const identity = (email || username || "").trim().toLowerCase();
  if (!identity || !password) return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  const login = new URL(`${url}/login`);
  login.searchParams.set("username", identity);
  login.searchParams.set("password", password);
  const response = await fetch(login, { headers, cache: "no-store" });
  if (!response.ok) return NextResponse.json({ error: "Those login details were not accepted." }, { status: 401 });
  const user = await response.json() as { sessionToken?: string; isAdmin?: boolean; email?: string; username?: string };
  if (!isAdminUser(user) || !user.sessionToken) return NextResponse.json({ error: "This account does not have administrator access." }, { status: 403 });
  const result = NextResponse.json({ ok: true });
  result.cookies.set("poilian_admin_session", user.sessionToken, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return result;
}
