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
import { CardDetailModal } from "../Card/CardDetailModal";

export function Board({ board }: { board: BoardType }) {
  // selector ที่คำนวณ array (ผ่านฟังก์ชันสำเร็จรูปใน store)
  const lists = useBoardStore(useShallow((state) => state.getLists(board.id)));
  const labels = useBoardStore(useShallow((state) => state.getLabels()));

  // selector ที่ดึง record ดิบๆ — ใช้แทนที่ `state.lists` / `state.cards` เดิมจาก Context
  const listsById = useBoardStore((state) => state.lists);
  const cardsById = useBoardStore((state) => state.cards);

  // action functions
  const addList = useBoardStore((state) => state.addList);
  const reorderLists = useBoardStore((state) => state.reorderLists);
  const reorderCards = useBoardStore((state) => state.reorderCards);
  const moveCard = useBoardStore((state) => state.moveCard);

  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const [addingList, setAddingList] = useState(false);
  const [listDraft, setListDraft] = useState("");

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
              <List key={list.id} list={list} onOpenCard={setOpenCardId} />
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