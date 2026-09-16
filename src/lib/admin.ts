import { cookies } from "next/headers";

const url = process.env.PARSE_SERVER_URL ?? "";
const appId = process.env.PARSE_APP_ID ?? "";
const key = process.env.PARSE_JAVASCRIPT_KEY ?? "";
const masterKey = process.env.PARSE_MASTER_KEY ?? "";
export const parseConfigured = Boolean(url && appId && key);
const headers = { "Content-Type": "application/json", "X-Parse-Application-Id": appId, "X-Parse-Javascript-Key": key };
const adminWriteHeaders = masterKey
  ? { ...headers, "X-Parse-Master-Key": masterKey }
  : headers;

const ownerEmails = new Set(
  [process.env.ADMIN_EMAIL, process.env.PARSE_ADMIN_EMAIL, process.env.ADMIN_EMAILS]
    .flatMap((value) => (value ?? "").split(/[,;\s]+/))
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

// Always allow the known owner account as a bootstrap fallback.
ownerEmails.add("belhachemiamohammed@inbox.eu");

export type ParseUser = {
  objectId?: string;
  sessionToken?: string;
  isAdmin?: unknown;
  admin?: unknown;
  role?: unknown;
  email?: string;
  username?: string;
};

function adminFlag(value: unknown) {
  return value === true || value === "true" || value === 1 || value === "1";
}

export function isAdminUser(user: ParseUser, identity?: string) {
  if (adminFlag(user.isAdmin) || adminFlag(user.admin)) return true;
  const role = typeof user.role === "string" ? user.role.trim().toLowerCase() : "";
  if (role === "admin" || role === "administrator" || role === "owner") return true;
  const candidates = [user.email, user.username, identity]
    .map((value) => (value ?? "").trim().toLowerCase())
    .filter(Boolean);
  return candidates.some((value) => ownerEmails.has(value));
}

/** Login responses sometimes omit custom fields — re-fetch the user with the session. */
export async function loadPrivilegedUser(user: ParseUser, sessionToken: string): Promise<ParseUser> {
  if (adminFlag(user.isAdmin) || adminFlag(user.admin)) return user;
  try {
    const response = await fetch(`${url}/users/me`, {
      headers: { ...headers, "X-Parse-Session-Token": sessionToken },
      cache: "no-store",
    });
    if (!response.ok) return user;
    const full = (await response.json()) as ParseUser;
    return { ...user, ...full, sessionToken };
  } catch (error) {
    console.error("Parse privileged-user reload failed", error);
    return user;
  }
}

/** Persist isAdmin when the account is recognized by email/role but the flag is missing. */
export async function ensureAdminFlag(user: ParseUser) {
  if (!user.objectId || adminFlag(user.isAdmin) || !masterKey) return;
  try {
    await fetch(`${url}/classes/_User/${encodeURIComponent(user.objectId)}`, {
      method: "PUT",
      headers: adminWriteHeaders,
      body: JSON.stringify({ isAdmin: true }),
      cache: "no-store",
    });
  } catch (error) {
    console.error("Parse ensureAdminFlag failed", error);
  }
}

export async function isAdmin(token?: string) {
  if (!parseConfigured || !token) return false;
  try {
    const response = await fetch(`${url}/users/me`, {
      headers: { ...headers, "X-Parse-Session-Token": token },
      cache: "no-store",
    });
    if (!response.ok) return false;
    const user = (await response.json()) as ParseUser;
    return isAdminUser(user);
  } catch (error) {
    console.error("Parse admin-session lookup failed", error);
    return false;
  }
}

export async function currentAdmin() {
  return isAdmin((await cookies()).get("poilian_admin_session")?.value);
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export { url, headers, adminWriteHeaders };
