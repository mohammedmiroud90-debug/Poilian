import { NextResponse } from "next/server";
import { adminWriteHeaders, currentAdmin, parseConfigured, url } from "@/lib/admin";
import { r2Configured, uploadToR2 } from "@/lib/r2";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const extensionOk = (name: string) => /\.(png|jpe?g|webp|gif)$/i.test(name);

export async function POST(request: Request) {
  if (!(await currentAdmin())) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const image = (await request.formData()).get("image");
  if (!(image instanceof File) || image.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Upload a PNG, JPG, WebP, or GIF image smaller than 5 MB." }, { status: 400 });
  }
  if (!allowedTypes.has(image.type) || !extensionOk(image.name)) {
    return NextResponse.json({ error: "Upload a PNG, JPG, WebP, or GIF image." }, { status: 400 });
  }
  const name = image.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-100) || "editor-image";
  if (r2Configured) {
    try {
      return NextResponse.json({
        url: await uploadToR2(`media/${crypto.randomUUID()}-${name}`, await image.arrayBuffer(), image.type),
        storage: "r2",
      });
    } catch {
      return NextResponse.json({ error: "Image could not be uploaded to R2." }, { status: 502 });
    }
  }
  if (!parseConfigured) return NextResponse.json({ error: "Image storage is not configured." }, { status: 503 });
  const response = await fetch(`${url}/files/${encodeURIComponent(`${crypto.randomUUID()}-${name}`)}`, {
    method: "POST",
    headers: { ...adminWriteHeaders, "Content-Type": image.type },
    body: image,
  });
  const result = (await response.json().catch(() => ({}))) as { url?: string };
  return response.ok && result.url
    ? NextResponse.json({ url: result.url })
    : NextResponse.json({ error: "Image could not be uploaded." }, { status: 500 });
}
