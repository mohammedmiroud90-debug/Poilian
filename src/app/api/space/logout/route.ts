import { NextResponse } from "next/server";
import { SPACE_COOKIE } from "@/lib/space";

export async function POST() {
  const result = NextResponse.json({ ok: true });
  result.cookies.set(SPACE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return result;
}
