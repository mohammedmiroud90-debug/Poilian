import { adminNotifyRecipients } from "@/lib/email/config";
import { buildEmailHtml, buildEmailText } from "@/lib/email/template";
import { sendSiteEmail } from "@/lib/email/send";
import { absoluteUrl } from "@/lib/seo";

function notifyAdmin(input: {
  subject: string;
  title: string;
  intro: string;
  rows: { label: string; value: string }[];
  ctaLabel?: string;
  ctaHref?: string;
  tag: string;
  replyTo?: string;
}) {
  const html = buildEmailHtml({
    title: input.title,
    intro: input.intro,
    rows: input.rows,
    ctaLabel: input.ctaLabel,
    ctaHref: input.ctaHref,
    preheader: input.subject,
  });
  const text = buildEmailText({
    title: input.title,
    intro: input.intro,
    rows: input.rows,
  });
  return sendSiteEmail({
    to: adminNotifyRecipients(),
    subject: input.subject,
    html,
    text,
    replyTo: input.replyTo,
    tag: input.tag,
  });
}

export async function notifyContactSubmission(payload: {
  name: string;
  email: string;
  topic: string;
  subject?: string;
  message: string;
}) {
  return notifyAdmin({
    tag: "contact",
    subject: `New contact message from ${payload.name}`,
    title: "New contact submission",
    intro: "Someone sent a message through the contact form.",
    replyTo: payload.email,
    rows: [
      { label: "Name", value: payload.name },
      { label: "Email", value: payload.email },
      { label: "Topic", value: payload.topic },
      ...(payload.subject ? [{ label: "Subject", value: payload.subject }] : []),
      { label: "Message", value: payload.message },
    ],
    ctaLabel: "Open admin",
    ctaHref: absoluteUrl("/admin"),
  });
}

export async function notifyAskSubmission(payload: {
  name: string;
  email?: string;
  title: string;
  topic: string;
  questionPlain: string;
}) {
  return notifyAdmin({
    tag: "ask",
    subject: `New Ask me question: ${payload.title}`,
    title: "New Ask me question",
    intro: "A visitor submitted a question for review.",
    replyTo: payload.email,
    rows: [
      { label: "Name", value: payload.name },
      ...(payload.email ? [{ label: "Email", value: payload.email }] : []),
      { label: "Topic", value: payload.topic },
      { label: "Title", value: payload.title },
      { label: "Question", value: payload.questionPlain },
    ],
    ctaLabel: "Answer in admin",
    ctaHref: absoluteUrl("/admin/ask"),
  });
}

export async function notifyNewComment(payload: {
  author: string;
  content: string;
  postTitle: string;
  postSlug: string;
}) {
  return notifyAdmin({
    tag: "comment",
    subject: `New comment on ${payload.postTitle}`,
    title: "New reader comment",
    intro: "A comment was posted on one of your articles.",
    rows: [
      { label: "Post", value: payload.postTitle },
      { label: "Author", value: payload.author },
      { label: "Comment", value: payload.content },
    ],
    ctaLabel: "Moderate comments",
    ctaHref: absoluteUrl("/admin/comments"),
  });
}

export async function notifyAdminCommentReply(payload: {
  authorName: string;
  replyToAuthor: string;
  content: string;
  postTitle: string;
  postSlug: string;
}) {
  return notifyAdmin({
    tag: "comment-reply",
    subject: `Reply published on ${payload.postTitle}`,
    title: "Admin reply published",
    intro: "Your reply was saved and is visible on the public post thread.",
    rows: [
      { label: "Post", value: payload.postTitle },
      { label: "Replying to", value: payload.replyToAuthor },
      { label: "Published as", value: payload.authorName },
      { label: "Reply", value: payload.content },
    ],
    ctaLabel: "View post",
    ctaHref: absoluteUrl(`/posts/${payload.postSlug}`),
  });
}
