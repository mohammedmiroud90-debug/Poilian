"use client";

import {
  type ChangeEvent,
  type RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
} from "react";
import { EditorIcons } from "@/components/EditorIcons";
import { toVideoEmbedUrl, videoEmbedHtml } from "@/lib/embed";
import { uploadEditorImage } from "@/lib/upload";

export type RichTextEditorHandle = {
  getHtml: () => string;
  setHtml: (html: string) => void;
  focus: () => void;
};

type Props = {
  initialHtml?: string;
  placeholder?: string;
  label?: string;
  hint?: string;
  className?: string;
  onChange?: (html: string) => void;
  showHelp?: boolean;
};

const BLOCK_TAGS = new Set(["p", "h1", "h2", "h3", "blockquote", "pre"]);

function closestBlock(node: Node | null): HTMLElement | null {
  let current: Node | null = node;
  while (current && current !== document.body) {
    if (current instanceof HTMLElement) {
      const tag = current.tagName.toLowerCase();
      if (BLOCK_TAGS.has(tag) || tag === "div" || tag === "li") return current;
    }
    current = current.parentNode;
  }
  return null;
}

function detectBlock(): string {
  const selection = window.getSelection();
  if (!selection?.anchorNode) return "p";
  const block = closestBlock(selection.anchorNode);
  if (!block) return "p";
  const tag = block.tagName.toLowerCase();
  if (BLOCK_TAGS.has(tag)) return tag;
  return "p";
}

function wordCount(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export const RichTextEditor = forwardRef<RichTextEditorHandle, Props>(function RichTextEditor(
  {
    initialHtml = "<p></p>",
    placeholder = "Write your content…",
    label = "Body",
    hint = "Include headings, lists, images and embeds. Formatting is previewed live in the editor.",
    className = "",
    onChange,
    showHelp = true,
  },
  ref,
) {
  const editor = useRef<HTMLDivElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const savedSelection = useRef<Range | null>(null);
  const [block, setBlock] = useState("p");
  const [notice, setNotice] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [mode, setMode] = useState<"rich" | "markdown">("rich");
  const [floatBar, setFloatBar] = useState<{ show: boolean; x: number; y: number }>({
    show: false,
    x: 0,
    y: 0,
  });

  useImperativeHandle(ref, () => ({
    getHtml: () => editor.current?.innerHTML || "",
    setHtml: (html: string) => {
      if (editor.current) editor.current.innerHTML = html || "<p></p>";
      sync();
    },
    focus: () => editor.current?.focus(),
  }));

  useEffect(() => {
    if (editor.current && !editor.current.innerHTML) {
      editor.current.innerHTML = initialHtml || "<p></p>";
    }
    // Only seed once on mount; parent controls later via setHtml.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onScrollOrResize() {
      if (floatBar.show) updateFloatingToolbar();
    }
    function onDocMouseDown(event: MouseEvent) {
      const target = event.target as Node | null;
      if (
        target &&
        (editor.current?.contains(target) ||
          (target instanceof Element && target.closest(".selection-float-toolbar")))
      ) {
        return;
      }
      hideFloatingToolbar();
    }
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    document.addEventListener("mousedown", onDocMouseDown);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
      document.removeEventListener("mousedown", onDocMouseDown);
    };
  }, [floatBar.show]);

  function hideFloatingToolbar() {
    setFloatBar({ show: false, x: 0, y: 0 });
  }

  function updateFloatingToolbar() {
    const selection = window.getSelection();
    const root = editor.current;
    if (!selection || selection.isCollapsed || !root || !selection.anchorNode || !root.contains(selection.anchorNode)) {
      hideFloatingToolbar();
      return;
    }
    try {
      const range = selection.getRangeAt(0);
      savedSelection.current = range.cloneRange();
      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        hideFloatingToolbar();
        return;
      }
      const pad = 8;
      const x = Math.min(Math.max(rect.left + rect.width / 2, pad + 80), window.innerWidth - pad - 80);
      const y = Math.max(rect.top - 10, pad + 40);
      setFloatBar({ show: true, x, y });
      setBlock(detectBlock());
    } catch {
      hideFloatingToolbar();
    }
  }

  function restoreSelection() {
    if (!savedSelection.current) return;
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(savedSelection.current);
  }

  function sync() {
    const html = editor.current?.innerHTML || "";
    onChange?.(html);
    setBlock(detectBlock());
  }

  function command(action: string, value?: string) {
    editor.current?.focus();
    document.execCommand(action, false, value);
    sync();
  }

  function applyBlock(tag: string) {
    const root = editor.current;
    if (!root) return;
    root.focus();

    // Cross-browser formatBlock: try bare tag, then bracketed form.
    let applied = document.execCommand("formatBlock", false, tag);
    if (!applied) applied = document.execCommand("formatBlock", false, `<${tag}>`);

    // Manual fallback when the browser wraps in <div> or ignores headings.
    const selection = window.getSelection();
    const current = closestBlock(selection?.anchorNode || null);
    if (current && current.tagName.toLowerCase() !== tag && root.contains(current)) {
      const next = document.createElement(tag);
      next.innerHTML = current.innerHTML || "<br>";
      current.replaceWith(next);
      const range = document.createRange();
      range.selectNodeContents(next);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }

    setBlock(tag);
    sync();
  }

  function link() {
    restoreSelection();
    const value = prompt("Paste link URL");
    if (value) command("createLink", value);
    else requestAnimationFrame(updateFloatingToolbar);
  }

  function floatCommand(action: string, value?: string) {
    restoreSelection();
    editor.current?.focus();
    document.execCommand(action, false, value);
    sync();
    requestAnimationFrame(updateFloatingToolbar);
  }

  function floatHeading(tag: "h2" | "h3" | "p") {
    restoreSelection();
    applyBlock(tag);
    requestAnimationFrame(updateFloatingToolbar);
  }

  function floatCode() {
    restoreSelection();
    const selected = window.getSelection()?.toString() || savedSelection.current?.toString() || "";
    if (selected) {
      document.execCommand("insertHTML", false, `<code>${selected.replace(/</g, "&lt;")}</code>`);
    } else {
      document.execCommand("insertHTML", false, "<code>code</code>");
    }
    sync();
    requestAnimationFrame(updateFloatingToolbar);
  }

  function insertTable() {
    command(
      "insertHTML",
      `<table><thead><tr><th>Heading</th><th>Heading</th></tr></thead><tbody><tr><td>Cell</td><td>Cell</td></tr><tr><td>Cell</td><td>Cell</td></tr></tbody></table><p><br></p>`,
    );
  }

  function video() {
    const value = prompt("Paste a YouTube or Vimeo link");
    if (!value) return;
    const embedUrl = toVideoEmbedUrl(value);
    if (!embedUrl) {
      setNotice("That link doesn’t look like a YouTube or Vimeo video.");
      return;
    }
    command("insertHTML", `${videoEmbedHtml(embedUrl)}<p><br></p>`);
  }

  async function onImageSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setNotice("Uploading image…");
    try {
      const url = await uploadEditorImage(file);
      command(
        "insertHTML",
        `<img src="${url.replace(/"/g, "&quot;")}" alt="${file.name.replace(/"/g, "&quot;")}" />`,
      );
      setNotice("Image uploaded.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  const words = wordCount(editor.current?.innerHTML || initialHtml);

  return (
    <div className={`rich-text-editor ${className}`.trim()}>
      <div className="rich-text-editor-label">
        <strong>
          {label}
          <span aria-hidden="true">*</span>
        </strong>
        <p>{hint}</p>
      </div>

      <div className="editor-card so-editor-card">
        <div className="so-toolbar so-toolbar-rich" role="toolbar" aria-label="Formatting">
          <div className="so-toolbar-group">
            <label className="so-heading-select">
              <span className="sr-only">Text style</span>
              <EditorIcons.Heading />
              <select
                value={block}
                onChange={(event) => applyBlock(event.target.value)}
                aria-label="Text style"
              >
                <option value="p">Paragraph</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="blockquote">Quote</option>
                <option value="pre">Code block</option>
              </select>
            </label>
            <button type="button" title="Bold" onClick={() => command("bold")}>
              <EditorIcons.Bold />
            </button>
            <button type="button" title="Italic" onClick={() => command("italic")}>
              <EditorIcons.Italic />
            </button>
            <button type="button" title="Strikethrough" onClick={() => command("strikeThrough")}>
              <EditorIcons.Strike />
            </button>
          </div>

          <i className="so-toolbar-sep" />

          <div className="so-toolbar-group">
            <button
              type="button"
              title="Inline code"
              onClick={() => {
                const selection = window.getSelection()?.toString();
                if (selection) command("insertHTML", `<code>${selection.replace(/</g, "&lt;")}</code>`);
                else command("insertHTML", "<code>code</code>");
              }}
            >
              <EditorIcons.Code />
            </button>
            <button type="button" title="Code block" onClick={() => applyBlock("pre")}>
              <EditorIcons.CodeBlock />
            </button>
            <button type="button" title="Link" onClick={link}>
              <EditorIcons.Link />
            </button>
            <button type="button" title="Quote" onClick={() => applyBlock("blockquote")}>
              <EditorIcons.Quote />
            </button>
            <button
              type="button"
              title={uploading ? "Uploading…" : "Upload image"}
              onClick={() => imageInput.current?.click()}
              disabled={uploading}
            >
              <EditorIcons.Image />
            </button>
            <button type="button" title="Insert table" onClick={insertTable}>
              <EditorIcons.Table />
            </button>
          </div>

          <i className="so-toolbar-sep" />

          <div className="so-toolbar-group">
            <button type="button" title="Numbered list" onClick={() => command("insertOrderedList")}>
              <EditorIcons.Ol />
            </button>
            <button type="button" title="Bulleted list" onClick={() => command("insertUnorderedList")}>
              <EditorIcons.Ul />
            </button>
            <button type="button" title="Align left" onClick={() => command("justifyLeft")}>
              <EditorIcons.Align />
            </button>
            <button type="button" title="Video embed" onClick={video}>
              <EditorIcons.Video />
            </button>
            <button type="button" title="Horizontal rule" onClick={() => command("insertHorizontalRule")}>
              <EditorIcons.Hr />
            </button>
            <button type="button" title="Clear formatting" onClick={() => command("removeFormat")}>
              <EditorIcons.Clear />
            </button>
          </div>

          <i className="so-toolbar-sep" />

          <div className="so-toolbar-group">
            <button type="button" title="Undo" onClick={() => command("undo")}>
              <EditorIcons.Undo />
            </button>
            <button type="button" title="Redo" onClick={() => command("redo")}>
              <EditorIcons.Redo />
            </button>
            {showHelp && (
              <a className="so-toolbar-help" href="/admin" title="Editor help">
                <EditorIcons.Help />
              </a>
            )}
          </div>

          <div className="so-toolbar-modes" role="group" aria-label="Editor view">
            <button
              type="button"
              className={mode === "rich" ? "is-active" : ""}
              title="Rich text"
              onClick={() => setMode("rich")}
            >
              <EditorIcons.ViewRich />
            </button>
            <button
              type="button"
              className={mode === "markdown" ? "is-active" : ""}
              title="Markdown hint"
              onClick={() => setMode("markdown")}
            >
              <EditorIcons.ViewMd />
            </button>
          </div>
        </div>

        <input
          ref={imageInput}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          hidden
          onChange={(event) => void onImageSelected(event)}
        />

        {selectedImage && (
          <div className="image-settings">
            <span>Selected image</span>
            <button type="button" onClick={() => { selectedImage.style.width = "50%"; sync(); }}>
              50%
            </button>
            <button type="button" onClick={() => { selectedImage.style.width = "100%"; sync(); }}>
              100%
            </button>
            <button
              type="button"
              onClick={() => {
                selectedImage.style.display = "block";
                selectedImage.style.margin = "18px auto";
                sync();
              }}
            >
              Center
            </button>
            <button
              type="button"
              onClick={() => {
                selectedImage.remove();
                setSelectedImage(null);
                sync();
              }}
            >
              Remove
            </button>
          </div>
        )}

        {mode === "markdown" && (
          <div className="so-md-hint" role="note">
            <p>
              Tip: use the style menu for Heading 1–3. Shortcuts — <kbd>Ctrl+B</kbd> bold,{" "}
              <kbd>Ctrl+I</kbd> italic, <kbd>Ctrl+K</kbd> link.
            </p>
          </div>
        )}

        <div
          className="rich-editor stack-editor so-stack-editor"
          ref={editor}
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          onInput={() => {
            sync();
            updateFloatingToolbar();
          }}
          onKeyUp={() => {
            sync();
            updateFloatingToolbar();
          }}
          onMouseUp={() => {
            sync();
            updateFloatingToolbar();
          }}
          onSelect={updateFloatingToolbar}
          onClick={(event) =>
            setSelectedImage(event.target instanceof HTMLImageElement ? event.target : null)
          }
          onPaste={(event) => {
            event.preventDefault();
            document.execCommand(
              "insertText",
              false,
              event.clipboardData.getData("text/plain").replace(/\r\n?/g, "\n"),
            );
            sync();
          }}
        />

        {floatBar.show && (
          <div
            className="selection-float-toolbar"
            role="toolbar"
            aria-label="Selection formatting"
            style={{ left: floatBar.x, top: floatBar.y }}
            onMouseDown={(event) => event.preventDefault()}
          >
            <button type="button" title="Bold" onClick={() => floatCommand("bold")}>
              <EditorIcons.Bold />
            </button>
            <button type="button" title="Italic" onClick={() => floatCommand("italic")}>
              <EditorIcons.Italic />
            </button>
            <button type="button" title="Strikethrough" onClick={() => floatCommand("strikeThrough")}>
              <EditorIcons.Strike />
            </button>
            <i className="selection-float-sep" />
            <button type="button" title="Heading 2" onClick={() => floatHeading("h2")}>
              <EditorIcons.Heading />
            </button>
            <button type="button" title="Paragraph" onClick={() => floatHeading("p")}>
              <span className="selection-float-p">P</span>
            </button>
            <i className="selection-float-sep" />
            <button type="button" title="Inline code" onClick={floatCode}>
              <EditorIcons.Code />
            </button>
            <button type="button" title="Link" onClick={link}>
              <EditorIcons.Link />
            </button>
            <button
              type="button"
              title="Quote"
              onClick={() => {
                restoreSelection();
                applyBlock("blockquote");
                requestAnimationFrame(updateFloatingToolbar);
              }}
            >
              <EditorIcons.Quote />
            </button>
          </div>
        )}

        <footer className="editor-status">
          <span>
            {words} words · {Math.max(1, Math.ceil(words / 220))} min read
            {notice ? ` · ${notice}` : ""}
          </span>
          <span>Select text for the floating format bar</span>
        </footer>
      </div>
    </div>
  );
});

export type EditorRef = RefObject<RichTextEditorHandle | null>;
