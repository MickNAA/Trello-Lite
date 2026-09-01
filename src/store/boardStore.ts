import { create } from "zustand";
import { persist } from "zustand/middleware";
import { boardReducer, type BoardAction } from "../context/boardReducer";
import { createSeedState } from "../utils/seed";
import type { BoardState, LabelColor} from "../types";

interface BoardStore extends BoardState {
  dispatch: (action: BoardAction) => void;

  // selectors
  getBoards: () => BoardState["boards"][string][];
  getBoard: (boardId: string) => BoardState["boards"][string] | undefined;
  getLists: (boardId: string) => BoardState["lists"][string][];
  getCards: (listId: string) => BoardState["cards"][string][];
  getLabels: () => BoardState["labels"][string][];

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
}

export const useBoardStore = create<BoardStore>()(
  persist(
    (set, get) => ({
      ...createSeedState(),

      dispatch: (action) => {
        set((state) => boardReducer(state, action));
      },
      // Add on 01/09/2026 by Nakrit Start
      getBoards: () => {
        const state = get();
        return state.boardOrder.map((id) => state.boards[id]).filter(Boolean);
      },
      // Add on 01/09/2026 by Nakrit End
      getBoard: (boardId) => get().boards[boardId],
      getLists: (boardId) => {
        const state = get();
        return (state.boards[boardId]?.listIds ?? []).map((id) => state.lists[id]).filter(Boolean);
      },
      getCards: (listId) => {
        const state = get();
        return (state.lists[listId]?.cardIds ?? []).map((id) => state.cards[id]).filter(Boolean);
      },
      getLabels: () => Object.values(get().labels),

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
    }),
    { name: "trello-lite:state" }
  )
);