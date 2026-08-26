import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import type { BoardState } from "../types";
import { boardReducer, type BoardAction } from "./boardReducer";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { createSeedState } from "../utils/seed";

interface BoardContextValue {
  state: BoardState;
  dispatch: React.Dispatch<BoardAction>;
}

const BoardContext = createContext<BoardContextValue | null>(null);

const STORAGE_KEY = "trello-lite:state";

function useLocalStorageReducer(): [BoardState, React.Dispatch<BoardAction>] {
  const [stored, setStored] = useLocalStorage<BoardState>(STORAGE_KEY, createSeedState());
  const [state, dispatchRaw] = useReducer(boardReducer, stored);

  const dispatch: React.Dispatch<BoardAction> = (action) => {
    dispatchRaw(action);
  };

  useEffect(() => {
    setStored(state);
  }, [state]);

  return [state, dispatch];
}

export function BoardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useLocalStorageReducer();
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
}

export function useBoardContext() {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error("useBoardContext must be used within a BoardProvider");
  return ctx;
}
