import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { currentAdmin, headers, parseConfigured, url } from "@/lib/admin";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await currentAdmin()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  if (!parseConfigured) return NextResponse.json({ error: "Parse is not configured." }, { status: 503 });
  const { id } = await params;
  const response = await fetch(`${url}/classes/Note/${encodeURIComponent(id)}`, { method: "DELETE", headers });
  if (!response.ok) return NextResponse.json({ error: "Note could not be deleted." }, { status: 500 });
  revalidatePath("/notes");
  revalidatePath("/admin/settings");
  return NextResponse.json({ ok: true });
}
