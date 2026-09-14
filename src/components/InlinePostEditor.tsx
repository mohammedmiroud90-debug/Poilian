"use client";

import { FormEvent, useRef, useState } from "react";
import { toVideoEmbedUrl } from "@/lib/embed";
import { uploadEditorImage } from "@/lib/upload";

type EditablePost = { 
  id: string; 
  className?: string; 
  title: string; 
  excerpt: string; 
  content: string; 
  category: string; 
  author: string 
};

export function InlinePostEditor({ post }: { post: EditablePost }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [content, setContent] = useState(post.content);
  const [notice, setNotice] = useState("");
  const [uploading, setUploading] = useState(false);
  const [floatingToolbar, setFloatingToolbar] = useState<{ show: boolean; x: number; y: number }>({ 
    show: false, 
    x: 0, 
    y: 0 
  });
  const body = useRef<HTMLTextAreaElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const savedSelection = useRef<{ start: number; end: number } | null>(null);

  // Handle text selection for floating toolbar
  function handleTextSelection() {
    setTimeout(() => {
      const textarea = body.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // No selection
      if (start === end) {
        setFloatingToolbar({ show: false, x: 0, y: 0 });
        return;
      }

      // Save selection
      savedSelection.current = { start, end };

      // Calculate position
      const textBeforeCursor = content.substring(0, start);
      const lines = textBeforeCursor.split('\n');
      const currentLine = lines.length;
      
      // Get textarea dimensions
      const rect = textarea.getBoundingClientRect();
      const lineHeight = 20; // Approximate line height
      
      // Position toolbar above selected text
      const x = rect.left + rect.width / 2;
      const y = rect.top + (currentLine * lineHeight) - 10;

      setFloatingToolbar({
        show: true,
        x,
        y
      });
    }, 10);
  }

  function wrap(before: string, after = before, fallback = "text") {
    const input = body.current;
    if (!input) return;
    
    let start = input.selectionStart;
    let end = input.selectionEnd;
    
    // Use saved selection if available
    if (savedSelection.current) {
      start = savedSelection.current.start;
      end = savedSelection.current.end;
    }
    
    const selected = content.slice(start, end) || fallback;
    const next = `${content.slice(0, start)}${before}${selected}${after}${content.slice(end)}`;
    setContent(next);
    
    requestAnimationFrame(() => { 
      input.focus(); 
      input.setSelectionRange(start + before.length, start + before.length + selected.length); 
    });
    
    // Hide floating toolbar after action
    setFloatingToolbar({ show: false, x: 0, y: 0 });
  }

  function insertAtCursor(snippet: string) {
    const input = body.current;
    if (!input) return;
    const start = input.selectionStart ?? content.length;
    const end = input.selectionEnd ?? content.length;
    const next = `${content.slice(0, start)}${snippet}${content.slice(end)}`;
    setContent(next);
    requestAnimationFrame(() => {
      input.focus();
      const cursor = start + snippet.length;
      input.setSelectionRange(cursor, cursor);
    });
  }

  function insertImage() {
    imageInput.current?.click();
  }

  async function onImageSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setNotice("Uploading image…");
    try {
      const url = await uploadEditorImage(file);
      const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
      insertAtCursor(`\n![${alt}](${url})\n`);
      setNotice("Image uploaded and inserted.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function insertVideo() {
    const url = prompt("Paste a YouTube or Vimeo link");
    if (!url) return;
    if (!toVideoEmbedUrl(url)) { alert("That link doesn't look like a YouTube or Vimeo video."); return; }
    insertAtCursor(`\n[video](${url})\n`);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("Saving…");
    const response = await fetch("/api/admin/posts", { 
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ 
        ...post, 
        title, 
        excerpt, 
        content, 
        status: "published" 
      }) 
    });
    const result = await response.json() as { error?: string };
    if (!response.ok) { 
      setNotice(result.error || "Could not save this post."); 
      return; 
    }
    setNotice("Saved. Refreshing the article…");
    window.location.reload();
  }

  return (
    <>
      <button 
        className="inline-edit-trigger" 
        type="button" 
        onClick={() => setOpen(true)} 
        aria-label="Edit this post" 
        title="Edit this post"
      >
        ✎ <span>Edit</span>
      </button>
      
      {open && (
        <div 
          className="inline-editor-overlay" 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="inline-editor-title"
        >
          <form className="inline-post-editor" onSubmit={save}>
            <header>
              <div>
                <p className="section-label">ADMIN EDITOR</p>
                <h2 id="inline-editor-title">Edit post</h2>
              </div>
              <button 
                type="button" 
                className="inline-editor-close" 
                onClick={() => setOpen(false)} 
                aria-label="Close editor"
              >
                ×
              </button>
            </header>
            
            <label>
              Title
              <input 
                value={title} 
                onChange={(event) => setTitle(event.target.value)} 
                required 
              />
            </label>
            
            <label>
              Excerpt
              <textarea 
                value={excerpt} 
                onChange={(event) => setExcerpt(event.target.value)} 
                required 
              />
            </label>
            
            <div className="inline-editor-toolbar" role="toolbar" aria-label="Content formatting">
              <button type="button" onClick={() => wrap("**")}>Bold</button>
              <button type="button" onClick={() => wrap("_")}>Italic</button>
              <button type="button" onClick={() => wrap("## ", "", "Heading")}>Heading</button>
              <button type="button" onClick={() => wrap("- ", "", "List item")}>List</button>
              <button type="button" onClick={() => wrap("> ", "", "Quote")}>Quote</button>
              <button type="button" onClick={() => wrap("[", "](https://)", "Link text")}>Link</button>
              <button type="button" onClick={insertImage} disabled={uploading}>
                {uploading ? "Uploading…" : "Image"}
              </button>
              <button type="button" onClick={insertVideo}>Video</button>
            </div>
            <input
              ref={imageInput}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              hidden
              onChange={(event) => void onImageSelected(event)}
            />
            
            {/* Floating toolbar for selected text */}
            {floatingToolbar.show && (
              <div 
                className="floating-toolbar inline-floating-toolbar"
                style={{
                  position: 'fixed',
                  left: `${floatingToolbar.x}px`,
                  top: `${floatingToolbar.y}px`,
                  transform: 'translate(-50%, -100%)',
                  zIndex: 1000,
                  background: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid #d6d9dc',
                  borderRadius: '6px',
                  padding: '4px',
                  display: 'flex',
                  gap: '2px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.1)',
                  marginBottom: '8px'
                }}
                onMouseDown={(e) => e.preventDefault()}
              >
                <button 
                  type="button"
                  title="Bold" 
                  onClick={() => wrap("**")}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '3px',
                    padding: '6px 8px',
                    cursor: 'pointer',
                    color: '#3c4043',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e8eaed'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M4 2h5.5c1.38 0 2.5 1.12 2.5 2.5S10.88 7 9.5 7H4V2zm0 5h6c1.38 0 2.5 1.12 2.5 2.5S11.38 12 10 12H4V7z"/>
                  </svg>
                </button>
                
                <button 
                  type="button"
                  title="Italic" 
                  onClick={() => wrap("_")}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '3px',
                    padding: '6px 8px',
                    cursor: 'pointer',
                    color: '#3c4043',
                    fontSize: '14px',
                    fontStyle: 'italic',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e8eaed'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M6 2h6l-1 2h-2l-2 8h2l-1 2H2l1-2h2l2-8H5l1-2z"/>
                  </svg>
                </button>
                
                <div style={{ width: '1px', height: '20px', background: '#d6d9dc', margin: '2px 4px' }} />
                
                <button 
                  type="button"
                  title="Add Link" 
                  onClick={() => wrap("[", "](https://)", "Link text")}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '3px',
                    padding: '6px 8px',
                    cursor: 'pointer',
                    color: '#3c4043',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e8eaed'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"/>
                  </svg>
                </button>
                
                <button 
                  type="button"
                  title="Heading" 
                  onClick={() => wrap("## ", "", "Heading")}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '3px',
                    padding: '6px 8px',
                    cursor: 'pointer',
                    color: '#3c4043',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e8eaed'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  H
                </button>
              </div>
            )}
            
            <label>
              Content
              <textarea 
                ref={body} 
                className="inline-editor-content" 
                value={content} 
                onChange={(event) => setContent(event.target.value)}
                onMouseUp={handleTextSelection}
                onKeyUp={handleTextSelection}
                required 
              />
            </label>
            
            <footer>
              <small role="status">{notice}</small>
              <div>
                <button 
                  type="button" 
                  className="inline-editor-cancel" 
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit">Save changes</button>
              </div>
            </footer>
          </form>
        </div>
      )}
    </>
  );
}
