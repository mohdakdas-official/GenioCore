export const StatusBadge = ({ status = "Queued", size = "sm" }) => {
  const map = {
    Queued: {
      bg: "bg-surface",
      text: "text-muted",
      dot: "bg-text-disabled",
    },
    Processing: {
      bg: "bg-info/10",
      text: "text-info",
      dot: "bg-info animate-pulse",
    },
    Completed: {
      bg: "bg-success/10",
      text: "text-success",
      dot: "bg-success",
    },
    Failed: {
      bg: "bg-error/10",
      text: "text-error",
      dot: "bg-error",
    },
  };

  const item = map[status] || map.Queued;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border border-border-subtle ${item.bg} ${item.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
      {status}
    </span>
  );
};

export const SeverityBadge = ({ severity = "Low" }) => {
  const map = {
    Critical: "bg-error/15 text-error border-error/30",
    High: "bg-warning/15 text-warning border-warning/30",
    Medium: "bg-info/15 text-info border-info/30",
    Low: "bg-surface text-muted border-border-subtle",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${
        map[severity] || map.Low
      }`}
    >
      {severity}
    </span>
  );
};
