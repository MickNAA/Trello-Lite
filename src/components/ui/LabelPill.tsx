import type { Label } from "../../types";

const COLOR_MAP: Record<Label["color"], string> = {
  mustard: "bg-accent text-ink",
  rust: "bg-rust text-surface",
  pine: "bg-pine text-surface",
  slate: "bg-slate text-surface",
  plum: "bg-plum text-surface",
};

export function LabelPill({ label, onClick }: { label: Label; onClick?: () => void }) {
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      onClick={onClick}
      className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-display font-bold uppercase tracking-wide ${COLOR_MAP[label.color]}`}
    >
      {label.name}
    </Tag>
  );
}
