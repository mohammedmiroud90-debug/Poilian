import { createHmac, timingSafeEqual } from "crypto";
import { sanitizeHtml } from "@/lib/parse";
import { MESSAGE_LIMIT } from "@/lib/contactShared";

const HTML_LIMIT = 20000;

function secret() {
  return process.env.PARSE_JAVASCRIPT_KEY || process.env.PARSE_MASTER_KEY || "poilian-contact";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function createContactChallenge() {
  const first = Math.floor(Math.random() * 8) + 2;
  const second = Math.floor(Math.random() * 8) + 1;
  const issuedAt = Date.now();
  return { first, second, issuedAt, token: sign(`${first}:${second}:${issuedAt}`) };
}

export function verifyContactChallenge(input: {
  first: unknown;
  second: unknown;
  issuedAt: unknown;
  token: unknown;
  answer: unknown;
}) {
  const first = Number(input.first);
  const second = Number(input.second);
  const issuedAt = Number(input.issuedAt);
  const token = typeof input.token === "string" ? input.token : "";
  const answer = Number(input.answer);
  if (!Number.isInteger(first) || !Number.isInteger(second) || !Number.isInteger(issuedAt) || !token) return false;
  if (issuedAt > Date.now() + 60_000 || Date.now() - issuedAt > 30 * 60 * 1000) return false;
  const expected = sign(`${first}:${second}:${issuedAt}`);
  const tokenBuffer = Buffer.from(token);
  const expectedBuffer = Buffer.from(expected);
  if (tokenBuffer.length !== expectedBuffer.length) return false;
  try {
    if (!timingSafeEqual(tokenBuffer, expectedBuffer)) return false;
  } catch {
    return false;
  }
  return answer === first + second;
}

export function sanitizeContactHtml(html: string) {
  const cleaned = sanitizeHtml(html)
    .replace(/<iframe\b[\s\S]*?<\/iframe>/gi, "")
    .replace(/<(?!\/?(?:p|br|strong|b|em|i|u|s|ul|ol|li|blockquote|a|h3|h4|code)\b)[^>]+>/gi, "")
    .replace(/<a\b([^>]*)>/gi, (_match, attrs: string) => {
      const href =
        (attrs.match(/\bhref\s*=\s*"([^"]+)"/i) ||
          attrs.match(/\bhref\s*=\s*'([^']+)'/i) ||
          attrs.match(/\bhref\s*=\s*([^\s>]+)/i))?.[1] ?? "";
      const safe = href.replace(/&amp;/gi, "&").trim();
      if (!safe || /^(javascript|vbscript|data):/i.test(safe)) return "<a>";
      if (!/^https?:\/\//i.test(safe) && !safe.startsWith("mailto:") && !safe.startsWith("/")) return "<a>";
      return `<a href="${safe.replace(/"/g, "&quot;")}" rel="noopener noreferrer" target="_blank">`;
    });
  return cleaned.slice(0, HTML_LIMIT);
}

export { MESSAGE_LIMIT };
export { normalizeTopic, plainTextFromHtml } from "@/lib/contactShared";
