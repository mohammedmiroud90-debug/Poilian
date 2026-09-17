import Link from "next/link";
import { currentSpaceUser, getSpaceAnswers, getSpaceMessages, getSpaceQuotes } from "@/lib/space";

function TileIcon({ name }: { name: "answers" | "quotes" | "messages" | "ask" }) {
  const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "quotes") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M14 18h8v10h-5.5A4.5 4.5 0 0 1 12 23.5V18zm12 0h8v10h-5.5A4.5 4.5 0 0 1 24 23.5V18z" {...stroke} />
      </svg>
    );
  }
  if (name === "messages") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <rect x="10" y="15" width="28" height="18" rx="2.5" {...stroke} />
        <path d="m10 18 14 9 14-9" {...stroke} />
      </svg>
    );
  }
  if (name === "ask") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="13" {...stroke} />
        <path d="M19.5 20.5a4.5 4.5 0 1 1 5.2 4.4c-1.4.4-2.2 1.2-2.2 2.6" {...stroke} />
        <circle cx="24" cy="31.5" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <rect x="10" y="11" width="28" height="20" rx="3" {...stroke} />
      <path d="M16 31v6l7-6h5" {...stroke} />
      <path d="M17 19h14M17 24h9" {...stroke} />
    </svg>
  );
}

export default async function SpaceHomePage() {
  const user = await currentSpaceUser();
  if (!user) return null;

  const [answers, quotes, messages] = await Promise.all([
    getSpaceAnswers(user.email),
    getSpaceQuotes(user.email),
    getSpaceMessages(user.email),
  ]);

  const answered = answers.filter((item) => item.status === "answered").length;
  const pending = answers.filter((item) => item.status === "pending").length;

  return (
    <section className="space-page">
      <header className="space-page-title">
        <p className="section-label">USER SPACE</p>
        <h1>Welcome, {user.username}</h1>
        <p>Check answers to your questions, quotes you left on articles, and messages sent with {user.email}.</p>
      </header>

      <div className="space-hub-grid" role="list">
        <Link href="/space/answers" className="space-hub-tile" role="listitem">
          <span className="space-hub-tile-art">
            <TileIcon name="answers" />
          </span>
          <strong>Answers</strong>
          <span>
            {answers.length} total · {answered} answered · {pending} pending
          </span>
        </Link>
        <Link href="/space/quotes" className="space-hub-tile" role="listitem">
          <span className="space-hub-tile-art">
            <TileIcon name="quotes" />
          </span>
          <strong>Quotes</strong>
          <span>{quotes.length} comments linked to your email</span>
        </Link>
        <Link href="/space/messages" className="space-hub-tile" role="listitem">
          <span className="space-hub-tile-art">
            <TileIcon name="messages" />
          </span>
          <strong>Messages</strong>
          <span>{messages.length} contact submissions</span>
        </Link>
        <Link href="/ask" className="space-hub-tile" role="listitem">
          <span className="space-hub-tile-art">
            <TileIcon name="ask" />
          </span>
          <strong>Ask me</strong>
          <span>Submit a new public question</span>
        </Link>
      </div>
    </section>
  );
}
