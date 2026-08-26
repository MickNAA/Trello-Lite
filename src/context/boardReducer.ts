import { nanoid } from "nanoid";
import type { BoardState, LabelColor } from "../types";
import { insertAt, reorder } from "../utils/reorder";

export type BoardAction =
  | { type: "ADD_BOARD"; title: string }
  | { type: "RENAME_BOARD"; boardId: string; title: string }
  | { type: "DELETE_BOARD"; boardId: string }
  | { type: "ADD_LIST"; boardId: string; title: string }
  | { type: "RENAME_LIST"; listId: string; title: string }
  | { type: "DELETE_LIST"; listId: string }
  | { type: "REORDER_LISTS"; boardId: string; startIndex: number; endIndex: number }
  | { type: "ADD_CARD"; listId: string; title: string }
  | { type: "UPDATE_CARD"; cardId: string; patch: Partial<{ title: string; description: string; dueDate: string | undefined }> }
  | { type: "DELETE_CARD"; cardId: string }
  | { type: "REORDER_CARDS"; listId: string; startIndex: number; endIndex: number }
  | { type: "MOVE_CARD"; cardId: string; fromListId: string; toListId: string; toIndex: number }
  | { type: "ADD_LABEL"; name: string; color: LabelColor }
  | { type: "TOGGLE_CARD_LABEL"; cardId: string; labelId: string };

export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case "ADD_BOARD": {
      const id = nanoid();
      return {
        ...state,
        boardOrder: [...state.boardOrder, id],
        boards: {
          ...state.boards,
          [id]: { id, title: action.title, listIds: [], createdAt: Date.now() },
        },
      };
    }

    case "RENAME_BOARD": {
      const board = state.boards[action.boardId];
      if (!board) return state;
      return {
        ...state,
        boards: { ...state.boards, [board.id]: { ...board, title: action.title } },
      };
    }

    case "DELETE_BOARD": {
      const board = state.boards[action.boardId];
      if (!board) return state;
      const { [action.boardId]: _removed, ...remainingBoards } = state.boards;
      const lists = { ...state.lists };
      const cards = { ...state.cards };
      for (const listId of board.listIds) {
        const list = lists[listId];
        if (list) {
          for (const cardId of list.cardIds) delete cards[cardId];
          delete lists[listId];
        }
      }
      return {
        ...state,
        boards: remainingBoards,
        lists,
        cards,
        boardOrder: state.boardOrder.filter((id) => id !== action.boardId),
      };
    }

    case "ADD_LIST": {
      const board = state.boards[action.boardId];
      if (!board) return state;
      const id = nanoid();
      return {
        ...state,
        lists: { ...state.lists, [id]: { id, boardId: board.id, title: action.title, cardIds: [] } },
        boards: { ...state.boards, [board.id]: { ...board, listIds: [...board.listIds, id] } },
      };
    }

    case "RENAME_LIST": {
      const list = state.lists[action.listId];
      if (!list) return state;
      return { ...state, lists: { ...state.lists, [list.id]: { ...list, title: action.title } } };
    }

    case "DELETE_LIST": {
      const list = state.lists[action.listId];
      if (!list) return state;
      const board = state.boards[list.boardId];
      const cards = { ...state.cards };
      for (const cardId of list.cardIds) delete cards[cardId];
      const { [action.listId]: _removed, ...remainingLists } = state.lists;
      return {
        ...state,
        lists: remainingLists,
        cards,
        boards: board
          ? { ...state.boards, [board.id]: { ...board, listIds: board.listIds.filter((id) => id !== action.listId) } }
          : state.boards,
      };
    }

    case "REORDER_LISTS": {
      const board = state.boards[action.boardId];
      if (!board) return state;
      const listIds = reorder(board.listIds, action.startIndex, action.endIndex);
      return { ...state, boards: { ...state.boards, [board.id]: { ...board, listIds } } };
    }

    case "ADD_CARD": {
      const list = state.lists[action.listId];
      if (!list) return state;
      const id = nanoid();
      return {
        ...state,
        cards: {
          ...state.cards,
          [id]: { id, listId: list.id, title: action.title, labelIds: [], createdAt: Date.now() },
        },
        lists: { ...state.lists, [list.id]: { ...list, cardIds: [...list.cardIds, id] } },
      };
    }

    case "UPDATE_CARD": {
      const card = state.cards[action.cardId];
      if (!card) return state;
      return { ...state, cards: { ...state.cards, [card.id]: { ...card, ...action.patch } } };
    }

    case "DELETE_CARD": {
      const card = state.cards[action.cardId];
      if (!card) return state;
      const list = state.lists[card.listId];
      const { [action.cardId]: _removed, ...remainingCards } = state.cards;
      return {
        ...state,
        cards: remainingCards,
        lists: list
          ? { ...state.lists, [list.id]: { ...list, cardIds: list.cardIds.filter((id) => id !== action.cardId) } }
          : state.lists,
      };
    }

    case "REORDER_CARDS": {
      const list = state.lists[action.listId];
      if (!list) return state;
      const cardIds = reorder(list.cardIds, action.startIndex, action.endIndex);
      return { ...state, lists: { ...state.lists, [list.id]: { ...list, cardIds } } };
    }

    case "MOVE_CARD": {
      const fromList = state.lists[action.fromListId];
      const toList = state.lists[action.toListId];
      const card = state.cards[action.cardId];
      if (!fromList || !toList || !card) return state;

      const fromCardIds = fromList.cardIds.filter((id) => id !== action.cardId);
      const toCardIds =
        action.fromListId === action.toListId
          ? insertAt(fromCardIds, action.cardId, action.toIndex)
          : insertAt(toList.cardIds, action.cardId, action.toIndex);

      return {
        ...state,
        cards: { ...state.cards, [card.id]: { ...card, listId: toList.id } },
        lists: {
          ...state.lists,
          [fromList.id]: { ...fromList, cardIds: action.fromListId === action.toListId ? toCardIds : fromCardIds },
          [toList.id]: { ...toList, cardIds: toCardIds },
        },
      };
    }

    case "ADD_LABEL": {
      const id = nanoid();
      return { ...state, labels: { ...state.labels, [id]: { id, name: action.name, color: action.color } } };
    }

    case "TOGGLE_CARD_LABEL": {
      const card = state.cards[action.cardId];
      if (!card) return state;
      const has = card.labelIds.includes(action.labelId);
      const labelIds = has ? card.labelIds.filter((id) => id !== action.labelId) : [...card.labelIds, action.labelId];
      return { ...state, cards: { ...state.cards, [card.id]: { ...card, labelIds } } };
    }

    default:
      return state;
  }
}
