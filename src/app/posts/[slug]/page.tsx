import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArticleToc } from "@/components/ArticleToc";
import { BlogHeader } from "@/components/BlogHeader";
import { CommentSection } from "@/components/CommentSection";
import { ContributeCard } from "@/components/ContributeCard";
import { InboxNewsletter } from "@/components/InboxNewsletter";
import { PostListen } from "@/components/PostListen";
import { PostReaderControls } from "@/components/PostReaderControls";
import { PostTools } from "@/components/PostTools";
import { PostAuthor } from "@/components/PostAuthor";
import { CodeBlock } from "@/components/CodeBlock";
import { InlinePostEditor } from "@/components/InlinePostEditor";
import { currentAdmin } from "@/lib/admin";
import { getComments, getPost, getPosts, isRichHtmlContent, sanitizeHtml } from "@/lib/parse";
import { getAuthorProfile } from "@/lib/profile";
import { toVideoEmbedUrl } from "@/lib/embed";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";

type Block = {
  kind: "heading" | "paragraph" | "quote" | "code" | "unordered" | "ordered" | "image" | "video";
  value: string;
  level?: number;
  items?: string[];
  id?: string;
  alt?: string;
};
function readingTime(text: string): number {
  const words = text
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

/** Split rich HTML near the midpoint on block boundaries for mid-article embeds. */
function splitHtmlHalfway(html: string): [string, string] {
  const source = html.trim();
  if (!source) return ["", ""];
  const parts = source.split(/(?=<(?:p|h[1-6]|blockquote|ul|ol|figure|div|pre|table|hr)\b)/i).filter(Boolean);
  if (parts.length < 2) return [source, ""];
  const mid = Math.max(1, Math.ceil(parts.length / 2));
  return [parts.slice(0, mid).join(""), parts.slice(mid).join("")];
}
const idFrom = (value: string, index: number) =>
  `${
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "section"
  }-${index}`;
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found", robots: { index: false, follow: false } };
  const description = post.excerpt || `Read ${post.title} on ${SITE_NAME}.`;
  const keywords = post.category.split(/[,/|]/).map((tag) => tag.trim()).filter(Boolean);
  const authorProfile = await getAuthorProfile();
  
  return {
    title: post.title,
    description,
    keywords: keywords.join(", "),
    alternates: { canonical: `/posts/${post.slug}` },
    openGraph: {
      type: "article",
      url: `/posts/${post.slug}`,
      title: post.title,
      description,
      siteName: SITE_NAME,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author || authorProfile.name],
      section: post.category,
      tags: keywords,
      images: post.coverImage ? [{ url: post.coverImage, width: 1200, height: 630, alt: post.title }] : [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: post.coverImage ? [post.coverImage] : [DEFAULT_OG_IMAGE.url],
      creator: authorProfile.linkedinUrl?.split("/").pop() || "@bitticom",
      site: "@bitticom",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
function parseBlocks(content: string): Block[] {
  const lines = content.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;
  let headingIndex = 0;
  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index++;
      continue;
    }
    if (line.startsWith("```")) {
      const code: string[] = [];
      index++;
      while (index < lines.length && !lines[index].trim().startsWith("```"))
        code.push(lines[index++]);
      if (index < lines.length) index++;
      blocks.push({ kind: "code", value: code.join("\n") });
      continue;
    }
    const image = line.match(/^!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)$/);
    if (image) {
      blocks.push({ kind: "image", value: image[2], alt: image[1] });
      index++;
      continue;
    }
    const video = line.match(/^\[video\]\((https?:\/\/[^\s)]+)\)$/i);
    if (video) {
      blocks.push({ kind: "video", value: video[1] });
      index++;
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const value = heading[2];
      blocks.push({
        kind: "heading",
        value,
        level: heading[1].length,
        id: idFrom(value, headingIndex++),
      });
      index++;
      continue;
    }
    const list = line.match(/^([-*+]|\d+\.)\s+(.+)$/);
    if (list) {
      const ordered = /^\d+\./.test(list[1]);
      const items: string[] = [];
      while (index < lines.length) {
        const item = lines[index]
          .trim()
          .match(ordered ? /^\d+\.\s+(.+)$/ : /^[-*+]\s+(.+)$/);
        if (!item) break;
        items.push(item[1]);
        index++;
      }
      blocks.push({
        kind: ordered ? "ordered" : "unordered",
        value: "",
        items,
      });
      continue;
    }
    if (line.startsWith(">")) {
      blocks.push({ kind: "quote", value: line.replace(/^>\s?/, "") });
      index++;
      continue;
    }
    const paragraph: string[] = [line];
    index++;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,6}\s|```|[-*+]\s+|\d+\.\s+|>|!\[[^\]]*\]\(|\[video\]\()/i.test(lines[index].trim())
    )
      paragraph.push(lines[index++].trim());
    blocks.push({ kind: "paragraph", value: paragraph.join(" ") });
  }
  return blocks;
}
function InlineCode({ value }: { value: string }) {
  return (
    <>
      {value
        .split(/(`[^`]+`)/g)
        .map((part, index) => {
          if (part.startsWith("`") && part.endsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
          return part.split(/(\*\*[^*]+?\*\*|\*[^*]+?\*|\[[^\]]+\]\(https?:\/\/[^)]+\)|https?:\/\/[^\s]+|#[\p{L}\p{N}_-]+)/gu).map((token, tokenIndex) => {
            if (token.startsWith("**") && token.endsWith("**")) return <strong key={`${index}-${tokenIndex}`}>{token.slice(2, -2)}</strong>;
            if (token.startsWith("*") && token.endsWith("*") && token.length > 2 && !token.startsWith("**")) return <em key={`${index}-${tokenIndex}`}>{token.slice(1, -1)}</em>;
            const markdownLink = token.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
            const href = markdownLink?.[2] ?? (token.match(/^https?:\/\//) ? token : "");
            const tag = token.match(/^#([\p{L}\p{N}_-]+)$/u);
            return href ? <a href={href} target="_blank" rel="noreferrer" key={`${index}-${tokenIndex}`}>{markdownLink?.[1] ?? href}</a> : tag ? <Link className="inline-post-tag" href={`/posts?query=${encodeURIComponent(tag[1])}`} key={`${index}-${tokenIndex}`}>{token}</Link> : token;
          });
        })}
    </>
  );
}
export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const admin = await currentAdmin();
  const allPosts = await getPosts();
  const authorProfile = await getAuthorProfile();
  const similarPosts = allPosts.filter((item) => item.slug !== post.slug).sort((first, second) => Number(second.category === post.category) - Number(first.category === post.category)).slice(0, 5);
  const authorPostCount = allPosts.filter((item) => item.author === authorProfile.name || item.author === post.author).length;
  const comments = await getComments(post.id);
  
  const hasHtmlContent = isRichHtmlContent(post.contentHtml);
  
  let blocks: Block[] = [];
  let headings: (Block & { id: string })[] = [];
  
  if (hasHtmlContent) {
    const headingMatches = [...(post.contentHtml?.matchAll(/<h([1-6])[^>]*>(.*?)<\/h\1>/gi) || [])];
    let headingIndex = 0;
    headings = headingMatches.map(match => {
      const level = parseInt(match[1]);
      const value = match[2].replace(/<[^>]*>/g, '');
      const id = idFrom(value, headingIndex++);
      return { kind: "heading" as const, value, level, id };
    });
  } else {
    blocks = parseBlocks(post.content);
    headings = blocks.filter(
      (block): block is Block & { id: string } =>
        block.kind === "heading" && Boolean(block.id),
    );
  }
  
  const tags = post.category.split(/[,/|]/).map((tag) => tag.trim()).filter(Boolean);
  const usesTanklager = ["cybersecurity-in-the-age-of-ai-defending-against-intelligent-threats", "the-devops-handbook-revisited-modern-practices-for-continuous-delivery"].includes(post.slug);
  const description = post.excerpt || `Read ${post.title} on ${SITE_NAME}.`;
  const minutesToRead = readingTime(post.contentHtml || post.content || "");
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: post.title,
        description,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt || post.publishedAt,
        author: {
          "@type": "Person",
          name: post.author || authorProfile.name,
          url: `${SITE_URL}/pages/founder`,
          image: authorProfile.avatarUrl,
          description: authorProfile.bio,
          sameAs: authorProfile.linkedinUrl ? [authorProfile.linkedinUrl] : undefined,
        },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
          logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}${DEFAULT_OG_IMAGE.url}`,
            width: DEFAULT_OG_IMAGE.width,
            height: DEFAULT_OG_IMAGE.height,
          },
        },
        mainEntityOfPage: `${SITE_URL}/posts/${post.slug}`,
        articleSection: post.category,
        keywords: tags,
        inLanguage: "en-US",
        wordCount: post.contentHtml?.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length || post.content.split(/\s+/).filter(Boolean).length,
        timeRequired: `PT${minutesToRead}M`,
        image: post.coverImage ? {
          "@type": "ImageObject",
          url: post.coverImage,
          width: 1200,
          height: 630,
        } : {
          "@type": "ImageObject",
          url: `${SITE_URL}${DEFAULT_OG_IMAGE.url}`,
          width: DEFAULT_OG_IMAGE.width,
          height: DEFAULT_OG_IMAGE.height,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Posts",
            item: `${SITE_URL}/posts`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: `${SITE_URL}/posts/${post.slug}`,
          },
        ],
      },
    ],
  };
  
  let processedHtmlContent = post.contentHtml;
  if (hasHtmlContent && headings.length > 0) {
    let headingIndex = 0;
    processedHtmlContent = post.contentHtml!.replace(/<h([1-6])([^>]*)>(.*?)<\/h\1>/gi, (match, level, attrs, content) => {
      const heading = headings[headingIndex++];
      if (heading && !attrs.includes('id=')) {
        return `<h${level}${attrs} id="${heading.id}">${content}</h${level}>`;
      }
      return match;
    });
  }
  
  function renderBlock(block: Block, index: number) {
    if (block.kind === "heading") {
      const Tag = (block.level ?? 2) >= 3 ? "h3" : "h2";
      return (
        <Tag id={block.id} key={`${block.id}-${index}`}>
          <InlineCode value={block.value} />
        </Tag>
      );
    }
    if (block.kind === "code") return <CodeBlock code={block.value} key={index} />;
    if (block.kind === "image") {
      return (
        <figure className="post-image" key={index}>
          <img 
            src={block.value} 
            alt={block.alt || `Image for ${post!.title}`} 
            loading="lazy" 
            width={1200}
            height={630}
          />
          {block.alt && <figcaption>{block.alt}</figcaption>}
        </figure>
      );
    }
    if (block.kind === "video") {
      const embedUrl = toVideoEmbedUrl(block.value);
      return embedUrl ? (
        <div className="video-embed" key={index}>
          <iframe
            src={embedUrl}
            title="Embedded video"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : null;
    }
    if (block.kind === "unordered") {
      return (
        <ul key={index}>
          {block.items?.map((item, itemIndex) => (
            <li key={itemIndex}>
              <InlineCode value={item} />
            </li>
          ))}
        </ul>
      );
    }
    if (block.kind === "ordered") {
      return (
        <ol key={index}>
          {block.items?.map((item, itemIndex) => (
            <li key={itemIndex}>
              <InlineCode value={item} />
            </li>
          ))}
        </ol>
      );
    }
    if (block.kind === "quote") {
      return (
        <blockquote key={index}>
          <InlineCode value={block.value} />
        </blockquote>
      );
    }
    return (
      <p key={index}>
        <InlineCode value={block.value} />
      </p>
    );
  }

  const midNewsletter = <InboxNewsletter variant="promo" />;

  const article = hasHtmlContent ? (() => {
    const safeHtml = sanitizeHtml(processedHtmlContent || "");
    const [htmlBefore, htmlAfter] = splitHtmlHalfway(safeHtml);
    return (
      <article className="post-body rich-post-content">
        <div className="post-body-part" dangerouslySetInnerHTML={{ __html: htmlBefore }} />
        {midNewsletter}
        {htmlAfter ? (
          <div
            className="post-body-part post-body-part--continued"
            dangerouslySetInnerHTML={{ __html: htmlAfter }}
          />
        ) : null}
      </article>
    );
  })() : (() => {
    const mid = Math.max(1, Math.ceil(blocks.length / 2));
    const before = blocks.slice(0, mid);
    const after = blocks.slice(mid);
    return (
      <article className="post-body">
        {before.map(renderBlock)}
        {midNewsletter}
        {after.map((block, i) => renderBlock(block, mid + i))}
      </article>
    );
  })();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogHeader category={post.slug === "cybersecurity-in-the-age-of-ai-defending-against-intelligent-threats" ? post.category : undefined} audioUrl={post.audioUrl?.trim() || undefined} />
      <main className="content-page post-page">
        <PostTools title={post.title} />
        {admin && <InlinePostEditor post={post} />}
        <Link href="/posts" className="back-link">
          ← All posts
        </Link>
        <div className="post-author-row">
          <div className="author-profile">
            <img className="author-avatar" src={authorProfile.avatarUrl} alt={`Portrait of ${authorProfile.name}`} width={27} height={27} />
            <span>Written by</span>
            <strong>{authorProfile.name}</strong>
            <aside className="author-hover-card" aria-label={`About ${authorProfile.name}`}><b>{authorPostCount} {authorPostCount === 1 ? "post" : "posts"}</b><span>{authorProfile.bio}</span><a href={authorProfile.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn profile <i aria-hidden="true">↗</i></a></aside>
          </div>
          <PostReaderControls />
        </div>
        <p className="post-meta">
          {post.category} · {new Date(post.publishedAt).toLocaleDateString()}
          <span className="post-reading-time" title={`${minutesToRead} min read`}>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <circle cx="8" cy="8" r="6.4" fill="none" stroke="currentColor" strokeWidth="1.3" />
              <path d="M8 4.6V8l2.6 1.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {minutesToRead} min read
          </span>
        </p>
        <div className={`post-tags${usesTanklager ? " tanklager-tags" : ""}`} aria-label="Article tags">
          {tags.map((tag) => <Link href={`/posts?category=${encodeURIComponent(tag)}`} key={tag}>#{tag}</Link>)}
        </div>
        <h1 className={usesTanklager ? "tanklager-title" : undefined}>{post.title}</h1>
        {post.audioUrl?.trim() ? <PostListen src={post.audioUrl.trim()} title={post.title} /> : null}
        <p className="page-intro">{post.excerpt}</p>
        <section className="post-reading-layout">
          {article}
          <div className="post-reading-sidebar">
            <aside className="post-marketplace-card" aria-label="Visit our marketplace">
              <a className="marketplace-promotion" href="https://market.bitt-i.com" target="_blank" rel="noreferrer">
                <img src="https://corporate.target.com/getmedia/d2441ab3-7b0b-4bff-9a6f-15df4690559d/New-Stores_Header_Target.png" alt="Bitt-i Marketplace - Discover unique products and services" width={600} height={400} />
                <div className="marketplay-button">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5v14l11-7z" fill="currentColor" />
                  </svg>
                </div>
                <div className="marketplace-content">
                  <span className="marketplace-title">Why the First Mile is Like Monday Mornings</span>
                  <span className="marketplace-author">Benjamin Thomas</span>
                </div>
              </a>
            </aside>
            <aside className="post-toc-sidebar">
              <ArticleToc headings={headings.length > 0 ? headings.map(({ id, value, level }) => ({ id: id!, value, level })) : []} />
            </aside>
            <ContributeCard />
            <aside className="post-promotion-sidebar" aria-label="Work with Poilian">
              <a className="toc-promotion" href="/contact">
                <img src={authorProfile.promotionImage} alt={`Work with ${authorProfile.name} - Professional services and collaboration`} width={400} height={300} />
                <span>Work with Poilian <b>↗</b></span>
              </a>
            </aside>
          </div>
        </section>
        {similarPosts.length > 0 && <section className="similar-posts" aria-labelledby="similar-posts-title"><p className="section-label">KEEP READING</p><h2 id="similar-posts-title">Similar posts</h2><div>{similarPosts.map((item) => <Link href={`/posts/${item.slug}`} key={item.id}>{item.title} <span aria-hidden="true">↗</span></Link>)}</div></section>}
        
        {/* Table of Contents for Similar Posts */}
        {headings.length > 0 && (
          <section className="similar-posts-contents" aria-labelledby="similar-posts-contents-title">
            <p className="section-label">CONTENTS</p>
            <h2 id="similar-posts-contents-title">Article Contents</h2>
            <div className="similar-posts-contents-list">
              {headings.map((heading) => (
                <a 
                  key={heading.id} 
                  href={`#${heading.id}`}
                  className={`toc-item ${heading.level ? `toc-level-${heading.level}` : ''}`}
                >
                  {heading.value}
                </a>
              ))}
            </div>
          </section>
        )}
        
        {/* Marketplace Podcast Banner */}
        <section className="marketplace-podcast-banner" aria-label="Marketplace Podcasts">
          <div className="podcast-banner-grid">
            <a className="podcast-card" href="https://market.bitt-i.com" target="_blank" rel="noreferrer">
              <div className="podcast-card-image">
                <img src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&h=300&fit=crop" alt="Samantha William - Podcast host and business expert" width={400} height={300} />
                <div className="podcast-play-button">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5v14l11-7z" fill="currentColor" />
                  </svg>
                </div>
              </div>
              <div className="podcast-card-content">
                <div className="podcast-meta">
                  <span className="podcast-duration">38:32</span>
                  <span className="podcast-category">Morning Talk</span>
                </div>
                <h3 className="podcast-title">Running Away From My Problems, and Into Solutions</h3>
                <div className="podcast-author">
                  <span className="author-name">Samantha William</span>
                  <span className="author-info">3 years old - Business topics</span>
                </div>
              </div>
            </a>
            
            <a className="podcast-card" href="https://market.bitt-i.com" target="_blank" rel="noreferrer">
              <div className="podcast-card-image">
                <img src="https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?w=400&h=300&fit=crop" alt="Benjamin Thomas - Technology podcast host and expert" width={400} height={300} />
                <div className="podcast-play-button">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5v14l11-7z" fill="currentColor" />
                  </svg>
                </div>
              </div>
              <div className="podcast-card-content">
                <div className="podcast-meta">
                  <span className="podcast-duration">45:18</span>
                  <span className="podcast-category">Tech Insights</span>
                </div>
                <h3 className="podcast-title">Running, Life, and Learning to Slow Down</h3>
                <div className="podcast-author">
                  <span className="author-name">Benjamin Thomas</span>
                  <span className="author-info">2 years old - Technology</span>
                </div>
              </div>
            </a>
          </div>
        </section>
        
        <PostAuthor author={authorProfile.name} bio={authorProfile.bio} avatarUrl={authorProfile.avatarUrl} />
        <CommentSection postId={post.id} initialComments={comments} />
      </main>
      <InboxNewsletter variant="classic" />
    </>
  );
}
