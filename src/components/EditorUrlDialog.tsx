"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";

type Props = {
  open: boolean;
  title: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  /** Optional second field (e.g. PDF title). */
  secondaryLabel?: string;
  secondaryPlaceholder?: string;
  secondaryDefault?: string;
  onConfirm: (value: string, secondary?: string) => void;
  onCancel: () => void;
};

export function EditorUrlDialog({
  open,
  title,
  label = "URL",
  placeholder = "https://",
  defaultValue = "",
  confirmLabel = "Insert",
  secondaryLabel,
  secondaryPlaceholder,
  secondaryDefault = "",
  onConfirm,
  onCancel,
}: Props) {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [secondary, setSecondary] = useState(secondaryDefault);

  useEffect(() => {
    if (!open) return;
    setValue(defaultValue);
    setSecondary(secondaryDefault);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(timer);
  }, [open, defaultValue, secondaryDefault]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  function submit(event: FormEvent) {
    event.preventDefault();
    const next = value.trim();
    if (!next) return;
    onConfirm(next, secondaryLabel ? secondary.trim() : undefined);
  }

  return (
    <div className="editor-url-overlay" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onCancel();
    }}>
      <form
        className="editor-url-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onSubmit={submit}
      >
        <h3 id={titleId}>{title}</h3>
        <label>
          {label}
          <input
            ref={inputRef}
            type="text"
            inputMode="url"
            autoComplete="off"
            placeholder={placeholder}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            required
          />
        </label>
        {secondaryLabel ? (
          <label>
            {secondaryLabel}
            <input
              type="text"
              autoComplete="off"
              placeholder={secondaryPlaceholder}
              value={secondary}
              onChange={(event) => setSecondary(event.target.value)}
            />
          </label>
        ) : null}
        <div className="editor-url-actions">
          <button type="button" className="editor-url-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="editor-url-confirm">
            {confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
