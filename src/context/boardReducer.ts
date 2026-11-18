import { nanoid } from "nanoid";
import type { BoardState, Card, LabelColor } from "../types";
import { insertAt, reorder } from "../utils/reorder";

const MAX_ACTIVITY = 50;

// เติมบันทึกกิจกรรม 1 รายการลงการ์ด (pure: คืนการ์ดใหม่ ไม่แก้ของเดิม) เก็บแค่ 50 รายการล่าสุด
function withActivity(card: Card, text: string): Card {
  const entry = { id: nanoid(), text, createdAt: Date.now() };
  const activity = [...(card.activity ?? []), entry].slice(-MAX_ACTIVITY);
  return { ...card, activity };
}

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
  | { type: "TOGGLE_CARD_LABEL"; cardId: string; labelId: string }
  | { type: "ADD_CHECKLIST_ITEM"; cardId: string; text: string }
  | { type: "TOGGLE_CHECKLIST_ITEM"; cardId: string; itemId: string }
  | { type: "DELETE_CHECKLIST_ITEM"; cardId: string; itemId: string }
  | { type: "ADD_COMMENT"; cardId: string; text: string }
  | { type: "DELETE_COMMENT"; cardId: string; commentId: string }
  | { type: "ARCHIVE_CARD"; cardId: string }
  | { type: "RESTORE_CARD"; cardId: string };

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
      const newCard = withActivity(
        { id, listId: list.id, title: action.title, labelIds: [], createdAt: Date.now() },
        `Created in "${list.title}"`
      );
      return {
        ...state,
        cards: { ...state.cards, [id]: newCard },
        lists: { ...state.lists, [list.id]: { ...list, cardIds: [...list.cardIds, id] } },
      };
    }

    case "UPDATE_CARD": {
      const card = state.cards[action.cardId];
      if (!card) return state;
      let updated: Card = { ...card, ...action.patch };

      // บันทึกเฉพาะสิ่งที่เปลี่ยนจริง (ฟอร์มบางช่องยิง update ทุกครั้งที่ blur แม้ค่าเท่าเดิม)
      if (action.patch.title !== undefined && action.patch.title !== card.title) {
        updated = withActivity(updated, `Renamed to "${action.patch.title}"`);
      }
      if ("dueDate" in action.patch && action.patch.dueDate !== card.dueDate) {
        updated = withActivity(
          updated,
          action.patch.dueDate ? `Set due date to ${action.patch.dueDate.slice(0, 10)}` : "Removed due date"
        );
      }
      if (action.patch.description !== undefined && action.patch.description !== (card.description ?? "")) {
        updated = withActivity(updated, "Edited description");
      }

      return { ...state, cards: { ...state.cards, [card.id]: updated } };
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

      // ย้ายข้ามลิสต์เท่านั้นถึงจะบันทึก (จัดลำดับใน list เดิมไม่นับ)
      const moved = { ...card, listId: toList.id };
      const nextCard =
        action.fromListId === action.toListId
          ? moved
          : withActivity(moved, `Moved from "${fromList.title}" to "${toList.title}"`);

      return {
        ...state,
        cards: { ...state.cards, [card.id]: nextCard },
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
      const labelName = state.labels[action.labelId]?.name ?? "label";
      const updated = withActivity({ ...card, labelIds }, `${has ? "Removed" : "Added"} label "${labelName}"`);
      return { ...state, cards: { ...state.cards, [card.id]: updated } };
    }

    case "ADD_CHECKLIST_ITEM": {
      const card = state.cards[action.cardId];
      if (!card) return state;
      const item = { id: nanoid(), text: action.text, done: false };
      const checklist = [...(card.checklist ?? []), item];
      const updated = withActivity({ ...card, checklist }, `Added checklist item "${action.text}"`);
      return { ...state, cards: { ...state.cards, [card.id]: updated } };
    }

    case "TOGGLE_CHECKLIST_ITEM": {
      const card = state.cards[action.cardId];
      if (!card) return state;
      const target = (card.checklist ?? []).find((item) => item.id === action.itemId);
      if (!target) return state;
      const checklist = (card.checklist ?? []).map((item) =>
        item.id === action.itemId ? { ...item, done: !item.done } : item
      );
      const updated = withActivity(
        { ...card, checklist },
        target.done ? `Marked "${target.text}" as not done` : `Completed "${target.text}"`
      );
      return { ...state, cards: { ...state.cards, [card.id]: updated } };
    }

    case "DELETE_CHECKLIST_ITEM": {
      const card = state.cards[action.cardId];
      if (!card) return state;
      const target = (card.checklist ?? []).find((item) => item.id === action.itemId);
      if (!target) return state;
      const checklist = (card.checklist ?? []).filter((item) => item.id !== action.itemId);
      const updated = withActivity({ ...card, checklist }, `Removed checklist item "${target.text}"`);
      return { ...state, cards: { ...state.cards, [card.id]: updated } };
    }

    case "ADD_COMMENT": {
      const card = state.cards[action.cardId];
      if (!card) return state;
      const comment = { id: nanoid(), text: action.text, createdAt: Date.now() };
      const comments = [...(card.comments ?? []), comment];
      const updated = withActivity({ ...card, comments }, "Added a comment");
      return { ...state, cards: { ...state.cards, [card.id]: updated } };
    }

    case "DELETE_COMMENT": {
      const card = state.cards[action.cardId];
      if (!card) return state;
      const comments = (card.comments ?? []).filter((c) => c.id !== action.commentId);
      const updated = withActivity({ ...card, comments }, "Deleted a comment");
      return { ...state, cards: { ...state.cards, [card.id]: updated } };
    }

    case "ARCHIVE_CARD": {
      const card = state.cards[action.cardId];
      if (!card || card.archivedAt) return state;
      // ไม่เอา id ออกจาก list.cardIds: การ์ดยังอยู่ตำแหน่งเดิม แค่ถูกซ่อน restore แล้วกลับที่เดิมพอดี
      const updated = withActivity({ ...card, archivedAt: Date.now() }, "Archived this card");
      return { ...state, cards: { ...state.cards, [card.id]: updated } };
    }

    case "RESTORE_CARD": {
      const card = state.cards[action.cardId];
      if (!card || !card.archivedAt) return state;
      const { archivedAt: _removed, ...rest } = card;
      const updated = withActivity(rest, "Restored this card");
      return { ...state, cards: { ...state.cards, [card.id]: updated } };
    }

    default:
      return state;
  }
}