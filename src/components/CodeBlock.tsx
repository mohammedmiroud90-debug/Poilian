"use client";

import { useState } from "react";

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() { await navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1800); }
  return <pre className="code-block"><button type="button" onClick={copy}>{copied ? "Copied" : "Copy"}</button><code>{code}</code></pre>;
}
