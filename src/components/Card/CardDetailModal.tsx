import { useEffect, useRef, useState } from "react";
import type { Card, LabelColor } from "../../types";
import { useBoardStore } from "../../store/boardStore";
import { LabelPill } from "../ui/LabelPill";

const LABEL_COLORS: LabelColor[] = ["mustard", "rust", "pine", "slate", "plum"];

export function CardDetailModal({ card, onClose }: { card: Card; onClose: () => void }) {
  const labels = useBoardStore((state) => state.getLabels());
  const updateCard = useBoardStore((state) => state.updateCard);
  const deleteCard = useBoardStore((state) => state.deleteCard);
  const toggleCardLabel = useBoardStore((state) => state.toggleCardLabel);
  const addLabel = useBoardStore((state) => state.addLabel);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const [addingLabel, setAddingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState("");
  const [labelColor, setLabelColor] = useState<LabelColor>("mustard");

  function submitNewLabel() {
    const trimmed = labelDraft.trim();
    if (trimmed) addLabel(trimmed, labelColor);
    setLabelDraft("");
    setAddingLabel(false);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-12"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="index-card w-full max-w-lg px-6 pb-6 pt-5 text-ink shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <textarea
            ref={titleRef}
            defaultValue={card.title}
            rows={1}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v && v !== card.title) updateCard(card.id, { title: v });
            }}
            className="w-full resize-none bg-transparent font-display text-lg font-bold leading-snug outline-none"
          />
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-sm px-2 py-1 font-display text-xs text-ink-soft hover:bg-surface-2"
          >
            ESC
          </button>
        </div>

        <div className="mt-4">
          <p className="mb-1 font-display text-[11px] font-bold uppercase tracking-wide text-ink-soft">Labels</p>
          <div className="flex flex-wrap items-center gap-1.5">
            {labels.map((l) => {
              const active = card.labelIds.includes(l.id);
              return (
                <button key={l.id} onClick={() => toggleCardLabel(card.id, l.id)} className={active ? "" : "opacity-40 hover:opacity-70"}>
                  <LabelPill label={l} />
                </button>
              );
            })}
            {labels.length === 0 && !addingLabel && (
              <span className="text-xs italic text-ink-soft">No labels yet.</span>
            )}
            {!addingLabel && (
              <button
                onClick={() => setAddingLabel(true)}
                className="rounded-sm px-2 py-0.5 font-display text-[11px] font-bold uppercase tracking-wide text-ink-soft ring-1 ring-line/40 hover:bg-surface-2"
              >
                + New label
              </button>
            )}
          </div>

          {addingLabel && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input
                autoFocus
                value={labelDraft}
                onChange={(e) => setLabelDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitNewLabel();
                  if (e.key === "Escape") {
                    setAddingLabel(false);
                    setLabelDraft("");
                  }
                }}
                placeholder="Label name…"
                className="rounded-sm border border-line/40 bg-white/60 px-2 py-1 text-sm outline-none focus:border-accent"
              />
              <div className="flex gap-1">
                {LABEL_COLORS.map((c) => (
                  <button
                    key={c}
                    aria-label={c}
                    onClick={() => setLabelColor(c)}
                    className={`h-5 w-5 rounded-full ring-2 ${labelColor === c ? "ring-ink" : "ring-transparent"}`}
                    style={{ backgroundColor: `var(--color-${c === "mustard" ? "accent" : c})` }}
                  />
                ))}
              </div>
              <button
                onClick={submitNewLabel}
                disabled={labelDraft.trim().length === 0}
                className="rounded-sm bg-accent px-2 py-1 font-display text-[11px] font-bold uppercase text-ink"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setAddingLabel(false);
                  setLabelDraft("");
                }}
                className="font-display text-[11px] uppercase text-ink-soft"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="mt-4">
          <p className="mb-1 font-display text-[11px] font-bold uppercase tracking-wide text-ink-soft">Due date</p>
          <input
            type="date"
            defaultValue={card.dueDate ? card.dueDate.slice(0, 10) : ""}
            onChange={(e) => updateCard(card.id, { dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
            className="rounded-sm border border-line/40 bg-white/60 px-2 py-1 text-sm outline-none focus:border-accent"
          />
        </div>

        <div className="mt-4">
          <p className="mb-1 font-display text-[11px] font-bold uppercase tracking-wide text-ink-soft">Description</p>
          <textarea
            defaultValue={card.description ?? ""}
            placeholder="Add more detail…"
            rows={4}
            onBlur={(e) => updateCard(card.id, { description: e.target.value })}
            className="w-full resize-none rounded-sm border border-line/40 bg-white/60 px-2 py-1.5 text-sm outline-none focus:border-accent"
          />
        </div>

        <button
          onClick={() => {
            deleteCard(card.id);
            onClose();
          }}
          className="mt-5 font-display text-xs font-bold uppercase tracking-wide text-rust hover:underline"
        >
          Delete card
        </button>
      </div>
    </div>
  );
}