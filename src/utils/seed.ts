// import { nanoid } from "nanoid";
// import type { BoardState } from "../types";

// export function createSeedState(): BoardState {
//   const boardId = nanoid();
//   const backlogId = nanoid();
//   const inProgressId = nanoid();
//   const doneId = nanoid();

//   const labelBug = { id: nanoid(), name: "Bug", color: "rust" as const };
//   const labelFeature = { id: nanoid(), name: "Feature", color: "pine" as const };
//   const labelDesign = { id: nanoid(), name: "Design", color: "plum" as const };

//   const card1 = {
//     id: nanoid(),
//     listId: backlogId,
//     title: "Sketch the pegboard layout",
//     description: "Rough out the board / list / card hierarchy before touching code.",
//     labelIds: [labelDesign.id],
//     createdAt: Date.now(),
//   };
//   const card2 = {
//     id: nanoid(),
//     listId: backlogId,
//     title: "Wire up drag-and-drop",
//     labelIds: [labelFeature.id],
//     createdAt: Date.now(),
//   };
//   const card3 = {
//     id: nanoid(),
//     listId: inProgressId,
//     title: "Fix card overflow on long titles",
//     labelIds: [labelBug.id],
//     dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
//     createdAt: Date.now(),
//   };
//   const card4 = {
//     id: nanoid(),
//     listId: doneId,
//     title: "Scaffold the project",
//     labelIds: [labelFeature.id],
//     createdAt: Date.now(),
//   };

//   return {
//     boardOrder: [boardId],
//     boards: {
//       [boardId]: {
//         id: boardId,
//         title: "Portfolio Launch",
//         listIds: [backlogId, inProgressId, doneId],
//         createdAt: Date.now(),
//       },
//     },
//     lists: {
//       [backlogId]: { id: backlogId, boardId, title: "Backlog", cardIds: [card1.id, card2.id] },
//       [inProgressId]: { id: inProgressId, boardId, title: "In Progress", cardIds: [card3.id] },
//       [doneId]: { id: doneId, boardId, title: "Done", cardIds: [card4.id] },
//     },
//     cards: {
//       [card1.id]: card1,
//       [card2.id]: card2,
//       [card3.id]: card3,
//       [card4.id]: card4,
//     },
//     labels: {
//       [labelBug.id]: labelBug,
//       [labelFeature.id]: labelFeature,
//       [labelDesign.id]: labelDesign,
//     },
//   };
// }

import type { BoardState } from "../types";

export function createSeedState(): BoardState {
  return {
    boardOrder: [],
    boards: {},
    lists: {},
    cards: {},
    labels: {},
  };
}
