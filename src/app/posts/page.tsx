import type { Metadata } from "next";
import Link from "next/link";
import { BlogHeader } from "@/components/BlogHeader";
import { getPosts } from "@/lib/parse";
import { postCategories, postsInCategory } from "@/lib/categories";
import { getAuthorProfile } from "@/lib/profile";

export const metadata: Metadata = {
  title: "Posts",
  description: "Notes, research and thoughtful writing from the Bitt-i.com journal.",
  alternates: { canonical: "/posts" },
};

const perPage = 6;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; category?: string; page?: string }>;
}) {
  const { query = "", category = "", page: pageValue = "1" } = await searchParams;
  const authorProfile = await getAuthorProfile();
  const term = query.trim().toLowerCase();
  const allLoaded = await getPosts();
  const categoryPosts = category ? postsInCategory(allLoaded, category) : allLoaded;
  const allPosts = categoryPosts.filter(
    (post) =>
      !term ||
      `${post.title} ${post.excerpt} ${post.category}`.toLowerCase().includes(term),
  );
  const categories = Array.from(
    new Set(allLoaded.flatMap((post) => postCategories(post)).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));
  const totalPages = Math.max(1, Math.ceil(allPosts.length / perPage));
  const page = Math.min(Math.max(1, Number(pageValue) || 1), totalPages);
  const posts = allPosts.slice((page - 1) * perPage, page * perPage);
  const pageUrl = (number: number) =>
    `/posts?${new URLSearchParams({
      ...(term ? { query } : {}),
      ...(category ? { category } : {}),
      page: String(number),
    })}`;

  const heading = category ? `${category} posts` : term ? `Search results for “${query}”` : "Posts";
  const intro = category
    ? `${allPosts.length} post${allPosts.length === 1 ? "" : "s"} in ${category}.`
    : term
      ? `${allPosts.length} matching post${allPosts.length === 1 ? "" : "s"}.`
      : "Notes, research and thoughtful writing from my personal journal.";

  return (
    <>
      <BlogHeader />
      <main className="content-page posts-index">
        <header className="posts-index-hero">
          <div className="posts-index-copy">
            <p className="section-label">PERSONAL WRITING</p>
            <h1>{heading}</h1>
            <p className="page-intro">{intro}</p>
          </div>
          <div className="posts-index-stats" aria-label="Archive totals">
            <span>
              <strong>{allPosts.length}</strong>
              {term || category ? "results" : "articles"}
            </span>
            {totalPages > 1 && (
              <span>
                <strong>
                  {page}/{totalPages}
                </strong>
                page
              </span>
            )}
          </div>
        </header>

        <div className="posts-index-toolbar">
          <form className="posts-index-search" action="/posts" method="get" role="search">
            {category ? <input type="hidden" name="category" value={category} /> : null}
            <label className="sr-only" htmlFor="posts-query">
              Search posts
            </label>
            <input
              id="posts-query"
              name="query"
              defaultValue={query}
              placeholder="Search by title, excerpt, or topic…"
              maxLength={120}
            />
            <button type="submit">Search</button>
          </form>
          {categories.length > 0 && (
            <nav className="posts-index-filters" aria-label="Filter by category">
              <Link className={!category ? "is-active" : ""} href="/posts">
                All
              </Link>
              {categories.map((item) => (
                <Link
                  key={item}
                  className={category.toLowerCase() === item.toLowerCase() ? "is-active" : ""}
                  href={`/posts?${new URLSearchParams({ category: item, ...(term ? { query } : {}) })}`}
                >
                  {item}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <ol className="academic-post-list posts-archive-list" start={(page - 1) * perPage + 1}>
          {posts.map((post, index) => (
            <li key={post.id}>
              <span className="post-index-number" aria-hidden="true">
                {String((page - 1) * perPage + index + 1).padStart(2, "0")}
              </span>
              <article>
                <div className="posts-archive-head">
                  <Link href={`/posts/${post.slug}`}>
                    {post.title} <span aria-hidden="true">↗</span>
                  </Link>
                  <span className="posts-archive-chip">{post.category}</span>
                </div>
                <p className="post-index-excerpt">{post.excerpt || "Read the full story and reflections."}</p>
                <p className="post-index-meta">
                  {formatDate(post.publishedAt)} · {authorProfile.name || post.author}
                </p>
              </article>
              <Link className="posts-archive-open" href={`/posts/${post.slug}`} aria-label={`Read ${post.title}`}>
                <svg viewBox="0 0 32 32" aria-hidden="true">
                  <path
                    d="M8 6.5h12a4 4 0 0 1 4 4v15H12a4 4 0 0 0-4 4V6.5Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 12h8M12 16h8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </Link>
            </li>
          ))}
        </ol>

        {totalPages > 1 && (
          <nav className="pagination posts-index-pagination" aria-label="Posts pagination">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
              <Link className={number === page ? "active" : ""} href={pageUrl(number)} key={number}>
                {number}
              </Link>
            ))}
          </nav>
        )}

        {allPosts.length === 0 && (
          <p className="empty-search">
            No posts match that search. <Link href="/posts">Show all posts</Link>
          </p>
        )}
      </main>
      <footer className="personal-footer posts-footer">
        <div className="personal-shell">
          <div className="footer-directory">
            <section>
              <h3>Navigate</h3>
              <Link href="/en">Home</Link>
              <Link href="/posts">Blog posts</Link>
              <Link href="/research">Research</Link>
            </section>
            <section>
              <h3>Explore</h3>
              <Link href="/about">About me</Link>
              <Link href="/posts">Archive</Link>
              <Link href="/contact">Contact</Link>
            </section>
            <section>
              <h3>Connect</h3>
              <a href="https://www.linkedin.com">LinkedIn</a>
              <a href="#subscribe">Newsletter</a>
            </section>
            <section>
              <h3>Poilian</h3>
              <a href="#story">Our story</a>
              <a href="#support">Support</a>
            </section>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Belhachemia Mohammed. All rights reserved.</span>
            <span>Made with Poilian</span>
          </div>
        </div>
      </footer>
    </>
  );
}
