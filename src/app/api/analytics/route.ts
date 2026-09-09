import { NextResponse } from "next/server";
import { submitToParse } from "@/lib/parse";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { path?: unknown };
  const path = typeof body.path === "string" ? body.path.slice(0, 240) : "";
  if (!path.startsWith("/") || path.startsWith("/admin") || path.startsWith("/api")) return new NextResponse(null, { status: 204 });
  await submitToParse("PageView", { path });
  return new NextResponse(null, { status: 204 });
}
