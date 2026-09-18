import Link from "next/link";

export function ContributeCard() {
  return (
    <aside className="contribute-card contribute-card--cover" aria-label="Contribute an article idea">
      <div className="contribute-card-cover">
        <img src="/SOUNDIMAGE.png" alt="" width={640} height={360} />
      </div>
      <div className="contribute-card-body">
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
