import { useBoardContext } from "../context/BoardContext";
import type { LabelColor } from "../types";

export function useBoard() {
  const { state, dispatch } = useBoardContext();

  return {
    state,
    boards: state.boardOrder.map((id) => state.boards[id]).filter(Boolean),
    getBoard: (boardId: string) => state.boards[boardId],
    getLists: (boardId: string) =>
      (state.boards[boardId]?.listIds ?? []).map((id) => state.lists[id]).filter(Boolean),
    getCards: (listId: string) =>
      (state.lists[listId]?.cardIds ?? []).map((id) => state.cards[id]).filter(Boolean),
    getLabels: () => Object.values(state.labels),

    addBoard: (title: string) => dispatch({ type: "ADD_BOARD", title }),
    renameBoard: (boardId: string, title: string) => dispatch({ type: "RENAME_BOARD", boardId, title }),
    deleteBoard: (boardId: string) => dispatch({ type: "DELETE_BOARD", boardId }),

    addList: (boardId: string, title: string) => dispatch({ type: "ADD_LIST", boardId, title }),
    renameList: (listId: string, title: string) => dispatch({ type: "RENAME_LIST", listId, title }),
    deleteList: (listId: string) => dispatch({ type: "DELETE_LIST", listId }),
    reorderLists: (boardId: string, startIndex: number, endIndex: number) =>
      dispatch({ type: "REORDER_LISTS", boardId, startIndex, endIndex }),

    addCard: (listId: string, title: string) => dispatch({ type: "ADD_CARD", listId, title }),
    updateCard: (cardId: string, patch: { title?: string; description?: string; dueDate?: string | undefined }) =>
      dispatch({ type: "UPDATE_CARD", cardId, patch }),
    deleteCard: (cardId: string) => dispatch({ type: "DELETE_CARD", cardId }),
    reorderCards: (listId: string, startIndex: number, endIndex: number) =>
      dispatch({ type: "REORDER_CARDS", listId, startIndex, endIndex }),
    moveCard: (cardId: string, fromListId: string, toListId: string, toIndex: number) =>
      dispatch({ type: "MOVE_CARD", cardId, fromListId, toListId, toIndex }),

    addLabel: (name: string, color: LabelColor) => dispatch({ type: "ADD_LABEL", name, color }),
    toggleCardLabel: (cardId: string, labelId: string) => dispatch({ type: "TOGGLE_CARD_LABEL", cardId, labelId }),
  };
}
