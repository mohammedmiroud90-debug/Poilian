import { absoluteUrl } from "@/lib/seo";
import { defaultLogoUrl } from "@/lib/branding";

export type EmailConfig = {
  enabled: boolean;
  from: string;
  notifyTo: string;
  replyTo: string;
  siteName: string;
  logoUrl: string;
  resendApiKey: string;
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
  };
};

function splitEmails(value: string) {
  return value
    .split(/[,;\s]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function getEmailConfig(): EmailConfig {
  const notifyRaw =
    process.env.NOTIFY_EMAIL ||
    process.env.ADMIN_EMAIL ||
    process.env.EMAIL_NOTIFY_TO ||
    "";
  const notifyList = splitEmails(notifyRaw);
  const from =
    process.env.EMAIL_FROM ||
    process.env.SMTP_FROM ||
    (notifyList[0] ? `Poilian <${notifyList[0]}>` : "Poilian <noreply@localhost>");
  const logoPath = process.env.EMAIL_LOGO_URL || defaultLogoUrl;
  const logoUrl = /^https?:\/\//i.test(logoPath) ? logoPath : absoluteUrl(logoPath);

  const resendApiKey = process.env.RESEND_API_KEY?.trim() || "";
  const smtpHost = process.env.SMTP_HOST?.trim() || "";
  const smtpUser = process.env.SMTP_USER?.trim() || "";
  const smtpPass = process.env.SMTP_PASS?.trim() || "";
  const smtpPort = Number(process.env.SMTP_PORT || "587");
  const smtpSecure = process.env.SMTP_SECURE === "true" || smtpPort === 465;

  // Workers / vinext: only Resend (HTTP). Do not treat SMTP as enabled — nodemailer is not bundled.
  const enabled = Boolean(resendApiKey);

  return {
    enabled,
    from,
    notifyTo: notifyList[0] || "",
    replyTo: process.env.EMAIL_REPLY_TO?.trim() || notifyList[0] || "",
    siteName: process.env.EMAIL_SITE_NAME?.trim() || "Poilian",
    logoUrl,
    resendApiKey,
    smtp: {
      host: smtpHost,
      port: Number.isFinite(smtpPort) ? smtpPort : 587,
      secure: smtpSecure,
      user: smtpUser,
      pass: smtpPass,
    },
  };
}

export function adminNotifyRecipients() {
  const raw =
    process.env.NOTIFY_EMAIL ||
    process.env.ADMIN_EMAIL ||
    process.env.EMAIL_NOTIFY_TO ||
    "";
  return splitEmails(raw);
}
