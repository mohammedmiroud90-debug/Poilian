"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getStoredLocale, isLocale, type Locale } from "@/lib/locale";

const excluded =
  "script,style,pre,code,svg,.language-select,.rich-editor,.toolbar,.poilian-locale-copy,.poilian-admin,[data-no-translate]";
const translatableArea = "main, .personal-footer, header.page-header";
function splitWhitespace(value: string) { return { leading: value.match(/^\s*/)?.[0] ?? "", text: value.trim(), trailing: value.match(/\s*$/)?.[0] ?? "" }; }

export function AutoTranslate() {
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    let requestId = 0;
    const sources = new WeakMap<Text, string>();

    const collect = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      let node: Node | null;
      while ((node = walker.nextNode())) {
        const textNode = node as Text;
        const parent = textNode.parentElement;
        if (!parent?.closest(translatableArea) || parent.closest(excluded) || !textNode.nodeValue?.trim()) continue;
        nodes.push(textNode);
      }
      return nodes;
    };

    async function applyLocale(requestedLocale?: Locale) {
      const currentRequest = ++requestId;
      const stored = requestedLocale || getStoredLocale();
      const locale: Locale = isLocale(stored) ? stored : "en";
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";

      const items = collect().map((node) => {
        const source = sources.get(node) ?? node.nodeValue ?? "";
        if (!sources.has(node)) sources.set(node, source);
        node.nodeValue = source;
        return { node, source };
      }).filter(({ source }) => splitWhitespace(source).text);
      if (locale === "en") return;

      // Cloudflare Workers have a finite external-subrequest budget. Small
      // batches keep a long page from losing a whole translation request.
      for (let start = 0; start < items.length; start += 20) {
        const batch = items.slice(start, start + 20);
        try {
          const response = await fetch("/api/translate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ locale, texts: batch.map(({ source }) => splitWhitespace(source).text) }) });
          if (!response.ok) throw new Error("Translation request failed");
          const data = await response.json() as { translations?: string[] };
          (data.translations ?? []).forEach((translation, index) => {
            const item = batch[index];
            if (cancelled || currentRequest !== requestId || !item || !translation) return;
            const { leading, trailing } = splitWhitespace(item.source);
            item.node.nodeValue = `${leading}${translation}${trailing}`;
          });
        } catch {
          /* Preserve the original content when translation is unavailable. */
        }
        if (cancelled || currentRequest !== requestId) return;
      }
    }

    // The root layout stays mounted after App Router navigation, so translate
    // each newly-rendered route as well as the first page.
    const frame = window.requestAnimationFrame(() => void applyLocale());
    const updateLocale = (event: Event) => void applyLocale((event as CustomEvent<Locale>).detail);
    window.addEventListener("poilian-locale-change", updateLocale);
    return () => { cancelled = true; window.cancelAnimationFrame(frame); window.removeEventListener("poilian-locale-change", updateLocale); };
  }, [pathname]);
  return null;
}
