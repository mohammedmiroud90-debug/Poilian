import Link from "next/link";

/** Line-art contribute mark — distinct from the old filled pencil/folder art. */
function ContributeArt() {
  return (
    <div className="contribute-card-icon" aria-hidden="true">
      <svg viewBox="0 0 64 64" role="presentation">
        <circle cx="32" cy="32" r="30" fill="#e8f2ff" />
        <circle cx="32" cy="32" r="30" fill="none" stroke="#9ec4eb" strokeWidth="1.5" />
        {/* Open notebook */}
        <path
          d="M18 16h20a4 4 0 0 1 4 4v28a2 2 0 0 1-2 2H18a4 4 0 0 1-4-4V20a4 4 0 0 1 4-4Z"
          fill="#fff"
          stroke="#063b8e"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M22 16v34" stroke="#0769c6" strokeWidth="2" strokeLinecap="round" />
        <path d="M28 24h10M28 30h10M28 36h7" stroke="#63a4e0" strokeWidth="2" strokeLinecap="round" />
        {/* Idea spark / plus */}
        <circle cx="46" cy="20" r="9" fill="#063b8e" />
        <path d="M46 15.5v9M41.5 20h9" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function ContributeCard() {
  return (
    <aside className="contribute-card" aria-label="Contribute an article idea">
      <div className="contribute-card-body">
        <ContributeArt />
        <h2>Interested in contributing?</h2>
        <p>Submit an idea for an article and we may reach out to you in the future.</p>
      </div>
      <footer className="contribute-card-foot">
        <p>
          Login with your <Link href="/admin"><strong>bitt-i.com</strong></Link> account to suggest an
          article.
        </p>
      </footer>
    </aside>
  );
}
