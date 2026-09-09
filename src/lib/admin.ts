import { cookies } from "next/headers";

const url = process.env.PARSE_SERVER_URL ?? "";
const appId = process.env.PARSE_APP_ID ?? "";
const key = process.env.PARSE_JAVASCRIPT_KEY ?? "";
const masterKey = process.env.PARSE_MASTER_KEY ?? "";
export const parseConfigured = Boolean(url && appId && key);
const headers = { "Content-Type": "application/json", "X-Parse-Application-Id": appId, "X-Parse-Javascript-Key": key };
const adminWriteHeaders = masterKey ? { ...headers, "X-Parse-Master-Key": masterKey } : headers;
const ownerEmails = new Set([process.env.ADMIN_EMAIL || "behachemiamohammed@inbox.eu", "belhachemiamohammed@inbox.eu"].map((email) => email.toLowerCase()));
export function isAdminUser(user: { isAdmin?: boolean; email?: string; username?: string }) { return user.isAdmin === true || ownerEmails.has((user.email ?? "").toLowerCase()) || ownerEmails.has((user.username ?? "").toLowerCase()); }

export async function isAdmin(token?: string) {
  if (!parseConfigured || !token) return false;
  try {
    const response = await fetch(`${url}/users/me`, { headers: { ...headers, "X-Parse-Session-Token": token }, cache: "no-store" });
    if (!response.ok) return false;
    const user = await response.json() as { isAdmin?: boolean; email?: string; username?: string };
    return isAdminUser(user);
  } catch (error) {
    // Public pages must not fail when a stale admin cookie is present while
    // Parse is unavailable.
    console.error("Parse admin-session lookup failed", error);
    return false;
  }
}

export async function currentAdmin() { return isAdmin((await cookies()).get("poilian_admin_session")?.value); }
export { url, headers, adminWriteHeaders };
