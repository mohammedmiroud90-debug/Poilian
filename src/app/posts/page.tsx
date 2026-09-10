import Link from "next/link";
import { BlogHeader } from "@/components/BlogHeader";
import { getPosts } from "@/lib/parse";
import { postsInCategory } from "@/lib/categories";
import { getAuthorProfile } from "@/lib/profile";

const perPage = 6;
export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; category?: string; page?: string }>;
}) {
  const { query = "", category = "", page: pageValue = "1" } = await searchParams;
  const authorProfile = await getAuthorProfile();
  const term = query.trim().toLowerCase();
  const categoryPosts = category ? postsInCategory(await getPosts(), category) : await getPosts();
  const allPosts = categoryPosts.filter(
    (post) =>
      !term ||
      `${post.title} ${post.excerpt} ${post.category}`
        .toLowerCase()
        .includes(term),
  );
  const totalPages = Math.max(1, Math.ceil(allPosts.length / perPage));
  const page = Math.min(Math.max(1, Number(pageValue) || 1), totalPages);
  const posts = allPosts.slice((page - 1) * perPage, page * perPage);
  const pageUrl = (number: number) =>
    `/posts?${new URLSearchParams({ ...(term ? { query } : {}), ...(category ? { category } : {}), page: String(number) })}`;
  return (
    <>
      <BlogHeader />
      <main className="content-page posts-index">
        <p className="section-label">PERSONAL WRITING</p>
        <h1>{category ? `${category} posts` : term ? `Search results for “${query}”` : "Posts"}</h1>
        <p className="page-intro">
          {category
            ? `${allPosts.length} post${allPosts.length === 1 ? "" : "s"} in ${category}.`
            : term
            ? `${allPosts.length} matching post${allPosts.length === 1 ? "" : "s"}.`
            : "Notes, research and thoughtful writing from my personal journal."}
        </p>
        <ol className="academic-post-list" start={(page - 1) * perPage + 1}>
          {posts.map((post, index) => (
            <li key={post.id}>
              <span className="post-index-number" aria-hidden="true">{String((page - 1) * perPage + index + 1).padStart(2, "0")}</span>
              <article>
              <Link href={`/posts/${post.slug}`}>
                {post.title} <span>↗</span>
              </Link>
              <p className="post-index-excerpt">{post.excerpt || "Read the full story and reflections."}</p>
              <p className="post-index-meta">
                {new Date(post.publishedAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                · {authorProfile.name || post.author}
              </p>
              <small>/en/posts/{post.slug}/</small>
              </article>
            </li>
          ))}
        </ol>
        {totalPages > 1 && (
          <nav className="pagination" aria-label="Posts pagination">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (number) => (
                <Link
                  className={number === page ? "active" : ""}
                  href={pageUrl(number)}
                  key={number}
                >
                  {number}
                </Link>
              ),
            )}
          </nav>
        )}
        {allPosts.length === 0 && (
          <p className="empty-search">
            No posts match that search.{" "}
            <Link href="/posts">Show all posts</Link>
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
