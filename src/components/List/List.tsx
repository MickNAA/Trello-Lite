import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { List as ListType } from "../../types";
import { useBoard } from "../../hooks/useBoard";
import { Card } from "../Card/Card";
import { InlineEditable } from "../ui/InlineEditable";

interface ListProps {
  list: ListType;
  onOpenCard: (cardId: string) => void;
}

export function List({ list, onOpenCard }: ListProps) {
  const { getCards, getLabels, addCard, renameList, deleteList } = useBoard();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const cards = getCards(list.id);
  const labels = getLabels();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: list.id,
    data: { type: "list", listId: list.id },
  });

  const style = { transform: CSS.Transform.toString(transform), transition };

  function submitNewCard() {
    const trimmed = draft.trim();
    if (trimmed) addCard(list.id, trimmed);
    setDraft("");
    setAdding(false);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex w-72 shrink-0 flex-col rounded-md bg-bg-soft/80 ring-1 ring-line/50 ${isDragging ? "opacity-40" : ""}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="flex cursor-grab items-center justify-between gap-2 px-3 pb-1 pt-3 active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          <InlineEditable
            value={list.title}
            onSave={(v) => renameList(list.id, v)}
            className="font-display text-xs font-bold uppercase tracking-wide text-surface"
          />
          {cards.length > 0 && (<span 
            className="rounded-full bg-line px-1.5 py-0.5 text-[10px] font-display text-surface/70" >
              {cards.length}
          </span>)}
        </div>
        <button
          onClick={() => deleteList(list.id)}
          aria-label={`Delete list ${list.title}`}
          className="rounded-sm px-1 text-xs text-surface/40 hover:bg-line hover:text-surface"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto px-2 py-2" style={{ maxHeight: "calc(100vh - 220px)" }}>
        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              labels={labels.filter((l) => card.labelIds.includes(l.id))}
              onOpen={() => onOpenCard(card.id)}
            />
          ))}
        </SortableContext>
        {cards.length === 0 && !adding && (
          <p className="px-1 py-2 text-xs italic text-surface/30">No cards yet — pin one below.</p>
        )}
      </div>

      <div className="px-2 pb-3">
        {adding ? (
          <div className="index-card px-2 py-2">
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitNewCard();
                }
                if (e.key === "Escape") {
                  setAdding(false);
                  setDraft("");
                }
              }}
              placeholder="Card title…"
              rows={2}
              className="w-full resize-none bg-transparent text-sm text-ink outline-none"
            />
            <div className="mt-1 flex gap-2">
              <button
                onClick={submitNewCard}
                className="rounded-sm bg-accent px-2 py-1 font-display text-[11px] font-bold uppercase text-ink"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setAdding(false);
                  setDraft("");
                }}
                className="font-display text-[11px] uppercase text-ink-soft"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full rounded-sm px-2 py-1.5 text-left font-display text-xs text-surface/50 hover:bg-line/60 hover:text-surface"
          >
            + Add a card
          </button>
        )}
      </div>
    </div>
  );
}
