export async function uploadEditorImage(file: File) {
  const form = new FormData();
  form.set("image", file);
  const response = await fetch("/api/admin/media/upload", { method: "POST", body: form });
  const result = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!response.ok || !result.url) throw new Error(result.error || "Image upload failed.");
  return result.url;
}
