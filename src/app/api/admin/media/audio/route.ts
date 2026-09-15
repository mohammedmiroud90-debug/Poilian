import { NextResponse } from "next/server";
import { adminWriteHeaders, currentAdmin, parseConfigured, url } from "@/lib/admin";
import { r2Configured, uploadToR2 } from "@/lib/r2";

const allowedTypes = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/webm",
  "audio/mp4",
  "audio/aac",
  "audio/x-m4a",
  "audio/m4a",
]);

export async function POST(request: Request) {
  if (!(await currentAdmin())) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const audio = (await request.formData()).get("audio");
  if (!(audio instanceof File) || audio.size > 30 * 1024 * 1024) {
    return NextResponse.json({ error: "Upload an MP3, WAV, OGG, or M4A file smaller than 30 MB." }, { status: 400 });
  }
  const type = audio.type || "audio/mpeg";
  if (audio.type && !allowedTypes.has(audio.type)) {
    return NextResponse.json({ error: "Upload an MP3, WAV, OGG, or M4A audio file." }, { status: 400 });
  }
  const name = audio.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-100) || "post-audio.mp3";
  if (r2Configured) {
    try {
      return NextResponse.json({
        url: await uploadToR2(`audio/${crypto.randomUUID()}-${name}`, await audio.arrayBuffer(), type),
        storage: "r2",
      });
    } catch {
      return NextResponse.json({ error: "Audio could not be uploaded to R2." }, { status: 502 });
    }
  }
  if (!parseConfigured) return NextResponse.json({ error: "Audio storage is not configured." }, { status: 503 });
  const response = await fetch(`${url}/files/${encodeURIComponent(`${crypto.randomUUID()}-${name}`)}`, {
    method: "POST",
    headers: { ...adminWriteHeaders, "Content-Type": type },
    body: audio,
  });
  const result = (await response.json().catch(() => ({}))) as { url?: string };
  return response.ok && result.url
    ? NextResponse.json({ url: result.url })
    : NextResponse.json({ error: "Audio could not be uploaded." }, { status: 500 });
}
