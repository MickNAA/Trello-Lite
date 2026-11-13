interface ProgressBarProps {
  done: number;
  total: number;
  heightClass?: string;
}

export function ProgressBar({ done, total, heightClass = "h-1.5" }: ProgressBarProps) {
  if (total === 0) return null;

  const percent = Math.round((done / total) * 100);
  const complete = percent === 100;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className={`${heightClass} w-full overflow-hidden rounded-full bg-ink/10`}
    >
      <div
        className={`h-full transition-all ${complete ? "bg-pine" : "bg-accent"}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}