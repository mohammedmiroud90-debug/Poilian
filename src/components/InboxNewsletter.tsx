"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

function NewsletterArt() {
  return (
    <svg className="inbox-newsletter-art" viewBox="0 0 240 200" aria-hidden="true" role="presentation">
      <ellipse cx="130" cy="168" rx="86" ry="20" fill="#b9c5d2" opacity=".5" />
      {/* Dark blue pen (bottom) */}
      <g transform="rotate(-18 120 140)">
        <rect x="18" y="128" width="196" height="28" rx="14" fill="#355a86" />
        <path d="M204 128h18c6 0 10 6 8 11l-8 12c-1 2-4 5-8 5h-10v-28z" fill="#27466c" />
        <circle cx="34" cy="142" r="5" fill="#9eb6d0" opacity=".35" />
      </g>
      {/* Light blue pen (middle) */}
      <g transform="rotate(-12 120 110)">
        <rect x="28" y="98" width="188" height="26" rx="13" fill="#8ea0b8" />
        <path d="M206 98h16c6 0 9 6 7 11l-7 11c-1 2-4 4-7 4h-9V98z" fill="#6f849d" />
      </g>
      {/* Folder card */}
      <g transform="translate(58 22)">
        <path
          d="M18 8h92c10 0 18 8 18 18v58c0 10-8 18-18 18H52l-16 18 2-18H18c-10 0-18-8-18-18V26c0-10 8-18 18-18z"
          fill="#c9a888"
        />
        <path
          d="M64 28c-16 14-26 30-26 42 0 14 12 22 26 22s26-8 26-22c0-12-10-28-26-42z"
          fill="#fff"
        />
        <path
          d="M64 36v36M52 48l12-12 12 12"
          stroke="#c9a888"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  );
}

export function InboxNewsletter() {
  const [notice, setNotice] = useState("");

  function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("Thanks — you’re on the list.");
  }

  return (
    <section className="inbox-newsletter" aria-labelledby="inbox-newsletter-title">
      <div className="inbox-newsletter-inner">
        <div className="inbox-newsletter-copy">
          <h2 id="inbox-newsletter-title">Want updates to your inbox?</h2>
          <p>
            Every week we&apos;ll share a collection of great questions from our community, news and
            articles from our blog, and awesome links from around the web.
          </p>
          <Link className="inbox-newsletter-issues" href="/posts">
            Read previous issues →
          </Link>
          <form className="inbox-newsletter-form" onSubmit={subscribe}>
            <label className="sr-only" htmlFor="inbox-newsletter-email">
              Email
            </label>
            <input id="inbox-newsletter-email" type="email" name="email" placeholder="Email" required />
            <button type="submit">Subscribe</button>
          </form>
          {notice ? (
            <p className="inbox-newsletter-notice">{notice}</p>
          ) : (
            <p className="inbox-newsletter-hint">
              or edit your settings on your{" "}
              <Link href="/contact">profile page</Link>.
            </p>
          )}
        </div>
        <div className="inbox-newsletter-visual">
          <NewsletterArt />
        </div>
      </div>
    </section>
  );
}
