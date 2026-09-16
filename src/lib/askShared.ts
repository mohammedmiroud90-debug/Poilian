export const ASK_TOPICS = [
  { id: "general", label: "General question" },
  { id: "howto", label: "How-to / Troubleshooting" },
  { id: "career", label: "Career advice" },
  { id: "feedback", label: "Feedback / Idea" },
  { id: "other", label: "Something else" },
] as const;

export type AskTopicId = (typeof ASK_TOPICS)[number]["id"];

export function normalizeAskTopic(value: unknown): AskTopicId {
  const id = typeof value === "string" ? value.trim().toLowerCase() : "";
  return ASK_TOPICS.some((topic) => topic.id === id) ? (id as AskTopicId) : "general";
}
