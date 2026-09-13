"use client";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import type { SitePage } from "@/lib/pages";

type Draft = Omit<SitePage, "id" | "updatedAt"> & { id?: string };
const blank = (): Draft => ({ 
  title: "", 
  slug: "", 
  excerpt: "", 
  content: "<p>Start writing your page here…</p>", 
  status: "published", 
  showInNavigation: true, 
  navigationLabel: "" 
});
const words = (html: string) => html.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;

export function PageManager({ initialPages }: { initialPages: SitePage[] }) {
  const [pages, setPages] = useState(initialPages); 
  const [draft, setDraft] = useState<Draft | null>(null); 
  const [notice, setNotice] = useState(""); 
  const [format, setFormat] = useState("Paragraph"); 
  const [floatingToolbar, setFloatingToolbar] = useState<{ show: boolean; x: number; y: number }>({ 
    show: false, 
    x: 0, 
    y: 0 
  });
  const editor = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savedSelection = useRef<Range | null>(null);

  function edit(page: SitePage) { 
    setNotice(""); 
    setDraft(page); 
    requestAnimationFrame(() => { 
      if (editor.current) editor.current.innerHTML = page.content; 
    }); 
  }
  
  function startNew() { 
    setNotice(""); 
    const next = blank(); 
    setDraft(next); 
    requestAnimationFrame(() => { 
      if (editor.current) editor.current.innerHTML = next.content; 
    }); 
  }
  
  function update(field: keyof Draft, value: string | boolean) { 
    if (!draft) return; 
    setDraft({ ...draft, [field]: value }); 
  }
  
  function sync() { 
    if (!editor.current) return; 
    update("content", editor.current.innerHTML); 
    const node = document.queryCommandValue("formatBlock") || "p"; 
    setFormat(String(node).replace(/[<>]/g, "").toLowerCase() === "p" ? "Paragraph" : String(node).replace(/[<>]/g, "").toUpperCase()); 
  }
  
  function command(action: string, value?: string) { 
    editor.current?.focus(); 
    document.execCommand(action, false, value); 
    sync(); 
  }
  
  function addLink() { 
    const href = prompt("Paste the link URL"); 
    if (href) command("createLink", href); 
  }
  
  function addImage() { 
    const url = prompt("Paste an image URL"); 
    if (url) command("insertHTML", `<img src="${url.replace(/"/g, "&quot;")}" alt="" />`); 
  }
  
  function addTable() { 
    command("insertHTML", "<table><thead><tr><th>Heading</th><th>Heading</th></tr></thead><tbody><tr><td>Text</td><td>Text</td></tr><tr><td>Text</td><td>Text</td></tr></tbody></table><p><br></p>"); 
  }

  // Handle text selection for floating toolbar
  function handleTextSelection() {
    setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setFloatingToolbar({ show: false, x: 0, y: 0 });
        return;
      }

      // Check if selection is within editor
      if (!editor.current?.contains(selection.anchorNode)) {
        setFloatingToolbar({ show: false, x: 0, y: 0 });
        return;
      }

      try {
        const range = selection.getRangeAt(0);
        savedSelection.current = range.cloneRange();
        const rect = range.getBoundingClientRect();

        // Position toolbar above the selection
        setFloatingToolbar({
          show: true,
          x: rect.left + rect.width / 2,
          y: rect.top - 10
        });
      } catch (error) {
        console.error('Error handling text selection:', error);
        setFloatingToolbar({ show: false, x: 0, y: 0 });
      }
    }, 10);
  }

  // Restore selection before executing command
  function restoreSelection() {
    if (savedSelection.current) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(savedSelection.current);
    }
  }

  // Floating toolbar actions
  function floatingAddLink() {
    restoreSelection();
    const href = prompt("Enter link URL:");
    if (href) {
      command("createLink", href);
    }
    setFloatingToolbar({ show: false, x: 0, y: 0 });
  }

  function floatingDownloadPDF() {
    if (!draft?.content) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${draft.title || 'Page'}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
              h1, h2, h3 { color: #333; }
              img { max-width: 100%; height: auto; }
              table { border-collapse: collapse; width: 100%; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>${draft.title}</h1>
            ${draft.content}
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
    setFloatingToolbar({ show: false, x: 0, y: 0 });
  }

  function floatingUploadFile() {
    setFloatingToolbar({ show: false, x: 0, y: 0 });
    fileInputRef.current?.click();
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Create a local object URL
      const url = URL.createObjectURL(file);
      
      restoreSelection();
      if (file.type.startsWith('image/')) {
        command("insertHTML", `<img src="${url}" alt="${file.name}" />`);
      } else {
        command("insertHTML", `<a href="${url}" download="${file.name}">${file.name}</a>`);
      }
      
      setNotice(`File "${file.name}" inserted. Note: Save to upload to server.`);
    } catch (error) {
      setNotice("Failed to upload file");
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function save() { 
    if (!draft || !editor.current) return; 
    const value = { ...draft, content: editor.current.innerHTML, navigationLabel: draft.navigationLabel || draft.title }; 
    setNotice("Saving…"); 
    const response = await fetch("/api/admin/pages", { 
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify(value) 
    }); 
    const result = await response.json(); 
    if (!response.ok) return setNotice(result.error ?? "Could not save this page."); 
    const updated = { ...value, id: draft.id ?? result.id } as SitePage; 
    setPages((list) => list.some((page) => page.id === updated.id) ? list.map((page) => page.id === updated.id ? updated : page) : [...list, updated]); 
    setDraft(updated); 
    setNotice("Saved. Your public page and navigation are updated."); 
  }
  
  async function remove(page: SitePage) { 
    if (!confirm(`Delete "${page.title}"?`)) return; 
    const response = await fetch(`/api/admin/pages/${page.id}`, { method: "DELETE" }); 
    if (response.ok) { 
      setPages((list) => list.filter((item) => item.id !== page.id)); 
      setDraft(null); 
      setNotice("Page deleted."); 
    } else setNotice("Could not delete this page."); 
  }
  
  function keyDown(event: KeyboardEvent<HTMLDivElement>) { 
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") { 
      event.preventDefault(); 
      void save(); 
    } 
  }
  
  useEffect(() => { 
    const saveShortcut = (event: globalThis.KeyboardEvent) => { 
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") { 
        event.preventDefault(); 
        void save(); 
      } 
    }; 
    window.addEventListener("keydown", saveShortcut); 
    return () => window.removeEventListener("keydown", saveShortcut); 
  });
  
  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="section-label">POILIAN CMS</p>
          <h1>Pages</h1>
        </div>
      </header>
      <div className="admin-layout">
        <aside>
          <button className="new-page" onClick={startNew}>+ New page</button>
          <div className="page-list">
            {pages.map((page) => (
              <div className={draft?.id === page.id ? "selected" : ""} key={page.id}>
                <button onClick={() => edit(page)}>
                  <strong>{page.title}</strong>
                  <span>/{page.slug} · {page.status}</span>
                </button>
                <button 
                  className="delete-button" 
                  aria-label={`Delete ${page.title}`} 
                  onClick={() => remove(page)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </aside>
        {draft ? (
          <section className="page-editor">
            <div className="editor-title">
              <div>
                <p className="section-label">{draft.id ? "EDIT PAGE" : "NEW PAGE"}</p>
                <h2>{draft.title || "Untitled page"}</h2>
              </div>
              {draft.slug && (
                <a href={`/pages/${draft.slug}`} target="_blank">View page ↗</a>
              )}
            </div>
            <div className="field-grid">
              <label>
                Page title
                <input 
                  value={draft.title} 
                  onChange={(e) => { 
                    update("title", e.target.value); 
                    if (!draft.slug) update("slug", e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")); 
                  }} 
                  placeholder="Projects" 
                />
              </label>
              <label>
                URL slug
                <input 
                  value={draft.slug} 
                  onChange={(e) => update("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))} 
                  placeholder="projects" 
                />
              </label>
            </div>
            <label>
              Short introduction
              <textarea 
                value={draft.excerpt} 
                onChange={(e) => update("excerpt", e.target.value)} 
                placeholder="A short line shown below the title." 
              />
            </label>
            <div className="editor-card">
              <div className="editor-card-head">
                <strong>Page content</strong>
                <span>Rich text editor • Select text for quick formatting</span>
              </div>
              <div className="so-toolbar" role="toolbar" aria-label="Page formatting">
                <select 
                  aria-label="Text style" 
                  value={format} 
                  onChange={(e) => command("formatBlock", e.target.value === "Paragraph" ? "p" : e.target.value.toLowerCase())}
                >
                  <option>Paragraph</option>
                  <option>H2</option>
                  <option>H3</option>
                </select>
                <i />
                <button title="Bold" onClick={() => command("bold")}><b>B</b></button>
                <button title="Italic" onClick={() => command("italic")}><i>I</i></button>
                <button title="Underline" onClick={() => command("underline")}><u>U</u></button>
                <i />
                <button title="Numbered list" onClick={() => command("insertOrderedList")}>1.</button>
                <button title="Bulleted list" onClick={() => command("insertUnorderedList")}>☷</button>
                <button title="Quote" onClick={() => command("formatBlock", "blockquote")}>❝</button>
                <button title="Code block" onClick={() => command("formatBlock", "pre")}>{"</>"}</button>
                <i />
                <button title="Add link" onClick={addLink}>↗</button>
                <button title="Add image" onClick={addImage}>▧</button>
                <button title="Add table" onClick={addTable}>▦</button>
                <button title="Horizontal rule" onClick={() => command("insertHorizontalRule")}>—</button>
                <i />
                <button title="Undo" onClick={() => command("undo")}>↶</button>
                <button title="Redo" onClick={() => command("redo")}>↷</button>
                <button title="Remove formatting" onClick={() => command("removeFormat")}>Tx</button>
              </div>
              
              {/* Floating toolbar that appears on text selection - Stack Overflow style */}
              {floatingToolbar.show && (
                <div 
                  className="floating-toolbar"
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
                    title="Bold (Ctrl+B)" 
                    onClick={() => { 
                      restoreSelection(); 
                      command("bold"); 
                      setFloatingToolbar({ show: false, x: 0, y: 0 }); 
                    }}
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
                      justifyContent: 'center',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#e8eaed'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M4 2h5.5c1.38 0 2.5 1.12 2.5 2.5S10.88 7 9.5 7H4V2zm0 5h6c1.38 0 2.5 1.12 2.5 2.5S11.38 12 10 12H4V7z"/>
                    </svg>
                  </button>
                  <button 
                    title="Italic (Ctrl+I)" 
                    onClick={() => { 
                      restoreSelection(); 
                      command("italic"); 
                      setFloatingToolbar({ show: false, x: 0, y: 0 }); 
                    }}
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
                      justifyContent: 'center',
                      transition: 'background 0.2s'
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
                    title="Add Link (Ctrl+K)" 
                    onClick={floatingAddLink}
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
                      justifyContent: 'center',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#e8eaed'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"/>
                    </svg>
                  </button>
                  <button 
                    title="Upload File" 
                    onClick={floatingUploadFile}
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
                      justifyContent: 'center',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#e8eaed'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8.5 1.5a.5.5 0 00-1 0v7.793L5.354 7.146a.5.5 0 10-.708.708l3 3a.5.5 0 00.708 0l3-3a.5.5 0 00-.708-.708L8.5 9.293V1.5z"/>
                      <path d="M2 11.5a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5zm0 2a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5z"/>
                    </svg>
                  </button>
                  <button 
                    title="Download as PDF" 
                    onClick={floatingDownloadPDF}
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
                      justifyContent: 'center',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#e8eaed'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M14 4.5V14a2 2 0 01-2 2H4a2 2 0 01-2-2V2a2 2 0 012-2h5.5L14 4.5zm-3 0A1.5 1.5 0 019.5 3V1H4a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V4.5h-2z"/>
                    </svg>
                  </button>
                </div>
              )}
              
              <div 
                className="rich-editor stack-editor" 
                ref={editor} 
                contentEditable 
                suppressContentEditableWarning 
                data-placeholder="Write your page content here…" 
                onInput={sync} 
                onKeyUp={handleTextSelection}
                onMouseUp={handleTextSelection}
                onTouchEnd={handleTextSelection}
                onKeyDown={keyDown} 
                onPaste={(event) => { 
                  event.preventDefault(); 
                  document.execCommand("insertText", false, event.clipboardData.getData("text/plain").replace(/\r\n?/g, "\n")); 
                  sync(); 
                }} 
              />
              
              {/* Hidden file input for file upload */}
              <input 
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              
              <footer className="editor-status">
                <span>{words(draft.content)} words · {Math.max(1, Math.ceil(words(draft.content) / 220))} min read</span>
                <span>💡 Select text for quick formatting toolbar</span>
              </footer>
            </div>
            <div className="editor-options">
              <label>
                <input 
                  type="checkbox" 
                  checked={draft.showInNavigation} 
                  onChange={(e) => update("showInNavigation", e.target.checked)} 
                /> 
                Show in header navigation
              </label>
              <label>
                Navigation label
                <input 
                  value={draft.navigationLabel} 
                  onChange={(e) => update("navigationLabel", e.target.value)} 
                  placeholder={draft.title || "Projects"} 
                />
              </label>
              <label>
                Status
                <select value={draft.status} onChange={(e) => update("status", e.target.value)}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </label>
            </div>
            <footer className="save-bar">
              <span>{notice}</span>
              <button onClick={() => void save()}>Save page</button>
            </footer>
          </section>
        ) : (
          <section className="empty-editor">
            <h2>Create your first dynamic page</h2>
            <p>Select a page to edit it or use "New page" to add Projects, Founder, or anything else.</p>
          </section>
        )}
      </div>
    </main>
  );
}
