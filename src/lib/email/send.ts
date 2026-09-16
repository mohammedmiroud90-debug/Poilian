import { getEmailConfig } from "@/lib/email/config";
import { submitToParse } from "@/lib/parse";

export type OutboundEmail = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  tag?: string;
};

function normalizeRecipients(to: string | string[]) {
  const list = (Array.isArray(to) ? to : [to])
    .map((entry) => entry.trim())
    .filter(Boolean);
  return [...new Set(list)];
}

async function sendViaResend(email: OutboundEmail, apiKey: string, from: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: normalizeRecipients(email.to),
      subject: email.subject,
      html: email.html,
      text: email.text,
      reply_to: email.replyTo,
      tags: email.tag ? [{ name: "type", value: email.tag }] : undefined,
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Resend error (${response.status}): ${detail.slice(0, 240)}`);
  }
  return true;
}

async function queueEmailLog(email: OutboundEmail, status: "sent" | "skipped" | "failed", detail?: string) {
  try {
    await submitToParse("SiteEmailLog", {
      to: normalizeRecipients(email.to).join(", "),
      subject: email.subject.slice(0, 200),
      tag: email.tag || "general",
      status,
      detail: detail?.slice(0, 500) || "",
    });
  } catch {
    /* audit log is optional */
  }
}

/**
 * Sends site mail via Resend (fetch). Compatible with Cloudflare Workers.
 * SMTP/nodemailer is not used — Workers cannot resolve or run nodemailer.
 * Set RESEND_API_KEY in Cloudflare bindings / .env.local.
 */
export async function sendSiteEmail(email: OutboundEmail) {
  const config = getEmailConfig();
  const recipients = normalizeRecipients(email.to);
  if (!recipients.length) {
    await queueEmailLog(email, "skipped", "No recipients");
    return { ok: false, skipped: true as const };
  }

  if (!config.resendApiKey) {
    if (process.env.NODE_ENV === "development") {
      console.info("[email:preview]", email.subject, "→", recipients.join(", "));
    }
    const detail = config.smtp.host
      ? "SMTP is set but Workers builds require RESEND_API_KEY (nodemailer is not bundled)."
      : "Email transport not configured (set RESEND_API_KEY)";
    await queueEmailLog(email, "skipped", detail);
    return { ok: false, skipped: true as const };
  }

  try {
    await sendViaResend(email, config.resendApiKey, config.from);
    await queueEmailLog(email, "sent");
    return { ok: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email send failed";
    console.error("[email:failed]", message);
    await queueEmailLog(email, "failed", message);
    return { ok: false as const, error: message };
  }
}
