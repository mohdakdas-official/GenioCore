export const ProgressMetric = ({
  label,
  value,
  max = 100,
  color = "var(--primary)",
}) => {
  const pct = Math.min(100, Math.round((value / max) * 100));

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <span className="text-text-secondary font-medium">{label}</span>
        <span className="font-mono text-text-primary font-semibold">
          {pct}%
        </span>
      </div>
      <div className="w-full bg-surface-hover h-2 rounded-full overflow-hidden border border-border-subtle">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};
