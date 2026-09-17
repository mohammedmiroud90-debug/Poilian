"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { SiteLogo } from "@/components/SiteLogo";

const nav = [
  { href: "/space", label: "Overview", icon: "home" },
  { href: "/space/answers", label: "Answers", icon: "answers" },
  { href: "/space/quotes", label: "Quotes", icon: "quotes" },
  { href: "/space/messages", label: "Messages", icon: "messages" },
] as const;

function NavIcon({ name }: { name: string }) {
  const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "answers") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="5" width="16" height="11" rx="2" {...stroke} />
        <path d="M7 16v3l4-3h3" {...stroke} />
      </svg>
    );
  }
  if (name === "quotes") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 8h4v5H8a2 2 0 0 1-2-2V8zm8 0h4v5h-2a2 2 0 0 1-2-2V8z" {...stroke} />
      </svg>
    );
  }
  if (name === "messages") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3.5" y="6" width="17" height="12" rx="2" {...stroke} />
        <path d="m3.5 8 8.5 6 8.5-6" {...stroke} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m4 11 8-7 8 7v8a1 1 0 0 1-1 1h-5v-5H10v5H5a1 1 0 0 1-1-1v-8Z" {...stroke} />
    </svg>
  );
}

export function SpaceShell({
  children,
  username,
}: {
  children: React.ReactNode;
  username: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await fetch("/api/space/logout", { method: "POST" });
    router.replace("/space");
    router.refresh();
  }

  return (
    <div className="poilian-space">
      <header className="poilian-space-header">
        <Link href="/space" className="poilian-space-logo" aria-label="Space home">
          <SiteLogo alt="Poilian" width={118} height={48} priority />
        </Link>

        <nav className="poilian-space-nav" aria-label="User space">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={active ? "is-active" : ""} title={item.label} aria-current={active ? "page" : undefined}>
                <span className="poilian-space-nav-icon">
                  <NavIcon name={item.icon} />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="poilian-space-tools">
          <span className="poilian-space-user" title={username} aria-label={username}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="M5.5 20c.7-3.4 3-5.1 6.5-5.1s5.8 1.7 6.5 5.1" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </span>
          <Link href="/en">Site</Link>
          <button type="button" onClick={() => void logout()} disabled={busy}>
            {busy ? "…" : "Sign out"}
          </button>
        </div>
      </header>
      <main className="poilian-space-main">{children}</main>
    </div>
  );
}
