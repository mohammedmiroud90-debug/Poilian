import { NextResponse } from "next/server";
import { adminWriteHeaders, currentAdmin, parseConfigured, url } from "@/lib/admin";
import { r2Configured, uploadToR2 } from "@/lib/r2";

const allowedTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const typeFromName = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  return "";
};

export async function POST(request: Request) {
  if (!(await currentAdmin())) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const file = (await request.formData()).get("file");
  if (!(file instanceof File) || file.size > 15 * 1024 * 1024) {
    return NextResponse.json({ error: "Upload a PDF or image smaller than 15 MB." }, { status: 400 });
  }
  const type = allowedTypes.has(file.type) ? file.type : typeFromName(file.name);
  if (!type || !allowedTypes.has(type)) {
    return NextResponse.json({ error: "Upload a PDF, PNG, JPG, WebP, or GIF file." }, { status: 400 });
  }
  const name = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-100) || "editor-file";
  if (r2Configured) {
    try {
      return NextResponse.json({
        url: await uploadToR2(`media/${crypto.randomUUID()}-${name}`, await file.arrayBuffer(), type),
        storage: "r2",
      });
    } catch {
      return NextResponse.json({ error: "File could not be uploaded to R2." }, { status: 502 });
    }
  }
  if (!parseConfigured) return NextResponse.json({ error: "File storage is not configured." }, { status: 503 });
  const response = await fetch(`${url}/files/${encodeURIComponent(`${crypto.randomUUID()}-${name}`)}`, {
    method: "POST",
    headers: { ...adminWriteHeaders, "Content-Type": type },
    body: file,
  });
  const result = (await response.json().catch(() => ({}))) as { url?: string };
  return response.ok && result.url
    ? NextResponse.json({ url: result.url })
    : NextResponse.json({ error: "File could not be uploaded." }, { status: 500 });
}
