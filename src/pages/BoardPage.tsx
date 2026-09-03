import { Link, Navigate, useParams } from "react-router-dom";
import { useBoardStore } from "../store/boardStore";
import { Board } from "../components/Board/Board";
import { InlineEditable } from "../components/ui/InlineEditable";

export function BoardPage() {
  const { boardId } = useParams();

  const board = useBoardStore((state) => (boardId ? state.getBoard(boardId) : undefined));
  const renameBoard = useBoardStore((state) => state.renameBoard);

  if (!board) return <Navigate to="/" replace />;

  return (
    <div>
      <header className="flex items-center gap-4 bg-bg px-6 py-4 ring-1 ring-line/40">
        <Link to="/" className="font-display text-xs uppercase tracking-wide text-surface/50 hover:text-surface">
          ← Boards
        </Link>
        <InlineEditable
          value={board.title}
          onSave={(v) => renameBoard(board.id, v)}
          className="font-display text-base font-bold text-surface"
        />
      </header>
      <Board board={board} />
    </div>
  );
}