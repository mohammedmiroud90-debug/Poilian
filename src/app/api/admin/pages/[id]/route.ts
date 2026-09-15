import { NextResponse } from "next/server";
import { adminWriteHeaders, currentAdmin, parseConfigured, url } from "@/lib/admin";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await currentAdmin())) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  if (!parseConfigured) return NextResponse.json({ error: "Parse is not configured." }, { status: 503 });
  const { id } = await params;
  const safeId = typeof id === "string" ? id.trim().slice(0, 80) : "";
  if (!safeId) return NextResponse.json({ error: "Invalid page." }, { status: 400 });
  const response = await fetch(`${url}/classes/SitePage/${encodeURIComponent(safeId)}`, {
    method: "DELETE",
    headers: adminWriteHeaders,
  });
  return response.ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "Page could not be deleted." }, { status: 500 });
}
