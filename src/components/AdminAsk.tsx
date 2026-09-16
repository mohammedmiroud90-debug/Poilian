"use client";

import { FormEvent, useState } from "react";
import { ASK_TOPICS } from "@/lib/askShared";
import type { AskQuestion } from "@/lib/questions";

export function AdminAsk({ initialEntries }: { initialEntries: AskQuestion[] }) {
  const [entries, setEntries] = useState(initialEntries);
  const [selected, setSelected] = useState<AskQuestion | null>(
    initialEntries.find((item) => item.status === "pending") || null,
  );
  const [answer, setAnswer] = useState(selected?.answer || "");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || saving) return;
    setSaving(true);
    setNotice("Saving…");
    const response = await fetch("/api/admin/ask", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id, answer }),
    });
    const result = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      setNotice(result.error || "Answer could not be saved.");
      setSaving(false);
      return;
    }
    setEntries((current) =>
      current.map((item) =>
        item.id === selected.id
          ? { ...item, answer, status: "answered", answeredAt: new Date().toISOString() }
          : item,
      ),
    );
    setSelected((current) => (current ? { ...current, answer, status: "answered" } : current));
    setNotice("Answer published.");
    setSaving(false);
  }

  async function hide(id: string) {
    const response = await fetch("/api/admin/ask", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "hidden" }),
    });
    if (!response.ok) return;
    setEntries((current) => current.map((item) => (item.id === id ? { ...item, status: "hidden" } : item)));
  }

  return (
    <section className="admin-list-page">
      <div className="admin-page-title">
        <div>
          <p className="section-label">ASK ME</p>
          <h1>Visitor questions</h1>
          <p>Answer a question to publish it on the public Ask me page.</p>
        </div>
      </div>
      <div className="admin-ask-layout">
        <div className="admin-data-list">
          {entries.length === 0 && <p className="admin-empty">No questions yet.</p>}
          {entries.map((item) => (
            <article key={item.id}>
              <button
                type="button"
                onClick={() => {
                  setSelected(item);
                  setAnswer(item.answer);
                  setNotice("");
                }}
              >
                <strong>{item.title || "Untitled question"}</strong>
                <span>
                  {item.name} · {ASK_TOPICS.find((topic) => topic.id === item.topic)?.label || item.topic} ·{" "}
                  {item.status}
                </span>
              </button>
              {item.status !== "hidden" && (
                <button type="button" onClick={() => void hide(item.id)}>
                  Hide
                </button>
              )}
            </article>
          ))}
        </div>
        {selected && (
          <form className="admin-reply-composer" onSubmit={save}>
            <div>
              <span>Answering {selected.name}</span>
            </div>
            <strong className="admin-ask-question-title">{selected.title}</strong>
            <div
              className="rich-post-content admin-ask-question-body"
              dangerouslySetInnerHTML={{ __html: selected.question }}
            />
            <textarea
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="Write a public answer…"
              required
            />
            <footer>
              <small>{notice}</small>
              <button disabled={!answer.trim() || saving}>{saving ? "Saving…" : "Publish answer"}</button>
            </footer>
          </form>
        )}
      </div>
    </section>
  );
}
