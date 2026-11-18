import { useEffect, useRef, useState } from "react";
import type { Card, LabelColor } from "../../types";
import { useShallow } from "zustand/react/shallow";
import { useBoardStore } from "../../store/boardStore";
import { LabelPill } from "../ui/LabelPill";
import { ProgressBar } from "../ui/ProgressBar";
import { formatFullTime, formatRelativeTime } from "../../utils/time";

const LABEL_COLORS: LabelColor[] = ["mustard", "rust", "pine", "slate", "plum"];

export function CardDetailModal({ card, onClose }: { card: Card; onClose: () => void }) {
  const labels = useBoardStore(useShallow((state) => state.getLabels()));
  const updateCard = useBoardStore((state) => state.updateCard);
  const deleteCard = useBoardStore((state) => state.deleteCard);
  const archiveCard = useBoardStore((state) => state.archiveCard);
  const toggleCardLabel = useBoardStore((state) => state.toggleCardLabel);
  const addLabel = useBoardStore((state) => state.addLabel);
  const addChecklistItem = useBoardStore((state) => state.addChecklistItem);
  const toggleChecklistItem = useBoardStore((state) => state.toggleChecklistItem);
  const deleteChecklistItem = useBoardStore((state) => state.deleteChecklistItem);
  const addComment = useBoardStore((state) => state.addComment);
  const deleteComment = useBoardStore((state) => state.deleteComment);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const [addingLabel, setAddingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState("");
  const [labelColor, setLabelColor] = useState<LabelColor>("mustard");

  const [itemDraft, setItemDraft] = useState("");
  const [commentDraft, setCommentDraft] = useState("");
  const [showAllActivity, setShowAllActivity] = useState(false);

  const checklist = card.checklist ?? [];
  const doneCount = checklist.filter((item) => item.done).length;

  const comments = [...(card.comments ?? [])].reverse();
  const activity = [...(card.activity ?? [])].reverse();
  const visibleActivity = showAllActivity ? activity : activity.slice(0, 5);

  function submitNewItem() {
    const trimmed = itemDraft.trim();
    if (trimmed) addChecklistItem(card.id, trimmed);
    setItemDraft("");
  }

  function submitComment() {
    const trimmed = commentDraft.trim();
    if (trimmed) addComment(card.id, trimmed);
    setCommentDraft("");
  }

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
            onChange={(e) => updateCard(card.id, { dueDate: e.target.value || undefined })}
            className="rounded-sm border border-line/40 bg-white/60 px-2 py-1 text-sm outline-none focus:border-accent"
          />
        </div>

        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between">
            <p className="font-display text-[11px] font-bold uppercase tracking-wide text-ink-soft">Checklist</p>
            {checklist.length > 0 && (
              <span className="font-display text-[11px] text-ink-soft">
                {doneCount}/{checklist.length}
              </span>
            )}
          </div>

          {checklist.length > 0 && (
            <div className="mb-2">
              <ProgressBar done={doneCount} total={checklist.length} />
            </div>
          )}

          <ul className="flex flex-col gap-1">
            {checklist.map((item) => (
              <li key={item.id} className="group flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggleChecklistItem(card.id, item.id)}
                  className="h-4 w-4 accent-[var(--color-pine)]"
                />
                <span className={`flex-1 text-sm ${item.done ? "text-ink-soft line-through" : ""}`}>{item.text}</span>
                <button
                  onClick={() => deleteChecklistItem(card.id, item.id)}
                  aria-label={`Delete ${item.text}`}
                  className="hidden rounded-sm px-1 text-xs text-ink-soft hover:bg-surface-2 group-hover:block"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-2 flex items-center gap-2">
            <input
              value={itemDraft}
              onChange={(e) => setItemDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitNewItem();
              }}
              placeholder="Add an item…"
              className="flex-1 rounded-sm border border-line/40 bg-white/60 px-2 py-1 text-sm outline-none focus:border-accent"
            />
            <button
              onClick={submitNewItem}
              disabled={itemDraft.trim().length === 0}
              className="rounded-sm bg-accent px-2 py-1 font-display text-[11px] font-bold uppercase text-ink"
            >
              Add
            </button>
          </div>
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

        <div className="mt-4">
          <p className="mb-1 font-display text-[11px] font-bold uppercase tracking-wide text-ink-soft">
            Comments{comments.length > 0 ? ` (${comments.length})` : ""}
          </p>
          <textarea
            value={commentDraft}
            onChange={(e) => setCommentDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                submitComment();
              }
            }}
            placeholder="Write a comment… (Ctrl+Enter to post)"
            rows={2}
            className="w-full resize-none rounded-sm border border-line/40 bg-white/60 px-2 py-1.5 text-sm outline-none focus:border-accent"
          />
          <button
            onClick={submitComment}
            disabled={commentDraft.trim().length === 0}
            className="mt-1 rounded-sm bg-accent px-2 py-1 font-display text-[11px] font-bold uppercase text-ink"
          >
            Comment
          </button>

          <ul className="mt-2 flex flex-col gap-2">
            {comments.map((c) => (
              <li key={c.id} className="group rounded-sm bg-white/50 px-2 py-1.5">
                <p className="whitespace-pre-wrap break-words text-sm">{c.text}</p>
                <div className="mt-0.5 flex items-center justify-between">
                  <span title={formatFullTime(c.createdAt)} className="text-[11px] text-ink-soft">
                    {formatRelativeTime(c.createdAt)}
                  </span>
                  <button
                    onClick={() => deleteComment(card.id, c.id)}
                    aria-label="Delete comment"
                    className="hidden font-display text-[10px] uppercase text-rust hover:underline group-hover:block"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {activity.length > 0 && (
          <div className="mt-4">
            <p className="mb-1 font-display text-[11px] font-bold uppercase tracking-wide text-ink-soft">Activity</p>
            <ul className="flex flex-col gap-1">
              {visibleActivity.map((a) => (
                <li key={a.id} className="flex items-baseline justify-between gap-3 text-xs">
                  <span className="text-ink">{a.text}</span>
                  <span title={formatFullTime(a.createdAt)} className="shrink-0 text-ink-soft">
                    {formatRelativeTime(a.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
            {activity.length > 5 && (
              <button
                onClick={() => setShowAllActivity((prev) => !prev)}
                className="mt-1 font-display text-[11px] uppercase text-ink-soft hover:underline"
              >
                {showAllActivity ? "Show less" : `Show all (${activity.length})`}
              </button>
            )}
          </div>
        )}

        <div className="mt-5 flex items-center gap-4">
          <button
            onClick={() => {
              archiveCard(card.id);
              onClose();
            }}
            className="rounded-sm bg-surface-2 px-2 py-1 font-display text-xs font-bold uppercase tracking-wide text-ink-soft hover:bg-line/20"
          >
            Archive
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete "${card.title}" permanently? Archive keeps it restorable.`)) {
                deleteCard(card.id);
                onClose();
              }
            }}
            className="font-display text-xs font-bold uppercase tracking-wide text-rust hover:underline"
          >
            Delete card
          </button>
        </div>
      </div>
    </div>
  );
}