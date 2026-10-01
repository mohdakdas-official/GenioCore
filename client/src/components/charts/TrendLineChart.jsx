import { useMemo, useState } from "react";

export const TrendLineChart = ({ data = [], height = 180 }) => {
  const [activeMetric, setActiveMetric] = useState("overall");

  const metrics = [
    {
      key: "overall",
      label: "Overall",
      color: "var(--primary)",
    },
    {
      key: "security",
      label: "Security",
      color: "var(--success)",
    },
    {
      key: "performance",
      label: "Performance",
      color: "var(--secondary)",
    },
    {
      key: "maintainability",
      label: "Maintainability",
      color: "var(--warning)",
    },
    {
      key: "reliability",
      label: "Reliability",
      color: "var(--info)",
    },
  ];

  const currentMetric =
    metrics.find((metric) => metric.key === activeMetric) ?? metrics[0];

  /**
   * Only use rows where the selected
   * metric actually has a number.
   */
  const validData = useMemo(() => {
    return data.filter((item) => typeof item?.[activeMetric] === "number");
  }, [data, activeMetric]);

  const minVal = 0;
  const maxVal = 100;

  const width = 500;

  const chartBottom = height - 30;

  const chartHeight = height - 50;

  /**
   * Prevent division by zero
   * when only one data point exists.
   */
  const points = validData.map((item, index) => {
    let x;

    if (validData.length === 1) {
      x = width / 2;
    } else {
      x = (index / (validData.length - 1)) * (width - 40) + 20;
    }

    const value = item[activeMetric];

    const y =
      chartBottom - ((value - minVal) / (maxVal - minVal)) * chartHeight;

    const rawDate = item.date;

    const formattedDate = rawDate
      ? new Date(rawDate).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })
      : "—";

    return {
      x,
      y,
      val: value,
      date: formattedDate,
    };
  });

  const polylineStr = points.map((point) => `${point.x},${point.y}`).join(" ");

  /**
   * No data for selected metric.
   */
  if (validData.length === 0) {
    return (
      <div className="w-full">
        {/* Metric Selector */}
        <div className="mb-4 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {metrics.map((metric) => (
            <button
              key={metric.key}
              type="button"
              onClick={() => setActiveMetric(metric.key)}
              className={`rounded border px-2.5 py-1 text-[11px] font-medium transition-all ${
                activeMetric === metric.key
                  ? "border-border-hover bg-surface-hover text-text-primary"
                  : "border-transparent text-muted hover:text-text-secondary"
              }`}
            >
              <span
                className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: metric.color,
                }}
              />

              {metric.label}
            </button>
          ))}
        </div>

        <div className="flex min-h-40 items-center justify-center">
          <p className="text-xs text-muted">
            No {currentMetric.label.toLowerCase()} score data available yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col justify-between">
      {/* Metric Selector Pills */}
      <div className="mb-4 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {metrics.map((metric) => (
          <button
            key={metric.key}
            type="button"
            onClick={() => setActiveMetric(metric.key)}
            className={`rounded border px-2.5 py-1 text-[11px] font-medium transition-all ${
              activeMetric === metric.key
                ? "border-border-hover bg-surface-hover text-text-primary"
                : "border-transparent text-muted hover:text-text-secondary"
            }`}
          >
            <span
              className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: metric.color,
              }}
            />

            {metric.label}
          </button>
        ))}
      </div>

      {/* SVG Canvas */}
      <div className="w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
          {/* Horizontal Grid */}
          {[0, 0.5, 1].map((percentage, index) => {
            const y = chartBottom - percentage * chartHeight;

            const value = Math.round(minVal + percentage * (maxVal - minVal));

            return (
              <g key={index}>
                <line
                  x1="20"
                  y1={y}
                  x2={width - 20}
                  y2={y}
                  stroke="var(--border-subtle)"
                  strokeDasharray="3 3"
                />

                <text
                  x="2"
                  y={y + 3}
                  fill="var(--muted)"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {/* Gradient */}
          <defs>
            <linearGradient
              id={`metricGradient-${activeMetric}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={currentMetric.color}
                stopOpacity="0.25"
              />

              <stop
                offset="100%"
                stopColor={currentMetric.color}
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          {/* Area fill */}
          {points.length > 1 && (
            <polygon
              points={`20,${chartBottom} ${polylineStr} ${
                width - 20
              },${chartBottom}`}
              fill={`url(#metricGradient-${activeMetric})`}
            />
          )}

          {/* Main line */}
          {points.length > 1 && (
            <polyline
              fill="none"
              stroke={currentMetric.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polylineStr}
            />
          )}

          {/* Points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="3.5"
                fill="var(--card)"
                stroke={currentMetric.color}
                strokeWidth="2"
              />

              {/* Score label */}
              <text
                x={point.x}
                y={point.y - 9}
                textAnchor="middle"
                fill="var(--text-secondary)"
                fontSize="9"
                fontFamily="monospace"
              >
                {point.val}
              </text>

              {/* Date */}
              <text
                x={point.x}
                y={height - 8}
                textAnchor="middle"
                fill="var(--muted)"
                fontSize="9"
              >
                {point.date}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
