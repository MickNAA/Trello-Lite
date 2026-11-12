export type LabelColor = "mustard" | "rust" | "pine" | "slate" | "plum";

export interface Label {
  id: string;
  name: string;
  color: LabelColor;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Card {
  id: string;
  listId: string;
  title: string;
  description?: string;
  dueDate?: string;
  labelIds: string[];
  checklist?: ChecklistItem[]; 
  createdAt: number;
}

export interface List {
  id: string;
  boardId: string;
  title: string;
  cardIds: string[];
}

export interface Board {
  id: string;
  title: string;
  listIds: string[];
  createdAt: number;
}

export interface BoardState {
  boards: Record<string, Board>;
  lists: Record<string, List>;
  cards: Record<string, Card>;
  labels: Record<string, Label>;
  boardOrder: string[];
}
