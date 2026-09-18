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
import { createPortal } from "react-dom";
import { EditorIcons } from "@/components/EditorIcons";
import { EditorUrlDialog } from "@/components/EditorUrlDialog";
import { imageEmbedHtml, imageTitleFromFileName, pdfEmbedHtml, toVideoEmbedUrl, videoEmbedHtml } from "@/lib/embed";
import { uploadEditorFile, uploadEditorImage } from "@/lib/upload";

type UrlDialogKind = "link" | "video" | "image" | "pdf" | null;

const CAPTION_PLACEHOLDER = "Add a short caption…";
const FLOAT_BAR_HALF_WIDTH = 170;

function ensureImageFigure(img: HTMLImageElement): HTMLElement {
  const parent = img.parentElement;
  if (parent?.tagName.toLowerCase() === "figure") {
    parent.classList.add("editor-figure");
    let caption = parent.querySelector("figcaption");
    if (!caption) {
      caption = document.createElement("figcaption");
      caption.setAttribute("contenteditable", "true");
      caption.dataset.placeholder = CAPTION_PLACEHOLDER;
      parent.appendChild(caption);
    } else {
      caption.setAttribute("contenteditable", "true");
      if (!caption.dataset.placeholder) caption.dataset.placeholder = CAPTION_PLACEHOLDER;
    }
    return parent;
  }
  const figure = document.createElement("figure");
  figure.className = "editor-figure";
  parent?.insertBefore(figure, img);
  figure.appendChild(img);
  const caption = document.createElement("figcaption");
  caption.setAttribute("contenteditable", "true");
  caption.dataset.placeholder = CAPTION_PLACEHOLDER;
  figure.appendChild(caption);
  return figure;
}

function readImageMeta(img: HTMLImageElement) {
  const figure = img.closest("figure");
  const caption = figure?.querySelector("figcaption")?.textContent?.trim() || "";
  const title = (img.getAttribute("alt") || img.getAttribute("title") || "").trim();
  return {
    title,
    caption: caption === CAPTION_PLACEHOLDER ? "" : caption,
  };
}

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
  variant?: "default" | "medium";
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
    variant = "default",
  },
  ref,
) {
  const editor = useRef<HTMLDivElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const insertRef = useRef<HTMLDivElement>(null);
  const savedSelection = useRef<Range | null>(null);
  const [block, setBlock] = useState("p");
  const [notice, setNotice] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [imageTitle, setImageTitle] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [mode, setMode] = useState<"rich" | "markdown">("rich");
  const [insertOpen, setInsertOpen] = useState(false);
  const [urlDialog, setUrlDialog] = useState<UrlDialogKind>(null);
  const [floatBar, setFloatBar] = useState<{ show: boolean; x: number; y: number; below: boolean }>({
    show: false,
    x: 0,
    y: 0,
    below: false,
  });
  const floatBarVisible = useRef(false);
  const selectionRaf = useRef<number | null>(null);
  const pointerPos = useRef<{ x: number; y: number } | null>(null);
  const isMedium = variant === "medium";

  useImperativeHandle(ref, () => ({
    getHtml: () => {
      const root = editor.current;
      if (!root) return "";
      const clone = root.cloneNode(true) as HTMLElement;
      clone.querySelectorAll("[contenteditable]").forEach((node) => node.removeAttribute("contenteditable"));
      clone.querySelectorAll("figcaption").forEach((caption) => {
        const text = caption.textContent?.trim() || "";
        if (!text || text === CAPTION_PLACEHOLDER) {
          caption.textContent = "";
          caption.removeAttribute("data-placeholder");
        } else {
          caption.removeAttribute("data-placeholder");
        }
      });
      return clone.innerHTML;
    },
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
    function scheduleFloatingToolbar() {
      if (selectionRaf.current != null) cancelAnimationFrame(selectionRaf.current);
      selectionRaf.current = requestAnimationFrame(() => {
        selectionRaf.current = null;
        updateFloatingToolbar();
      });
    }

    function onScrollOrResize() {
      if (floatBarVisible.current) scheduleFloatingToolbar();
    }

    function onPointerMove(event: PointerEvent) {
      if (event.buttons === 0) return;
      const root = editor.current;
      if (!root) return;
      const target = event.target;
      if (!(target instanceof Node) || !root.contains(target)) return;
      pointerPos.current = { x: event.clientX, y: event.clientY };
      scheduleFloatingToolbar();
    }

    function onDocMouseDown(event: MouseEvent) {
      const target = event.target as Node | null;
      if (
        target &&
        (editor.current?.contains(target) ||
          (target instanceof Element &&
            (target.closest(".selection-float-toolbar") ||
              target.closest(".image-settings") ||
              target.closest(".editor-url-overlay"))) ||
          insertRef.current?.contains(target as Node))
      ) {
        return;
      }
      hideFloatingToolbar();
      setInsertOpen(false);
    }

    function onSelectionChange() {
      const root = editor.current;
      const selection = window.getSelection();
      if (!root || !selection?.anchorNode || !root.contains(selection.anchorNode)) {
        if (floatBarVisible.current) hideFloatingToolbar();
        return;
      }
      scheduleFloatingToolbar();
    }

    function onKey(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey) || !editor.current?.contains(document.activeElement)) return;
      if (event.key === "b") { event.preventDefault(); command("bold"); }
      if (event.key === "i") { event.preventDefault(); command("italic"); }
      if (event.key === "k") { event.preventDefault(); link(); }
      if (event.key === "u") { event.preventDefault(); command("underline"); }
    }

    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("selectionchange", onSelectionChange);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("selectionchange", onSelectionChange);
      document.removeEventListener("keydown", onKey);
      if (selectionRaf.current != null) cancelAnimationFrame(selectionRaf.current);
    };
  }, []);

  function hideFloatingToolbar() {
    floatBarVisible.current = false;
    pointerPos.current = null;
    setFloatBar({ show: false, x: 0, y: 0, below: false });
  }

  function updateFloatingToolbar() {
    const selection = window.getSelection();
    const root = editor.current;
    if (!selection || selection.isCollapsed || !root || !selection.anchorNode || !root.contains(selection.anchorNode)) {
      hideFloatingToolbar();
      return;
    }
    if (selection.focusNode && !root.contains(selection.focusNode)) {
      hideFloatingToolbar();
      return;
    }
    try {
      const range = selection.getRangeAt(0);
      savedSelection.current = range.cloneRange();
      const rects = Array.from(range.getClientRects()).filter((r) => r.width > 0 || r.height > 0);
      let rect = rects.length
        ? rects[rects.length - 1]
        : range.getBoundingClientRect();

      // Prefer the selection end nearest the pointer while dragging.
      if (rects.length > 1 && pointerPos.current) {
        let best = rects[0];
        let bestDist = Number.POSITIVE_INFINITY;
        for (const candidate of rects) {
          const cx = candidate.left + candidate.width / 2;
          const cy = candidate.top + candidate.height / 2;
          const dist = Math.hypot(cx - pointerPos.current.x, cy - pointerPos.current.y);
          if (dist < bestDist) {
            bestDist = dist;
            best = candidate;
          }
        }
        rect = best;
      }

      if ((!rect || (rect.width === 0 && rect.height === 0)) && pointerPos.current) {
        rect = new DOMRect(pointerPos.current.x, pointerPos.current.y, 1, 1);
      }
      if (!rect || (rect.width === 0 && rect.height === 0)) {
        hideFloatingToolbar();
        return;
      }

      const pad = 10;
      const x = Math.min(
        Math.max(rect.left + rect.width / 2, pad + FLOAT_BAR_HALF_WIDTH),
        window.innerWidth - pad - FLOAT_BAR_HALF_WIDTH,
      );
      const spaceAbove = rect.top;
      const below = spaceAbove < 56;
      const y = below
        ? Math.min(rect.bottom + 10, window.innerHeight - pad)
        : Math.max(rect.top - 8, pad);

      floatBarVisible.current = true;
      setFloatBar({ show: true, x, y, below });
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

  function selectImage(img: HTMLImageElement | null) {
    if (!img) {
      setSelectedImage(null);
      setImageTitle("");
      setImageCaption("");
      return;
    }
    ensureImageFigure(img);
    const meta = readImageMeta(img);
    setSelectedImage(img);
    setImageTitle(meta.title);
    setImageCaption(meta.caption);
  }

  function applyImageTitle(next: string) {
    if (!selectedImage) return;
    selectedImage.setAttribute("alt", next);
    selectedImage.setAttribute("title", next);
    setImageTitle(next);
    sync();
  }

  function applyImageCaption(next: string) {
    if (!selectedImage) return;
    const figure = ensureImageFigure(selectedImage);
    const caption = figure.querySelector("figcaption");
    if (caption) caption.textContent = next;
    setImageCaption(next);
    sync();
  }

  function link() {
    restoreSelection();
    hideFloatingToolbar();
    setUrlDialog("link");
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
    setInsertOpen(false);
    setUrlDialog("video");
  }

  function imageUrl() {
    setInsertOpen(false);
    setUrlDialog("image");
  }

  function pdfFromUrl() {
    setInsertOpen(false);
    setUrlDialog("pdf");
  }

  function handleUrlConfirm(value: string, secondary?: string) {
    const kind = urlDialog;
    setUrlDialog(null);
    if (!kind) return;
    if (kind === "link") {
      restoreSelection();
      command("createLink", value);
      return;
    }
    if (kind === "video") {
      const embedUrl = toVideoEmbedUrl(value);
      if (!embedUrl) {
        setNotice("That link doesn’t look like a YouTube or Vimeo video.");
        return;
      }
      command("insertHTML", `${videoEmbedHtml(embedUrl)}<p><br></p>`);
      return;
    }
    if (kind === "image") {
      command("insertHTML", `${imageEmbedHtml(value)}<p><br></p>`);
      setNotice("Image inserted. Click it to edit title and caption.");
      return;
    }
    if (kind === "pdf") {
      command("insertHTML", `${pdfEmbedHtml(value, secondary || "View PDF")}<p><br></p>`);
      setNotice("PDF embedded.");
    }
  }

  async function onFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setNotice("Uploading file…");
    try {
      const url = await uploadEditorFile(file);
      if (file.type === "application/pdf") {
        command("insertHTML", `${pdfEmbedHtml(url, file.name)}<p><br></p>`);
      } else {
        const title = imageTitleFromFileName(file.name);
        command("insertHTML", `${imageEmbedHtml(url, title)}<p><br></p>`);
      }
      setNotice("File inserted. Click an image to edit its title and caption.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      setInsertOpen(false);
    }
  }

  async function onImageSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setNotice("Uploading image…");
    try {
      const url = await uploadEditorImage(file);
      const title = imageTitleFromFileName(file.name);
      command("insertHTML", `${imageEmbedHtml(url, title)}<p><br></p>`);
      setNotice("Image uploaded. Click it to edit the title and caption.");
      requestAnimationFrame(() => {
        const imgs = editor.current?.querySelectorAll("img");
        const last = imgs?.[imgs.length - 1];
        if (last instanceof HTMLImageElement) selectImage(last);
      });
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  const words = wordCount(editor.current?.innerHTML || initialHtml);

  const toolbar = (
    <>
          <div className="editor-insert-wrap" ref={insertRef}>
            <button
              type="button"
              className={`editor-insert-btn${insertOpen ? " is-open" : ""}`}
              title="Insert media"
              aria-expanded={insertOpen}
              onClick={() => setInsertOpen((open) => !open)}
            >
              <EditorIcons.Plus />
            </button>
            {insertOpen && (
              <div className="editor-insert-menu" role="menu">
                <button type="button" role="menuitem" onClick={() => { setInsertOpen(false); imageInput.current?.click(); }} disabled={uploading}>Upload image</button>
                <button type="button" role="menuitem" onClick={imageUrl}>Image from URL</button>
                <button type="button" role="menuitem" onClick={video}>YouTube / Vimeo</button>
                <button type="button" role="menuitem" onClick={() => { setInsertOpen(false); fileInput.current?.click(); }} disabled={uploading}>Upload PDF</button>
                <button type="button" role="menuitem" onClick={pdfFromUrl}>PDF from URL</button>
                <button type="button" role="menuitem" onClick={() => { setInsertOpen(false); command("insertHorizontalRule"); }}>Divider</button>
              </div>
            )}
          </div>
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
            <button type="button" title="Underline" onClick={() => command("underline")}>
              <EditorIcons.Underline />
            </button>
          </div>

          <i className="so-toolbar-sep so-toolbar-sep-desktop" />

          <div className="so-toolbar-group so-toolbar-group-desktop">
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
            <button type="button" title="Decrease indent" onClick={() => command("outdent")}>
              <EditorIcons.Outdent />
            </button>
            <button type="button" title="Increase indent" onClick={() => command("indent")}>
              <EditorIcons.Indent />
            </button>
            <button type="button" title="Video embed" onClick={video}>
              <EditorIcons.Video />
            </button>
            <button type="button" title="PDF" onClick={pdfFromUrl}>
              <EditorIcons.Pdf />
            </button>
            <button type="button" title="Horizontal rule" onClick={() => command("insertHorizontalRule")}>
              <EditorIcons.Hr />
            </button>
            <button type="button" title="Clear formatting" onClick={() => command("removeFormat")}>
              <EditorIcons.Clear />
            </button>
          </div>

          <i className="so-toolbar-sep so-toolbar-sep-desktop" />

          <div className="so-toolbar-group so-toolbar-group-desktop">
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

          <div className="so-toolbar-modes so-toolbar-modes-desktop" role="group" aria-label="Editor view">
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
    </>
  );

  return (
    <div className={`rich-text-editor${isMedium ? " is-medium" : ""} ${className}`.trim()}>
      <div className="rich-text-editor-label">
        <strong>
          {label}
          <span aria-hidden="true">*</span>
        </strong>
        <p>{hint}</p>
      </div>

      <div className="editor-card so-editor-card medium-editor-shell">
        <div className="editor-sticky-rail">
          <div className="so-toolbar so-toolbar-rich" role="toolbar" aria-label="Formatting">
            {toolbar}
          </div>
        </div>

        <input
          ref={imageInput}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          hidden
          onChange={(event) => void onImageSelected(event)}
        />
        <input
          ref={fileInput}
          type="file"
          accept="application/pdf,image/png,image/jpeg,image/webp,image/gif,.pdf"
          hidden
          onChange={(event) => void onFileSelected(event)}
        />

        {selectedImage && (
          <div className="image-settings">
            <span>Selected image</span>
            <label className="image-settings-field">
              Title
              <input
                type="text"
                value={imageTitle}
                placeholder="Image title"
                onChange={(event) => applyImageTitle(event.target.value)}
              />
            </label>
            <label className="image-settings-field image-settings-field-wide">
              Caption
              <input
                type="text"
                value={imageCaption}
                placeholder="Short text under the image"
                onChange={(event) => applyImageCaption(event.target.value)}
              />
            </label>
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
                const figure = selectedImage.closest("figure");
                (figure || selectedImage).remove();
                selectImage(null);
                sync();
              }}
            >
              Remove
            </button>
          </div>
        )}

        <EditorUrlDialog
          open={urlDialog !== null}
          title={
            urlDialog === "link"
              ? "Insert link"
              : urlDialog === "video"
                ? "Embed video"
                : urlDialog === "image"
                  ? "Insert image from URL"
                  : "Embed PDF"
          }
          label={
            urlDialog === "link"
              ? "Link URL"
              : urlDialog === "video"
                ? "YouTube or Vimeo URL"
                : urlDialog === "image"
                  ? "Image URL"
                  : "PDF URL"
          }
          placeholder="https://"
          confirmLabel="Insert"
          secondaryLabel={urlDialog === "pdf" ? "PDF title (optional)" : undefined}
          secondaryPlaceholder={urlDialog === "pdf" ? "View PDF" : undefined}
          onConfirm={handleUrlConfirm}
          onCancel={() => setUrlDialog(null)}
        />

        {mode === "markdown" && (
          <div className="so-md-hint" role="note">
            <p>
              Tip: use the style menu for Heading 1–3. Shortcuts — <kbd>Ctrl+B</kbd> bold,{" "}
              <kbd>Ctrl+I</kbd> italic, <kbd>Ctrl+K</kbd> link.
            </p>
          </div>
        )}

        <div
          className={`rich-editor stack-editor so-stack-editor${isMedium ? " medium-editor-body" : ""}`}
          ref={editor}
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          onInput={(event) => {
            sync();
            updateFloatingToolbar();
            if (selectedImage && event.target instanceof HTMLElement && event.target.closest("figcaption")) {
              const text = event.target.textContent?.trim() || "";
              setImageCaption(text === CAPTION_PLACEHOLDER ? "" : text);
            }
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
          onClick={(event) => {
            const target = event.target;
            if (target instanceof HTMLImageElement) {
              selectImage(target);
              return;
            }
            if (target instanceof HTMLElement && target.closest("figcaption")) {
              const img = target.closest("figure")?.querySelector("img");
              if (img instanceof HTMLImageElement) {
                selectImage(img);
                return;
              }
            }
            selectImage(null);
          }}
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

        {floatBar.show &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              className={`selection-float-toolbar${floatBar.below ? " is-below" : ""}`}
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
              <button type="button" title="Underline" onClick={() => floatCommand("underline")}>
                <EditorIcons.Underline />
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
              <i className="selection-float-sep" />
              <button type="button" title="Inline code" onClick={floatCode}>
                <EditorIcons.Code />
              </button>
              <button type="button" title="Link" onClick={link}>
                <EditorIcons.Link />
              </button>
              <button
                type="button"
                title="Bulleted list"
                onClick={() => {
                  restoreSelection();
                  floatCommand("insertUnorderedList");
                }}
              >
                <EditorIcons.Ul />
              </button>
            </div>,
            document.body,
          )}

        <footer className="editor-status">
          <span>
            {words} words · {Math.max(1, Math.ceil(words / 220))} min read
            {notice ? ` · ${notice}` : ""}
          </span>
          <span>{isMedium ? "Toolbar stays visible while you scroll · select text for quick format" : "Select text for the floating format bar"}</span>
        </footer>

        {isMedium && (
          <div className="editor-mobile-dock" role="toolbar" aria-label="Quick formatting">
            <button type="button" title="Insert" onClick={() => setInsertOpen((open) => !open)}><EditorIcons.Plus /></button>
            <button type="button" title="Bold" onClick={() => command("bold")}><EditorIcons.Bold /></button>
            <button type="button" title="Italic" onClick={() => command("italic")}><EditorIcons.Italic /></button>
            <button type="button" title="Link" onClick={link}><EditorIcons.Link /></button>
            <button type="button" title="Image" onClick={() => imageInput.current?.click()} disabled={uploading}><EditorIcons.Image /></button>
            <button type="button" title="Video" onClick={video}><EditorIcons.Video /></button>
          </div>
        )}
      </div>
    </div>
  );
});

export type EditorRef = RefObject<RichTextEditorHandle | null>;
