import { create } from "zustand";
import { persist } from "zustand/middleware";
import { boardReducer, type BoardAction } from "../context/boardReducer";
import { createSeedState } from "../utils/seed";
import type { BoardState, CardSort, LabelColor } from "../types";

interface BoardStore extends BoardState {
  dispatch: (action: BoardAction) => void;

  // selectors
  getBoards: () => BoardState["boards"][string][];
  getBoard: (boardId: string) => BoardState["boards"][string] | undefined;
  getLists: (boardId: string) => BoardState["lists"][string][];
  getCards: (listId: string) => BoardState["cards"][string][];
  getLabels: () => BoardState["labels"][string][];
  getArchivedCards: (boardId: string) => BoardState["cards"][string][];

  // actions
  addBoard: (title: string) => void;
  renameBoard: (boardId: string, title: string) => void;
  deleteBoard: (boardId: string) => void;

  addList: (boardId: string, title: string) => void;
  renameList: (listId: string, title: string) => void;
  deleteList: (listId: string) => void;
  reorderLists: (boardId: string, startIndex: number, endIndex: number) => void;

  addCard: (listId: string, title: string) => void;
  updateCard: (cardId: string, patch: { title?: string; description?: string; dueDate?: string | undefined }) => void;
  deleteCard: (cardId: string) => void;
  reorderCards: (listId: string, startIndex: number, endIndex: number) => void;
  moveCard: (cardId: string, fromListId: string, toListId: string, toIndex: number) => void;

  addLabel: (name: string, color: LabelColor) => void;
  toggleCardLabel: (cardId: string, labelId: string) => void;

  addChecklistItem: (cardId: string, text: string) => void;
  toggleChecklistItem: (cardId: string, itemId: string) => void;
  deleteChecklistItem: (cardId: string, itemId: string) => void;

  addComment: (cardId: string, text: string) => void;
  deleteComment: (cardId: string, commentId: string) => void;

  archiveCard: (cardId: string) => void;
  restoreCard: (cardId: string) => void;

  duplicateCard: (cardId: string) => void;
  setCardCover: (cardId: string, cover: LabelColor | undefined) => void;

  sortCards: (listId: string, by: CardSort) => void;
}

const STORAGE_KEY = "trello-lite:state";

function migrateLegacyStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !("state" in parsed) && "boards" in parsed) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: parsed, version: 0 }));
    }
  } catch {
    // ignore 
  }
}
migrateLegacyStorage();

export const useBoardStore = create<BoardStore>()(
  persist(
    (set, get) => ({
      ...createSeedState(),

      dispatch: (action) => {
        set((state) => boardReducer(state, action));
      },
      getBoards: () => {
        const state = get();
        return state.boardOrder.map((id) => state.boards[id]).filter(Boolean);
      },
      getBoard: (boardId) => get().boards[boardId],
      getLists: (boardId) => {
        const state = get();
        return (state.boards[boardId]?.listIds ?? []).map((id) => state.lists[id]).filter(Boolean);
      },
      getCards: (listId) => {
        const state = get();
        return (state.lists[listId]?.cardIds ?? [])
          .map((id) => state.cards[id])
          .filter((card) => card && !card.archivedAt);
      },
      getLabels: () => Object.values(get().labels),
      getArchivedCards: (boardId) => {
        const state = get();
        const listIds = state.boards[boardId]?.listIds ?? [];
        return listIds
          .flatMap((listId) => state.lists[listId]?.cardIds ?? [])
          .map((id) => state.cards[id])
          .filter((card) => card && card.archivedAt)
          .sort((a, b) => (b.archivedAt ?? 0) - (a.archivedAt ?? 0)); // archive ล่าสุดอยู่บน
      },

      addBoard: (title) => get().dispatch({ type: "ADD_BOARD", title }),
      renameBoard: (boardId, title) => get().dispatch({ type: "RENAME_BOARD", boardId, title }),
      deleteBoard: (boardId) => get().dispatch({ type: "DELETE_BOARD", boardId }),

      addList: (boardId, title) => get().dispatch({ type: "ADD_LIST", boardId, title }),
      renameList: (listId, title) => get().dispatch({ type: "RENAME_LIST", listId, title }),
      deleteList: (listId) => get().dispatch({ type: "DELETE_LIST", listId }),
      reorderLists: (boardId, startIndex, endIndex) =>
        get().dispatch({ type: "REORDER_LISTS", boardId, startIndex, endIndex }),

      addCard: (listId, title) => get().dispatch({ type: "ADD_CARD", listId, title }),
      updateCard: (cardId, patch) => get().dispatch({ type: "UPDATE_CARD", cardId, patch }),
      deleteCard: (cardId) => get().dispatch({ type: "DELETE_CARD", cardId }),
      reorderCards: (listId, startIndex, endIndex) =>
        get().dispatch({ type: "REORDER_CARDS", listId, startIndex, endIndex }),
      moveCard: (cardId, fromListId, toListId, toIndex) =>
        get().dispatch({ type: "MOVE_CARD", cardId, fromListId, toListId, toIndex }),

      addLabel: (name, color) => get().dispatch({ type: "ADD_LABEL", name, color }),
      toggleCardLabel: (cardId, labelId) => get().dispatch({ type: "TOGGLE_CARD_LABEL", cardId, labelId }),

      addChecklistItem: (cardId, text) => get().dispatch({ type: "ADD_CHECKLIST_ITEM", cardId, text }),
      toggleChecklistItem: (cardId, itemId) => get().dispatch({ type: "TOGGLE_CHECKLIST_ITEM", cardId, itemId }),
      deleteChecklistItem: (cardId, itemId) => get().dispatch({ type: "DELETE_CHECKLIST_ITEM", cardId, itemId }),

      addComment: (cardId, text) => get().dispatch({ type: "ADD_COMMENT", cardId, text }),
      deleteComment: (cardId, commentId) => get().dispatch({ type: "DELETE_COMMENT", cardId, commentId }),

      archiveCard: (cardId) => get().dispatch({ type: "ARCHIVE_CARD", cardId }),
      restoreCard: (cardId) => get().dispatch({ type: "RESTORE_CARD", cardId }),

      duplicateCard: (cardId) => get().dispatch({ type: "DUPLICATE_CARD", cardId }),
      setCardCover: (cardId, cover) => get().dispatch({ type: "SET_CARD_COVER", cardId, cover }),

      sortCards: (listId, by) => get().dispatch({ type: "SORT_CARDS", listId, by }),
    }),
    { name: STORAGE_KEY }
  )
);