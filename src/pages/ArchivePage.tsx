import { Link, Navigate, useParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { useBoardStore } from "../store/boardStore";
import { formatFullTime, formatRelativeTime } from "../utils/time";

export function ArchivePage() {
  const { boardId } = useParams();

  const board = useBoardStore((state) => (boardId ? state.getBoard(boardId) : undefined));
  const archived = useBoardStore(useShallow((state) => (boardId ? state.getArchivedCards(boardId) : [])));
  const lists = useBoardStore((state) => state.lists);
  const restoreCard = useBoardStore((state) => state.restoreCard);
  const deleteCard = useBoardStore((state) => state.deleteCard);

  if (!board) return <Navigate to="/" replace />;

  return (
    <div className="pegboard min-h-screen">
      <header className="flex items-center gap-4 bg-bg px-6 py-4 ring-1 ring-line/40">
        <Link
          to={`/board/${board.id}`}
          className="font-display text-xs uppercase tracking-wide text-surface/50 hover:text-surface"
        >
          ← {board.title}
        </Link>
        <h1 className="font-display text-base font-bold text-surface">Archived cards</h1>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-6">
        {archived.length === 0 ? (
          <p className="text-sm italic text-surface/40">No archived cards on this board.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {archived.map((card) => (
              <li key={card.id} className="index-card flex items-center justify-between gap-4 px-4 py-3 text-ink">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{card.title}</p>
                  <p className="text-[11px] text-ink-soft">
                    in {lists[card.listId]?.title ?? "unknown list"} · archived{" "}
                    <span title={card.archivedAt ? formatFullTime(card.archivedAt) : undefined}>
                      {card.archivedAt ? formatRelativeTime(card.archivedAt) : ""}
                    </span>
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    onClick={() => restoreCard(card.id)}
                    className="rounded-sm bg-accent px-2 py-1 font-display text-[11px] font-bold uppercase text-ink"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${card.title}" permanently? This can't be undone.`)) deleteCard(card.id);
                    }}
                    className="font-display text-[11px] font-bold uppercase text-rust hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}