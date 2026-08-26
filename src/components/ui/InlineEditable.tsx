import { useRef, useState, type KeyboardEvent } from "react";

interface InlineEditableProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  as?: "input" | "textarea";
  placeholder?: string;
}

export function InlineEditable({ value, onSave, className = "", as = "input", placeholder }: InlineEditableProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  function commit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    else setDraft(value);
    setEditing(false);
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && as === "input") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      setDraft(value);
      setEditing(false);
    }
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraft(value);
          setEditing(true);
          requestAnimationFrame(() => ref.current?.focus());
        }}
        className={`text-left ${className}`}
      >
        {value || <span className="text-ink-soft italic">{placeholder}</span>}
      </button>
    );
  }

  const Field = as === "textarea" ? "textarea" : "input";

  return (
    <Field
      ref={ref as never}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={`w-full resize-none rounded-sm border border-accent bg-white/60 px-1 py-0.5 outline-none ${className}`}
    />
  );
}
