import { getNotes } from "@/lib/notes";
import { getSitePages } from "@/lib/pages";
import { getPosts } from "@/lib/parse";
import { getProjects } from "@/lib/projects";
import { getAnsweredQuestions } from "@/lib/questions";
import type { SearchHit, SearchKind } from "@/lib/searchShared";

type IndexedDoc = {
  id: string;
  type: SearchKind;
  title: string;
  excerpt: string;
  body: string;
  href: string;
  category: string;
  date?: string;
};

function tokenize(query: string) {
  return query
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);
}

function plain(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function snippetFrom(text: string, tokens: string[]) {
  const source = plain(text);
  if (!source) return "";
  const lower = source.toLowerCase();
  const index = tokens.map((token) => lower.indexOf(token)).find((value) => value >= 0) ?? 0;
  const start = Math.max(0, index - 48);
  const end = Math.min(source.length, start + 180);
  const slice = source.slice(start, end).trim();
  return `${start > 0 ? "…" : ""}${slice}${end < source.length ? "…" : ""}`;
}

function scoreDoc(doc: IndexedDoc, tokens: string[]) {
  const title = doc.title.toLowerCase();
  const excerpt = doc.excerpt.toLowerCase();
  const body = doc.body.toLowerCase();
  let score = 0;
  for (const token of tokens) {
    if (title.includes(token)) score += 12;
    if (excerpt.includes(token)) score += 5;
    if (body.includes(token)) score += 2;
    if (title.startsWith(token)) score += 4;
  }
  if (tokens.every((token) => `${title} ${excerpt} ${body}`.includes(token))) score += 8;
  return score;
}

const photographyIndex: IndexedDoc[] = [
  {
    id: "photography",
    type: "photo",
    title: "Photography",
    excerpt: "Selected photographs and visual notes.",
    body: "photography gallery images visual work",
    href: "/photography",
    category: "Photography",
  },
];

const siteIndex: IndexedDoc[] = [
  {
    id: "contact",
    type: "site",
    title: "Contact",
    excerpt: "Write a message about collaboration, services or introductions.",
    body: "contact email message enquiry",
    href: "/contact",
    category: "Site",
  },
  {
    id: "ask-me",
    type: "site",
    title: "Ask me",
    excerpt: "Public questions and answers.",
    body: "ask question answer visitor faq",
    href: "/ask-me",
    category: "Site",
  },
  {
    id: "services",
    type: "site",
    title: "Services",
    excerpt: "Research, writing and digital work.",
    body: "services research writing software",
    href: "/services",
    category: "Site",
  },
];

async function buildIndex(): Promise<IndexedDoc[]> {
  const [posts, pages, notes, projects, questions] = await Promise.all([
    getPosts(),
    getSitePages(),
    getNotes(),
    getProjects(),
    getAnsweredQuestions(),
  ]);

  const postDocs: IndexedDoc[] = posts.map((post) => ({
    id: post.id,
    type: "post",
    title: post.title,
    excerpt: post.excerpt || plain(post.content).slice(0, 160),
    body: `${post.category} ${post.excerpt} ${plain(post.content)} ${post.author}`,
    href: `/posts/${post.slug}`,
    category: post.category || "Post",
    date: post.publishedAt,
  }));

  const pageDocs: IndexedDoc[] = pages.map((page) => ({
    id: page.id,
    type: "page",
    title: page.title,
    excerpt: plain(page.content).slice(0, 160),
    body: plain(page.content),
    href: `/pages/${page.slug}`,
    category: "Page",
    date: page.updatedAt,
  }));

  const noteDocs: IndexedDoc[] = notes.map((note) => ({
    id: note.id,
    type: "note",
    title: note.title,
    excerpt: note.excerpt || note.content.slice(0, 160),
    body: `${note.excerpt} ${note.content}`,
    href: "/notes",
    category: "Note",
    date: note.updatedAt,
  }));

  const projectDocs: IndexedDoc[] = projects.map((project) => ({
    id: project.id,
    type: "project",
    title: project.title,
    excerpt: project.summary,
    body: `${project.company} ${project.summary}`,
    href: project.url || "/projects",
    category: "Project",
    date: project.updatedAt,
  }));

  const askDocs: IndexedDoc[] = questions.map((item) => {
    const questionText = plain(item.question);
    return {
      id: item.id,
      type: "ask" as const,
      title: item.title || questionText,
      excerpt: item.answer,
      body: `${item.title} ${questionText} ${item.answer} ${item.name}`,
      href: `/ask-me#${item.id}`,
      category: "Ask me",
      date: item.answeredAt || item.createdAt,
    };
  });

  return [...postDocs, ...pageDocs, ...noteDocs, ...projectDocs, ...askDocs, ...photographyIndex, ...siteIndex];
}

export async function searchSite(query: string, type?: SearchKind | "all"): Promise<SearchHit[]> {
  const tokens = tokenize(query);
  if (!tokens.length) return [];
  const docs = await buildIndex();
  return docs
    .map((doc) => {
      const score = scoreDoc(doc, tokens);
      return {
        id: doc.id,
        type: doc.type,
        title: doc.title,
        excerpt: doc.excerpt,
        snippet: snippetFrom(`${doc.excerpt} ${doc.body}`, tokens),
        href: doc.href,
        category: doc.category,
        date: doc.date,
        score,
      } satisfies SearchHit;
    })
    .filter((hit) => hit.score > 0 && (!type || type === "all" || hit.type === type))
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, 40);
}
