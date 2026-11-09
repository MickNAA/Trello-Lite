import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { List as ListType } from "../../types";
import { useShallow } from "zustand/react/shallow";
import { useBoardStore } from "../../store/boardStore";
import { Card } from "../Card/Card";
import { InlineEditable } from "../ui/InlineEditable";

interface ListProps {
  list: ListType;
  onOpenCard: (cardId: string) => void;
  searchQuery?: string;
}

export function List({ list, onOpenCard, searchQuery = "" }: ListProps) {
  const cards = useBoardStore(useShallow((state) => state.getCards(list.id)));
  const labels = useBoardStore(useShallow((state) => state.getLabels()));
  const addCard = useBoardStore((state) => state.addCard);
  const renameList = useBoardStore((state) => state.renameList);
  const deleteList = useBoardStore((state) => state.deleteList);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: list.id,
    data: { type: "list", listId: list.id },
  });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredCards = normalizedQuery
    ? cards.filter((card) => card.title.toLowerCase().includes(normalizedQuery))
    : cards;

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
        <InlineEditable
          value={list.title}
          onSave={(v) => renameList(list.id, v)}
          className="font-display text-xs font-bold uppercase tracking-wide text-surface"
        />
        <button
          onClick={() => deleteList(list.id)}
          aria-label={`Delete list ${list.title}`}
          className="rounded-sm px-1 text-xs text-surface/40 hover:bg-line hover:text-surface"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto px-2 py-2" style={{ maxHeight: "calc(100vh - 220px)" }}>
        <SortableContext items={filteredCards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {filteredCards.map((card) => (
            <Card
              key={card.id}
              card={card}
              labels={labels.filter((l) => card.labelIds.includes(l.id))}
              onOpen={() => onOpenCard(card.id)}
            />
          ))}
        </SortableContext>
        {filteredCards.length === 0 && !adding && (
          <p className="px-1 py-2 text-xs italic text-surface/30">
            {cards.length === 0 ? "No cards yet — pin one below." : "No cards match your search."}
          </p>
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
                disabled={draft.trim().length === 0}
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