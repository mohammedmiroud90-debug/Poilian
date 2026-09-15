/** Simple in-memory rate limiter for public API abuse (per-instance). */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  { limit = 20, windowMs = 10 * 60 * 1000 }: { limit?: number; windowMs?: number } = {},
) {
  const now = Date.now();
  const record = buckets.get(key);
  if (!record || record.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true as const, remaining: limit - 1, retryAfterSec: Math.ceil(windowMs / 1000) };
  }
  if (record.count >= limit) {
    return {
      ok: false as const,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((record.resetAt - now) / 1000)),
    };
  }
  record.count += 1;
  return { ok: true as const, remaining: limit - record.count, retryAfterSec: Math.ceil((record.resetAt - now) / 1000) };
}

export function clientKey(request: Request, prefix: string) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
  return `${prefix}:${ip}`;
}
