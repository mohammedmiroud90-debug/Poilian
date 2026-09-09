const accountId = process.env.R2_ACCOUNT_ID ?? "";
const accessKeyId = process.env.R2_ACCESS_KEY_ID ?? "";
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY ?? "";
const bucket = process.env.R2_BUCKET ?? "bucketblog";
const publicUrl = (process.env.R2_PUBLIC_URL ?? "https://pub-934e29ec90504f5c9f23a9b4f607b77a.r2.dev").replace(/\/$/, "");

export const r2Configured = Boolean(accountId && accessKeyId && secretAccessKey && bucket && publicUrl);

const encoder = new TextEncoder();
const hex = (bytes: ArrayBuffer) => Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
const digest = async (value: string | ArrayBuffer) => hex(await crypto.subtle.digest("SHA-256", typeof value === "string" ? encoder.encode(value) : value));
const hmac = async (key: string | ArrayBuffer, value: string) => crypto.subtle.sign("HMAC", await crypto.subtle.importKey("raw", typeof key === "string" ? encoder.encode(key) : key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]), encoder.encode(value));
const dateParts = (date: Date) => { const stamp = date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z"); return { date: stamp.slice(0, 8), timestamp: stamp }; };
const objectKey = (key: string) => key.split("/").map((part) => encodeURIComponent(part)).join("/");

/** Uploads an object with AWS Signature V4, which R2 supports in both Next.js and Workers runtimes. */
export async function uploadToR2(key: string, body: ArrayBuffer, contentType: string) {
  if (!r2Configured) throw new Error("R2 storage is not configured.");
  const host = `${accountId}.r2.cloudflarestorage.com`;
  const pathname = `/${bucket}/${objectKey(key)}`;
  const payloadHash = await digest(body);
  const { date, timestamp } = dateParts(new Date());
  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${timestamp}\n`;
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
  const credentialScope = `${date}/auto/s3/aws4_request`;
  const canonicalRequest = `PUT\n${pathname}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
  const stringToSign = `AWS4-HMAC-SHA256\n${timestamp}\n${credentialScope}\n${await digest(canonicalRequest)}`;
  const dateKey = await hmac(`AWS4${secretAccessKey}`, date);
  const regionKey = await hmac(dateKey, "auto");
  const serviceKey = await hmac(regionKey, "s3");
  const signingKey = await hmac(serviceKey, "aws4_request");
  const signature = hex(await hmac(signingKey, stringToSign));
  const response = await fetch(`https://${host}${pathname}`, { method: "PUT", headers: { "Content-Type": contentType, "X-Amz-Content-Sha256": payloadHash, "X-Amz-Date": timestamp, Authorization: `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}` }, body });
  if (!response.ok) throw new Error(`R2 upload failed (${response.status}).`);
  return `${publicUrl}/${objectKey(key)}`;
}
