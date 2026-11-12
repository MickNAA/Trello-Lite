 import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { Board as BoardType } from "../../types";
import { useShallow } from "zustand/react/shallow";
import { useBoardStore } from "../../store/boardStore";
import { List } from "../List/List";
import { Card } from "../Card/Card";
import { LabelPill } from "../ui/LabelPill";
import { CardDetailModal } from "../Card/CardDetailModal";

export function Board({ board }: { board: BoardType }) {

  const lists = useBoardStore(useShallow((state) => state.getLists(board.id)));
  const labels = useBoardStore(useShallow((state) => state.getLabels()));

  const listsById = useBoardStore((state) => state.lists);
  const cardsById = useBoardStore((state) => state.cards);

  const addList = useBoardStore((state) => state.addList);
  const reorderLists = useBoardStore((state) => state.reorderLists);
  const reorderCards = useBoardStore((state) => state.reorderCards);
  const moveCard = useBoardStore((state) => state.moveCard);

  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const [addingList, setAddingList] = useState(false);
  const [listDraft, setListDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [labelFilter, setLabelFilter] = useState<string[]>([]);

  function toggleLabelFilter(labelId: string) {
    setLabelFilter((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]
    );
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragStart(e: DragStartEvent) {
    if (e.active.data.current?.type === "card") setActiveCardId(String(e.active.id));
  }

  function handleDragOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over) return;
    if (active.data.current?.type !== "card") return;

    const activeListId = active.data.current.listId as string;
    const overType = over.data.current?.type;
    const overListId = overType === "card" ? (over.data.current?.listId as string) : (over.id as string);

    if (!overListId || activeListId === overListId) return;

    const overCards = listsById[overListId]?.cardIds ?? [];
    const overIndex = overType === "card" ? overCards.indexOf(String(over.id)) : overCards.length;

    moveCard(String(active.id), activeListId, overListId, overIndex < 0 ? overCards.length : overIndex);
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveCardId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    if (active.data.current?.type === "list") {
      const oldIndex = board.listIds.indexOf(String(active.id));
      const newIndex = board.listIds.indexOf(String(over.id));
      if (oldIndex !== -1 && newIndex !== -1) reorderLists(board.id, oldIndex, newIndex);
      return;
    }

    if (active.data.current?.type === "card") {
      const listId = active.data.current.listId as string;
      const cardIds = listsById[listId]?.cardIds ?? [];
      const oldIndex = cardIds.indexOf(String(active.id));
      const newIndex = cardIds.indexOf(String(over.id));
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        reorderCards(listId, oldIndex, newIndex);
      }
    }
  }

  const activeCard = activeCardId ? cardsById[activeCardId] : null;
  const openCard = openCardId ? cardsById[openCardId] : null;

  function submitNewList() {
    const trimmed = listDraft.trim();
    if (trimmed) addList(board.id, trimmed);
    setListDraft("");
    setAddingList(false);
  }

  return (
    <div className="pegboard min-h-[calc(100vh-64px)] px-6 py-5">
      <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="relative w-full max-w-xs">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search cards…"
          className="w-full rounded-sm border border-line/40 bg-bg-soft px-3 py-1.5 pr-7 text-sm text-surface placeholder:text-surface/40 outline-none focus:border-accent"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-surface/40 hover:text-surface"
          >
            ✕
          </button>
        )}
      </div>

      {labels.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {labels.map((l) => {
            const active = labelFilter.includes(l.id);
            return (
              <button
                key={l.id}
                onClick={() => toggleLabelFilter(l.id)}
                aria-pressed={active}
                className={`rounded-sm transition-opacity ${active ? "ring-2 ring-accent" : "opacity-60 hover:opacity-100"}`}
              >
                <LabelPill label={l} />
              </button>
            );
          })}
          {labelFilter.length > 0 && (
            <button
              onClick={() => setLabelFilter([])}
              className="px-1 text-xs text-surface/50 hover:text-surface"
            >
              Clear
            </button>
          )}
        </div>
      )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex items-start gap-4 overflow-x-auto pb-4">
          <SortableContext items={board.listIds} strategy={horizontalListSortingStrategy}>
            {lists.map((list) => (
              <List key={list.id} list={list} onOpenCard={setOpenCardId} searchQuery={searchQuery} labelFilter={labelFilter} />
            ))}
          </SortableContext>

          <div className="w-72 shrink-0">
            {addingList ? (
              <div className="index-card px-3 py-2">
                <input
                  autoFocus
                  value={listDraft}
                  onChange={(e) => setListDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitNewList();
                    if (e.key === "Escape") {
                      setAddingList(false);
                      setListDraft("");
                    }
                  }}
                  placeholder="List name…"
                  className="w-full bg-transparent text-sm font-medium text-ink outline-none"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={submitNewList}
                    disabled={listDraft.trim().length === 0}
                    className="rounded-sm bg-accent px-2 py-1 font-display text-[11px] font-bold uppercase text-ink"
                  >
                    Add list
                  </button>
                  <button
                    onClick={() => {
                      setAddingList(false);
                      setListDraft("");
                    }}
                    className="font-display text-[11px] uppercase text-ink-soft"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingList(true)}
                className="w-full rounded-md px-3 py-2.5 text-left font-display text-xs uppercase tracking-wide text-surface/50 ring-1 ring-line/50 hover:bg-bg-soft hover:text-surface"
              >
                + Add another list
              </button>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeCard ? (
            <Card
              card={activeCard}
              labels={labels.filter((l) => activeCard.labelIds.includes(l.id))}
              onOpen={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {openCard && <CardDetailModal card={openCard} onClose={() => setOpenCardId(null)} />}
    </div>
  );
}