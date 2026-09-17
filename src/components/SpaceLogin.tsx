"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { SiteLogo } from "@/components/SiteLogo";

type PortalId = "user" | "answers" | "quotes" | "messages" | "ask" | "contact" | "site";

const portals: {
  id: PortalId;
  label: string;
  hint?: string;
  href?: string;
  action?: "login";
}[] = [
  { id: "user", label: "User space", hint: "Sign in", action: "login" },
  { id: "answers", label: "Answers", hint: "Check replies", action: "login" },
  { id: "quotes", label: "Quotes", hint: "Your comments", action: "login" },
  { id: "messages", label: "Messages", hint: "Contact inbox", action: "login" },
  { id: "ask", label: "Ask me", hint: "Public questions", href: "/ask" },
  { id: "contact", label: "Contact", hint: "Get help", href: "/contact" },
  { id: "site", label: "Website", hint: "Return home", href: "/en" },
];

function PortalIcon({ id }: { id: PortalId }) {
  const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  if (id === "answers") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <rect x="10" y="11" width="28" height="20" rx="3" {...stroke} />
        <path d="M16 31v6l7-6h5" {...stroke} />
        <path d="M17 19h14M17 24h9" {...stroke} />
      </svg>
    );
  }
  if (id === "quotes") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M14 18h8v10h-5.5A4.5 4.5 0 0 1 12 23.5V18zm12 0h8v10h-5.5A4.5 4.5 0 0 1 24 23.5V18z" {...stroke} />
      </svg>
    );
  }
  if (id === "messages") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <rect x="10" y="15" width="28" height="18" rx="2.5" {...stroke} />
        <path d="m10 18 14 9 14-9" {...stroke} />
      </svg>
    );
  }
  if (id === "ask") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="13" {...stroke} />
        <path d="M19.5 20.5a4.5 4.5 0 1 1 5.2 4.4c-1.4.4-2.2 1.2-2.2 2.6" {...stroke} />
        <circle cx="24" cy="31.5" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (id === "contact") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="18" r="6" {...stroke} />
        <path d="M12 36c2-6 6.5-9 12-9s10 3 12 9" {...stroke} />
      </svg>
    );
  }
  if (id === "site") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="13" {...stroke} />
        <path d="M11 24h26M24 11c3.5 4 5.5 8.5 5.5 13S27.5 33 24 37c-3.5-4-5.5-8.5-5.5-13S20.5 15 24 11z" {...stroke} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="8" {...stroke} />
      <path d="M24 10v3.5M24 34.5V38M10 24h3.5M34.5 24H38M14.2 14.2l2.5 2.5M31.3 31.3l2.5 2.5M14.2 33.8l2.5-2.5M31.3 16.7l2.5-2.5" {...stroke} />
      <circle cx="24" cy="24" r="3" {...stroke} />
    </svg>
  );
}

export function SpaceLogin() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [active, setActive] = useState<PortalId>("user");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/space/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
    });
    const result = (await response.json()) as { error?: string };
    if (response.ok) {
      const dest = active === "answers" ? "/space/answers" : active === "quotes" ? "/space/quotes" : active === "messages" ? "/space/messages" : "/space";
      window.location.assign(dest);
    } else {
      setError(result.error ?? "Unable to sign in.");
      setBusy(false);
    }
  }

  if (showLogin) {
    return (
      <main className="admin-login robot-login space-user-login">
        <section className="robot-login-card">
          <header>
            <Link href="/en" aria-label="Poilian home">
              <SiteLogo alt="Poilian" width={148} height={61} priority />
            </Link>
            <span>USER ACCESS</span>
          </header>
          <div className="robot-login-layout">
            <div className="robot-login-copy">
              <p className="section-label">SECURE ACCESS</p>
              <h1>Welcome back.</h1>
              <p>Sign in to check your answers, quotes, and messages tied to your account email.</p>
              <form onSubmit={submit}>
                <label>
                  Email address
                  <input name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
                </label>
                <label>
                  Password
                  <div className="password-field">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      placeholder="Your password"
                    />
                    <button type="button" onClick={() => setShowPassword((value) => !value)}>
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </label>
                {error ? <small role="alert">{error}</small> : null}
                <button className="login-submit" disabled={busy}>
                  {busy ? "Signing in…" : "Enter space"}
                  <span>→</span>
                </button>
              </form>
            </div>
            <aside className="robot-login-art" aria-hidden="true">
              <p>
                USER
                <br />
                SPACE
              </p>
              <svg viewBox="0 0 250 250">
                <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="125" cy="92" r="28" strokeWidth="3" />
                  <path d="M72 188c8-36 28-54 53-54s45 18 53 54" strokeWidth="3" />
                  <rect x="58" y="48" width="134" height="154" rx="18" strokeWidth="3" />
                  <path d="M88 48V34h74v14" strokeWidth="3" />
                </g>
              </svg>
              <span>• • •</span>
            </aside>
          </div>
          <footer>
            <button type="button" className="space-user-back" onClick={() => setShowLogin(false)}>
              ← Back to options
            </button>
            <Link href="/en">Return to site</Link>
          </footer>
        </section>
      </main>
    );
  }

  return (
    <main className="space-portal">
      <header className="space-portal-top">
        <div className="space-portal-top-inner">
          <Link href="/en" className="space-portal-brand" aria-label="Poilian home">
            <SiteLogo alt="Poilian" width={132} height={54} priority />
          </Link>
          <div className="space-portal-top-links">
            <Link href="/contact">Support</Link>
            <Link href="/en">Site</Link>
          </div>
        </div>
      </header>

      <section className="space-portal-card">
        <h1>Login</h1>
        <div className="space-portal-rule" aria-hidden="true" />

        <div className="space-portal-grid" role="list">
          {portals.map((portal) => {
            if (portal.href) {
              return (
                <Link key={portal.id} href={portal.href} className="space-portal-tile" role="listitem">
                  <span className="space-portal-tile-art">
                    <PortalIcon id={portal.id} />
                  </span>
                  <strong>{portal.label}</strong>
                  {portal.hint ? <span>{portal.hint}</span> : null}
                </Link>
              );
            }
            return (
              <button
                key={portal.id}
                type="button"
                className="space-portal-tile"
                role="listitem"
                onClick={() => {
                  setActive(portal.id);
                  setShowLogin(true);
                }}
              >
                <span className="space-portal-tile-art">
                  <PortalIcon id={portal.id} />
                </span>
                <strong>{portal.label}</strong>
                {portal.hint ? <span>{portal.hint}</span> : null}
              </button>
            );
          })}
        </div>
      </section>

      <footer className="space-portal-foot">
        <Link href="/en">Home</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/contact">Contact</Link>
      </footer>
    </main>
  );
}
