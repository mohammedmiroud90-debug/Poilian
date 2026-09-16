"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { BlogHeader } from "@/components/BlogHeader";
import { RichTextEditor, type RichTextEditorHandle } from "@/components/RichTextEditor";
import { ASK_TOPICS } from "@/lib/askShared";
import { plainTextFromHtml } from "@/lib/contactShared";
import type { AskQuestion } from "@/lib/questions";
import type { AuthorProfile } from "@/lib/profile";

function AskHeroArt() {
  return (
    <svg className="ask-hero-art" viewBox="0 0 320 300" role="img" aria-label="A friendly helper ready to answer questions">
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M148 48c0-14 12-25 26-25h28c14 0 26 11 26 25v44H148Z" strokeWidth="3" />
        <path d="M170 23l-7-11m44 11 8-11m-52 38 16-6m44 6-16-6" strokeWidth="2" />
        <path d="M168 52h16m24 0h16M178 68c8 8 20 8 28 0" strokeWidth="3" />
        <circle cx="178" cy="56" r="3" fill="currentColor" />
        <circle cx="208" cy="56" r="3" fill="currentColor" />
        <path d="M160 92h78v94c0 18-15 33-33 33h-12c-18 0-33-15-33-33Z" strokeWidth="3" />
        <path d="M174 112h50v40H174z" strokeWidth="2" />
        <path d="M182 124h12v18h-12zm22 0h12v18h-12zM196 106v6m-14 52h42m-30 0v12m18-12v12" strokeWidth="2" />
        <path d="M159 104c-22 4-38 18-40 42m5-3-14 4 3 14m126-57c23 1 40 15 46 37" strokeWidth="3" />
        <path d="M168 200l-28 36m22-33 20 27m52-30 22 34m-16-31-20 26" strokeWidth="3" />
        <path d="M130 238h54m58 0h-50" strokeWidth="3" />
        <path d="M118 248h32m-6-10-8 10m126 0h32m-10-10 9 10" strokeWidth="2" />
        <path d="M72 78h54c8 0 14 6 14 14v28c0 8-6 14-14 14h-18l-16 14v-14H72c-8 0-14-6-14-14V92c0-8 6-14 14-14z" strokeWidth="3" />
        <path d="M88 108v-8c0-6 4-10 10-10s10 4 10 10v2c0 8-20 8-20 18m10 8v2" strokeWidth="3" />
        <circle cx="98" cy="136" r="2.5" fill="currentColor" />
        <path d="M248 70l28-8 8 28-28 8zM268 78l12-4" strokeWidth="3" />
      </g>
    </svg>
  );
}

function TipIcon({ kind }: { kind: "list" | "search" | "book" | "mail" }) {
  if (kind === "search") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="14" cy="14" r="7" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M19.5 19.5 27 27" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "book") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M7 6.5h12a4 4 0 0 1 4 4v15H11a4 4 0 0 0-4 4V6.5Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="M11 25.5h12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M11 11h8M11 15h8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "mail") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <rect x="5" y="8" width="22" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="m5 10 11 8 11-8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <rect x="7" y="5" width="18" height="22" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M11 11h10M11 16h10M11 21h6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const draftTips = [
  {
    title: "Summarize the problem",
    body: "Include your goal, what a useful answer looks like, and any context that matters.",
    icon: "list" as const,
  },
  {
    title: "Describe what you’ve tried",
    body: "Share the steps already taken so the reply can focus on what is still unclear.",
    icon: "search" as const,
  },
  {
    title: "Give relevant background",
    body: "Add links, tools, or constraints that help someone understand the full picture.",
    icon: "book" as const,
  },
];

export function AskMePage({
  questions,
  profile,
}: {
  questions: AskQuestion[];
  profile: AuthorProfile;
}) {
  const editorRef = useRef<RichTextEditorHandle>(null);
  const [submission, setSubmission] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState<string>(ASK_TOPICS[0].id);
  const [bodyHtml, setBodyHtml] = useState("<p></p>");
  const [editorKey, setEditorKey] = useState(0);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const html = editorRef.current?.getHtml() || bodyHtml;
    const plain = plainTextFromHtml(html);
    if (title.trim().length < 15) {
      setError("Give your question a clear title of at least 15 characters.");
      setSubmission("error");
      return;
    }
    if (plain.length < 20) {
      setError("Add a bit more detail to your question (at least 20 characters).");
      setSubmission("error");
      return;
    }
    const form = new FormData(event.currentTarget);
    setSubmission("sending");
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          website: form.get("website"),
          title,
          topic,
          question: html,
        }),
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Unable to send the question.");
      event.currentTarget.reset();
      setTitle("");
      setBodyHtml("<p></p>");
      setTopic(ASK_TOPICS[0].id);
      setEditorKey((value) => value + 1);
      setSubmission("success");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to send the question.");
      setSubmission("error");
    }
  }

  return (
    <>
      <BlogHeader />
      <main className="content-page ask-page ask-page--rich">
        <header className="ask-hero ask-hero--split">
          <div className="ask-hero-copy">
            <p className="section-label">ASK ME</p>
            <h1>Questions from visitors, answers in public.</h1>
            <p className="page-intro">
              Leave a question for {profile.name}. Thoughtful notes are answered here so others can read them too.
            </p>
            <div className="ask-hero-meta">
              <p>
                Public replies stay on this page. For private matters, use{" "}
                <Link href="/contact">the contact form</Link>.
              </p>
              <p>
                Review usually happens personally — clear titles and detail help the most.
              </p>
            </div>
          </div>
          <AskHeroArt />
        </header>

        <section className="ask-guide" aria-labelledby="ask-guide-title">
          <h2 id="ask-guide-title">Before you ask</h2>
          <p className="ask-guide-intro">
            A short checklist keeps questions easier to answer — and more useful for the next reader.
          </p>
          <ol className="df-resource-list">
            {draftTips.map((tip, index) => (
              <li key={tip.title}>
                <span className="df-resource-index" aria-hidden="true">
                  {index + 1}
                </span>
                <div className="df-resource-copy">
                  <strong>{tip.title}</strong>
                  <span>{tip.body}</span>
                </div>
                <span className="df-resource-icon" aria-hidden="true">
                  <TipIcon kind={tip.icon} />
                </span>
              </li>
            ))}
          </ol>
        </section>

        <div className="ask-layout so-ask-layout">
          <section className="ask-form-card so-ask-card">
            {submission === "success" ? (
              <div className="contact-success" role="status">
                <span aria-hidden="true">✓</span>
                <div>
                  <h2>Question received</h2>
                  <p>It will appear on this page once it has been answered.</p>
                  <button type="button" onClick={() => setSubmission("idle")}>
                    Ask another
                  </button>
                </div>
              </div>
            ) : (
              <form className="contact-form so-ask-form" onSubmit={submit}>
                <div className="so-ask-heading">
                  <h1>Ask question</h1>
                  <span>
                    Required fields <b>*</b>
                  </span>
                </div>

                <label className="so-ask-field">
                  <span>
                    Type<b>*</b>
                  </span>
                  <select value={topic} onChange={(event) => setTopic(event.target.value)}>
                    {ASK_TOPICS.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="so-ask-field">
                  <span>
                    Title<b>*</b>
                  </span>
                  <small>Be specific and imagine you&apos;re asking a question to another person. Min 15 characters.</small>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="e.g. How do you plan a long-form research piece?"
                    minLength={15}
                    maxLength={150}
                    required
                  />
                </label>

                <div className="so-ask-field so-ask-editor-field">
                  <RichTextEditor
                    key={editorKey}
                    ref={editorRef}
                    variant="medium"
                    showHelp={false}
                    label="Body"
                    hint="Include all the information someone would need to understand your question. Min 20 characters."
                    placeholder="Describe the context, what you have tried, and exactly what you would like to know…"
                    initialHtml={bodyHtml}
                    onChange={setBodyHtml}
                    className="ask-rich-editor"
                  />
                </div>

                <div className="contact-field-grid">
                  <label className="so-ask-field">
                    <span>
                      Your name<b>*</b>
                    </span>
                    <input name="name" required autoComplete="name" placeholder="How should I address you?" />
                  </label>
                  <label className="so-ask-field">
                    Email <span>(optional, kept private)</span>
                    <input name="email" type="email" autoComplete="email" placeholder="you@example.com" />
                  </label>
                </div>
                <label className="contact-honeypot" aria-hidden="true">
                  Website
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>

                {error && (
                  <small className="contact-error" role="alert">
                    {error}
                  </small>
                )}
                <button disabled={submission === "sending"}>
                  {submission === "sending" ? "Posting…" : "Post your question"}
                </button>
              </form>
            )}
          </section>

          <aside className="ask-aside so-ask-aside">
            <div className="so-ask-links ask-side-card">
              <p className="so-ask-draft-title">Helpful links</p>
              <ol className="df-resource-list df-resource-list--compact">
                <li>
                  <span className="df-resource-index" aria-hidden="true">
                    1
                  </span>
                  <div className="df-resource-copy">
                    <strong>Contact for private notes</strong>
                    <span>Use the form when the question should stay off the public thread.</span>
                  </div>
                  <Link className="df-resource-icon" href="/contact" aria-label="Open contact form">
                    <TipIcon kind="mail" />
                  </Link>
                </li>
                <li>
                  <span className="df-resource-index" aria-hidden="true">
                    2
                  </span>
                  <div className="df-resource-copy">
                    <strong>Browse published writing</strong>
                    <span>Many answers start from posts already on the site.</span>
                  </div>
                  <Link className="df-resource-icon" href="/posts" aria-label="Browse posts">
                    <TipIcon kind="book" />
                  </Link>
                </li>
              </ol>
              <p className="ask-side-note">
                Questions are reviewed before they appear, and answers are written personally by {profile.name}.
              </p>
            </div>
          </aside>
        </div>

        <section className="ask-thread" aria-labelledby="ask-thread-title">
          <p className="section-label">PUBLIC REPLIES</p>
          <h2 id="ask-thread-title">Questions &amp; answers</h2>
          {questions.length === 0 ? (
            <p className="empty-search">No public answers yet. Be the first to ask.</p>
          ) : (
            <ol className="ask-list">
              {questions.map((item) => (
                <li key={item.id} id={item.id}>
                  <article>
                    <span className="ask-topic-chip">
                      {ASK_TOPICS.find((entry) => entry.id === item.topic)?.label || item.topic}
                    </span>
                    <p className="ask-q-title">{item.title || "Question"}</p>
                    <div className="ask-q ask-q-body">
                      <span>Q</span>
                      <div className="rich-post-content" dangerouslySetInnerHTML={{ __html: item.question }} />
                    </div>
                    <p className="ask-meta">
                      Asked by {item.name}
                      {item.createdAt
                        ? ` · ${new Date(item.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}`
                        : ""}
                    </p>
                    <p className="ask-a">
                      <span>A</span> {item.answer}
                    </p>
                  </article>
                </li>
              ))}
            </ol>
          )}
        </section>
      </main>
    </>
  );
}
