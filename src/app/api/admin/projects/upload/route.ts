import { NextResponse } from "next/server";
import { adminWriteHeaders, currentAdmin, parseConfigured, url } from "@/lib/admin";
import { r2Configured, uploadToR2 } from "@/lib/r2";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  if (!await currentAdmin()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const image = (await request.formData()).get("image");
  if (!(image instanceof File) || !allowedTypes.has(image.type) || image.size > 3 * 1024 * 1024) return NextResponse.json({ error: "Upload a PNG, JPG, WebP, or GIF image smaller than 3 MB." }, { status: 400 });
  const name = image.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-100) || "project-image";
  if (r2Configured) {
    try { return NextResponse.json({ url: await uploadToR2(`projects/${crypto.randomUUID()}-${name}`, await image.arrayBuffer(), image.type), storage: "r2" }); }
    catch { return NextResponse.json({ error: "Image could not be uploaded to R2." }, { status: 502 }); }
  }
  if (!parseConfigured) return NextResponse.json({ error: "Image storage is not configured." }, { status: 503 });
  const response = await fetch(`${url}/files/${encodeURIComponent(`${crypto.randomUUID()}-${name}`)}`, { method: "POST", headers: { ...adminWriteHeaders, "Content-Type": image.type }, body: image });
  const result = await response.json().catch(() => ({})) as { url?: string };
  return response.ok && result.url ? NextResponse.json({ url: result.url }) : NextResponse.json({ error: "Image could not be uploaded." }, { status: 500 });
}
