import type { Metadata } from "next";
import Link from "next/link";
import { BlogHeader } from "@/components/BlogHeader";
import { searchSite } from "@/lib/search";
import { searchKindLabel, type SearchKind } from "@/lib/searchShared";

export const metadata: Metadata = {
  title: "Search",
  description: "Search posts, pages, notes, projects and questions across the site.",
};

const filters: Array<SearchKind | "all"> = ["all", "post", "page", "note", "project", "ask", "photo", "site"];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q || "").trim();
  const type = (filters.includes((params.type as SearchKind | "all") || "all")
    ? params.type
    : "all") as SearchKind | "all";
  const results = q ? await searchSite(q, type) : [];

  return (
    <>
      <BlogHeader />
      <main className="content-page search-page">
        <p className="section-label">SEARCH</p>
        <h1>Search the site</h1>
        <form className="search-page-form" action="/search" method="get">
          <input name="q" defaultValue={q} placeholder="Search posts, pages, notes…" />
          <button type="submit">Search</button>
        </form>
        <div className="search-filters">
          {filters.map((filter) => (
            <Link
              key={filter}
              href={q ? `/search?q=${encodeURIComponent(q)}&type=${filter}` : `/search?type=${filter}`}
              className={type === filter ? "is-active" : ""}
            >
              {filter === "all" ? "All" : searchKindLabel[filter]}
            </Link>
          ))}
        </div>
        {q ? (
          <p className="search-count">
            {results.length} result{results.length === 1 ? "" : "s"} for “{q}”
          </p>
        ) : (
          <p className="search-count">Type a query to search the whole site.</p>
        )}
        <ol className="search-hit-list">
          {results.map((hit) => (
            <li key={`${hit.type}-${hit.id}`}>
              <span>{searchKindLabel[hit.type]}</span>
              <Link href={hit.href}>{hit.title}</Link>
              <p>{hit.snippet || hit.excerpt}</p>
            </li>
          ))}
        </ol>
      </main>
    </>
  );
}
