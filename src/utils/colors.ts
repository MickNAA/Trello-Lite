import type { LabelColor } from "../types";

export const COLOR_BG: Record<LabelColor, string> = {
  mustard: "bg-accent",
  rust: "bg-rust",
  pine: "bg-pine",
  slate: "bg-slate",
  plum: "bg-plum",
};

export const COLOR_OPTIONS: LabelColor[] = ["mustard", "rust", "pine", "slate", "plum"];