# Trello-Lite

A drag-and-drop task board (boards → lists → cards) built to demonstrate intermediate-to-advanced React patterns for a portfolio piece.

**Visual concept:** a physical corkboard/pegboard, with cards styled as index cards (torn top edge) pinned in place. This is a deliberate design choice, not decoration — the metaphor of a kanban board comes from real corkboards, and it gives the drag-and-drop interaction a physical, tactile feel.

## Stack

- React 19 + TypeScript, scaffolded with Vite
- React Router (multi-board navigation)
- `@dnd-kit` for accessible drag-and-drop (keyboard support included)
- Tailwind CSS v4 for styling
- `nanoid` for IDs
- State persisted to `localStorage` (no backend required to run)

## Architecture notes

**Normalized state shape.** Boards, lists, and cards are stored as `Record<id, entity>` maps rather than nested arrays (see `src/types/index.ts`). Ordering is tracked separately via `listIds` / `cardIds` arrays on the parent entity. This is what makes drag-and-drop reordering and cross-list moves cheap — you're moving IDs around, not deep-cloning nested trees.

**State management.** A single `useReducer` (`src/context/boardReducer.ts`) handles every mutation as an explicit, typed action. `BoardContext` wires that reducer to `localStorage` so state survives a refresh. `useBoard()` is the app-facing hook — it wraps the context with selectors (`getLists`, `getCards`, ...) and action creators, so components never dispatch raw actions.

**Drag-and-drop.** `Board.tsx` owns a single `DndContext`. Lists are sortable horizontally; each list has a nested `SortableContext` for its cards, so cards can reorder within a list or move across lists. Cross-list moves happen live in `onDragOver` (so the card visibly jumps to the new list while dragging); `onDragEnd` commits the final ordering.

## Getting started

```bash
npm install
npm run dev
```

## Where to take this next

- Swap the `localStorage` persistence layer for Supabase (Postgres + auth) — the reducer/action shape barely has to change, you'd just dispatch after a Supabase write and subscribe to realtime updates.
- Multi-user boards with presence indicators.
- Checklists inside cards, activity log, keyboard shortcuts for power users.

## Deploying

This is a static Vite app — `npm run build` outputs to `dist/`, deployable as-is to Vercel, Netlify, or GitHub Pages.
