export const DonutChart = ({
  data = [
    { label: "Critical", value: 3, color: "var(--error)" },
    { label: "High", value: 8, color: "var(--warning)" },
    { label: "Medium", value: 19, color: "var(--info)" },
    { label: "Low", value: 34, color: "var(--text-disabled)" },
  ],
  size = 140,
  strokeWidth = 14,
}) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedAngle = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="var(--surface-hover)"
            strokeWidth={strokeWidth}
          />
          {data.map((item, idx) => {
            const strokeDasharray = `${(item.value / total) * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedAngle;
            accumulatedAngle += (item.value / total) * circumference;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            );
          })}
        </svg>

        {/* Center Total Count */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold font-mono text-text-primary leading-tight">
            {total}
          </span>
          <span className="text-[10px] text-muted uppercase tracking-wider">
            Issues
          </span>
        </div>
      </div>

      {/* Legend Breakdown */}
      <div className="w-full space-y-2">
        {data.map((item) => {
          const pct = total ? Math.round((item.value / total) * 100) : 0;
          return (
            <div
              key={item.label}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-text-secondary">{item.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-text-primary font-medium">
                  {item.value}
                </span>
                <span className="font-mono text-[11px] text-muted w-8 text-right">
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
