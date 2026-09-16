import { absoluteUrl } from "@/lib/seo";
import { getEmailConfig } from "@/lib/email/config";

export type EmailTemplateInput = {
  preheader?: string;
  title: string;
  intro: string;
  rows?: { label: string; value: string }[];
  bodyHtml?: string;
  ctaLabel?: string;
  ctaHref?: string;
  footerNote?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rowBlock(rows: { label: string; value: string }[]) {
  if (!rows.length) return "";
  return rows
    .map(
      (row) => `
        <tr>
          <td style="padding:10px 0 4px;color:#111111;font:700 12px/1.4 Arial,Helvetica,sans-serif;text-transform:uppercase;letter-spacing:.06em;">
            ${escapeHtml(row.label)}
          </td>
        </tr>
        <tr>
          <td style="padding:0 0 14px;color:#111111;font:400 15px/1.55 Arial,Helvetica,sans-serif;">
            ${escapeHtml(row.value).replace(/\n/g, "<br>")}
          </td>
        </tr>`,
    )
    .join("");
}

/** Blue header + logo band, black body text — safe for most email clients. */
export function buildEmailHtml(input: EmailTemplateInput) {
  const config = getEmailConfig();
  const preheader = escapeHtml(input.preheader || input.title);
  const title = escapeHtml(input.title);
  const intro = escapeHtml(input.intro);
  const bodyHtml = input.bodyHtml || "";
  const footer = escapeHtml(input.footerNote || `${config.siteName} · Site notification`);
  const cta =
    input.ctaLabel && input.ctaHref
      ? `<p style="margin:22px 0 0;">
          <a href="${escapeHtml(input.ctaHref)}" style="display:inline-block;border-radius:6px;padding:12px 18px;background:#063b8e;color:#ffffff;font:700 13px/1 Arial,Helvetica,sans-serif;text-decoration:none;">
            ${escapeHtml(input.ctaLabel)}
          </a>
        </p>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#eef2f7;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef2f7;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #d7e0ea;border-radius:10px;overflow:hidden;box-shadow:0 10px 28px #063b8e14;">
          <tr>
            <td style="padding:22px 24px;background:linear-gradient(165deg,#063b8e 0%,#063b8e 68%,#021d4c 100%);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <img src="${escapeHtml(config.logoUrl)}" alt="${escapeHtml(config.siteName)}" width="140" style="display:block;width:140px;height:auto;border:0;" />
                  </td>
                  <td align="right" style="vertical-align:middle;color:#ffffff;font:700 11px/1.4 Arial,Helvetica,sans-serif;letter-spacing:.12em;text-transform:uppercase;">
                    Notification
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px 22px;">
              <h1 style="margin:0 0 10px;color:#111111;font:700 24px/1.25 Arial,Helvetica,sans-serif;letter-spacing:-.02em;">
                ${title}
              </h1>
              <p style="margin:0 0 18px;color:#111111;font:400 15px/1.6 Arial,Helvetica,sans-serif;">
                ${intro}
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #e6eaef;padding-top:8px;">
                ${rowBlock(input.rows || [])}
              </table>
              ${bodyHtml}
              ${cta}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px 22px;border-top:1px solid #e6eaef;background:#f8fafc;color:#111111;font:400 12px/1.5 Arial,Helvetica,sans-serif;">
              ${footer}<br />
              <a href="${escapeHtml(absoluteUrl("/"))}" style="color:#063b8e;font-weight:700;text-decoration:none;">${escapeHtml(absoluteUrl("/"))}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildEmailText(input: EmailTemplateInput) {
  const lines = [input.title, "", input.intro, ""];
  for (const row of input.rows || []) {
    lines.push(`${row.label}:`, row.value, "");
  }
  if (input.footerNote) lines.push(input.footerNote);
  return lines.join("\n").trim();
}
