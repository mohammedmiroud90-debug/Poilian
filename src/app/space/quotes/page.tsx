import Link from "next/link";
import { currentSpaceUser, getSpaceQuotes } from "@/lib/space";

export default async function SpaceQuotesPage() {
  const user = await currentSpaceUser();
  if (!user) return null;
  const quotes = await getSpaceQuotes(user.email);

  return (
    <section className="space-page">
      <header className="space-page-title">
        <p className="section-label">USER SPACE</p>
        <h1>Your quotes</h1>
        <p>Guest comments posted with your name and email across articles.</p>
      </header>

      {quotes.length === 0 ? (
        <p className="space-empty">
          No comments linked to this email yet. When you comment on a post, use the same email as your space account.
        </p>
      ) : (
        <ul className="space-list">
          {quotes.map((item) => (
            <li key={item.id}>
              <div className="space-list-head">
                <strong>{item.author}</strong>
                <time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString("en-US")}</time>
              </div>
              <blockquote>{item.content}</blockquote>
              {item.postId ? (
                <small>
                  Post id: {item.postId} · <Link href="/posts">Browse posts</Link>
                </small>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
