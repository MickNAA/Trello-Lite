import { useState } from "react";
import { Link } from "react-router-dom";
import { useBoard } from "../hooks/useBoard";

export function Home() {
  const { boards, addBoard, deleteBoard } = useBoard();
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState("");

  function submit() {
    const trimmed = draft.trim();
    if (trimmed) addBoard(trimmed);
    setDraft("");
    setCreating(false);
  }

  return (
    <div className="pegboard min-h-screen px-8 py-10">
      <h1 className="mb-1 font-display text-2xl font-bold text-surface">Your boards</h1>
      <p className="mb-8 text-sm text-surface/50">Pinned to the board, one task at a time.</p>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
        {boards.map((board) => (
          <Link
            key={board.id}
            to={`/board/${board.id}`}
            className="index-card group relative flex h-28 flex-col justify-between p-4 text-ink shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
          >
            <span className="font-display text-sm font-bold leading-snug">{board.title}</span>
            <span className="text-xs text-ink-soft">{board.listIds.length} list{board.listIds.length === 1 ? "" : "s"}</span>
            <button
              onClick={(e) => {
                e.preventDefault();
                if (confirm(`Delete "${board.title}"? This can't be undone.`)) deleteBoard(board.id);
              }}
              aria-label={`Delete ${board.title}`}
              className="absolute right-2 top-2 hidden rounded-sm px-1.5 py-0.5 text-xs text-ink-soft hover:bg-surface-2 group-hover:block"
            >
              ✕
            </button>
          </Link>
        ))}

        {creating ? (
          <div className="index-card flex h-28 flex-col justify-between p-4">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
                if (e.key === "Escape") {
                  setCreating(false);
                  setDraft("");
                }
              }}
              placeholder="Board name…"
              className="bg-transparent text-sm font-medium text-ink outline-none"
            />
            <div className="flex gap-2">
              <button onClick={submit} className="rounded-sm bg-accent px-2 py-1 font-display text-[11px] font-bold uppercase text-ink">
                Create
              </button>
              <button
                onClick={() => {
                  setCreating(false);
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
            onClick={() => setCreating(true)}
            className="flex h-28 flex-col items-center justify-center gap-1 rounded-md ring-1 ring-dashed ring-line text-surface/50 hover:bg-bg-soft hover:text-surface"
          >
            <span className="text-2xl leading-none">+</span>
            <span className="font-display text-xs uppercase tracking-wide">New board</span>
          </button>
        )}
      </div>
    </div>
  );
}
