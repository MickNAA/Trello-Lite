import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card as CardType, Label } from "../../types";
import { LabelPill } from "../ui/LabelPill";

interface CardProps {
  card: CardType;
  labels: Label[];
  onOpen: () => void;
}

function formatDueDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const isOverdue = date < now;
  const label = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return { label, isOverdue };
}

export function Card({ card, labels, onOpen }: CardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: "card", cardId: card.id, listId: card.listId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const due = card.dueDate ? formatDueDate(card.dueDate) : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onOpen}
      className={`index-card group cursor-grab px-3 pb-3 pt-2 text-ink shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-shadow hover:shadow-[0_3px_8px_rgba(0,0,0,0.3)] active:cursor-grabbing ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      {labels.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-1">
          {labels.map((l) => (
            <LabelPill key={l.id} label={l} />
          ))}
        </div>
      )}
      <p className="text-sm font-medium leading-snug">{card.title}</p>
      {due && (
        <span
          className={`mt-2 inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 font-display text-[10px] font-bold uppercase tracking-wide ${
            due.isOverdue ? "bg-rust text-surface" : "bg-surface-2 text-ink-soft"
          }`}
        >
          {due.label}
        </span>
      )}
    </div>
  );
}
