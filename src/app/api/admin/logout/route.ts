import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { headers, parseConfigured, url } from "@/lib/admin";

export async function POST() {
  const jar = await cookies();
  const token = jar.get("poilian_admin_session")?.value;
  if (parseConfigured && token) {
    try {
      await fetch(`${url}/logout`, {
        method: "POST",
        headers: { ...headers, "X-Parse-Session-Token": token },
        cache: "no-store",
      });
    } catch {
      /* Cookie is still cleared below. */
    }
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set("poilian_admin_session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
