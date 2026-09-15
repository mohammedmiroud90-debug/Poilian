import { NextResponse } from "next/server";
import { adminWriteHeaders, currentAdmin, parseConfigured, url } from "@/lib/admin";
import { r2Configured, uploadToR2 } from "@/lib/r2";

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/x-icon",
  "image/vnd.microsoft.icon",
]);

const extensionOk = (name: string) => /\.(png|jpe?g|webp|gif|ico)$/i.test(name);

export async function POST(request: Request) {
  if (!(await currentAdmin())) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const image = (await request.formData()).get("image");
  if (!(image instanceof File) || image.size > 3 * 1024 * 1024) {
    return NextResponse.json({ error: "Upload an image smaller than 3 MB." }, { status: 400 });
  }
  const type = image.type || (image.name.toLowerCase().endsWith(".ico") ? "image/x-icon" : "");
  if (!allowedTypes.has(type) || !extensionOk(image.name)) {
    return NextResponse.json({ error: "Upload a PNG, JPG, WebP, GIF, or ICO image (SVG is not allowed)." }, { status: 400 });
  }
  const safeName = image.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-100) || "branding-image";
  if (r2Configured) {
    try {
      const uploaded = await uploadToR2(`avatars/${crypto.randomUUID()}-${safeName}`, await image.arrayBuffer(), type);
      return NextResponse.json({ url: uploaded, storage: "r2" });
    } catch (error) {
      console.error("R2 avatar upload failed", error);
      return NextResponse.json({ error: "Image could not be uploaded to R2." }, { status: 502 });
    }
  }
  if (!parseConfigured) return NextResponse.json({ error: "R2 storage is not configured. Add the R2 variables to your environment." }, { status: 503 });
  const response = await fetch(`${url}/files/${encodeURIComponent(`${crypto.randomUUID()}-${safeName}`)}`, {
    method: "POST",
    headers: { ...adminWriteHeaders, "Content-Type": type },
    body: image,
  });
  if (!response.ok) return NextResponse.json({ error: "Image could not be uploaded. Check Parse file permissions." }, { status: 500 });
  const result = (await response.json()) as { url?: string };
  return result.url ? NextResponse.json({ url: result.url }) : NextResponse.json({ error: "Image upload did not return a URL." }, { status: 500 });
}
