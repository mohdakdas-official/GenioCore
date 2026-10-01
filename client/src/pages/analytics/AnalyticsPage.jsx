import { useMemo, useState } from "react";

import {
  BarChart3,
  Shield,
  AlertTriangle,
  FolderGit2,
  FileCheck2,
  AlertCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { Card, CardHeader } from "../../components/ui/Card";

import { Button } from "../../components/ui/Button";

import { StatCard } from "../../components/shared/StatCard";

import { TrendLineChart } from "../../components/charts/TrendLineChart";

import { DonutChart } from "../../components/charts/DonutChart";

import { ProgressMetric } from "../../components/shared/ProgressMetric";

import { useAnalytics } from "../../hooks/useAnalytics";

const RANGES = [
  {
    id: "7d",
    label: "7 Days",
  },
  {
    id: "30d",
    label: "30 Days",
  },
  {
    id: "90d",
    label: "90 Days",
  },
  {
    id: "all",
    label: "All Time",
  },
];

const AnalyticsPage = () => {
  const navigate = useNavigate();

  const [timeRange, setTimeRange] = useState("30d");

  const {
    filteredReviews,
    completedReviews,
    averageScores,
    issueTotals,
    reviewedProjectCount,
    trendData,
    projectAnalytics,
    isLoading,
    error,
    refresh,
  } = useAnalytics(timeRange);

  /**
   * ----------------------------------
   * Time range
   * ----------------------------------
   */
  const rangeConfig =
    RANGES.find((range) => range.id === timeRange) ?? RANGES[1];

  /**
   * ----------------------------------
   * Severity chart
   * ----------------------------------
   */
  const severityData = [
    {
      label: "Critical",
      value: issueTotals.critical,
      color: "var(--error)",
    },
    {
      label: "High",
      value: issueTotals.high,
      color: "var(--warning)",
    },
    {
      label: "Medium",
      value: issueTotals.medium,
      color: "var(--info)",
    },
    {
      label: "Low",
      value: issueTotals.low,
      color: "var(--text-disabled)",
    },
    {
      label: "Info",
      value: issueTotals.info,
      color: "var(--muted)",
    },
  ];

  /**
   * ----------------------------------
   * Latest completed review
   * per project
   * ----------------------------------
   */

  const scoreCategories = useMemo(
    () => [
      {
        label: "Security",
        value: averageScores.security,
        color: "var(--success)",
      },
      {
        label: "Performance",
        value: averageScores.performance,
        color: "var(--secondary)",
      },
      {
        label: "Maintainability",
        value: averageScores.maintainability,
        color: "var(--primary)",
      },
      {
        label: "Reliability",
        value: averageScores.reliability,
        color: "var(--warning)",
      },
    ],
    [averageScores],
  );

  const availableScoreCategories = useMemo(() => {
    return scoreCategories.filter(
      (category) => typeof category.value === "number",
    );
  }, [scoreCategories]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-border-subtle pb-2 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-text-primary">
            Code Intelligence Analytics
          </h2>

          <p className="text-xs text-muted">
            Real code review quality, security and finding trends across your
            projects.
          </p>
        </div>

        {/* Time range */}
        <div className="flex self-start rounded-lg border border-border-subtle bg-card p-1 sm:self-auto">
          {RANGES.map((range) => (
            <button
              key={range.id}
              type="button"
              onClick={() => setTimeRange(range.id)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                timeRange === range.id
                  ? "bg-surface-hover font-semibold text-text-primary"
                  : "text-muted hover:text-text-secondary"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-error/20">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error" />

              <div>
                <p className="text-xs font-medium text-error">
                  Unable to load analytics
                </p>

                <p className="mt-1 text-[11px] text-muted">{error}</p>
              </div>
            </div>

            <Button size="sm" variant="secondary" onClick={refresh}>
              Retry
            </Button>
          </div>
        </Card>
      )}

      {isLoading ? (
        <Card className="py-14 text-center">
          <p className="text-xs text-muted">Loading analytics...</p>
        </Card>
      ) : (
        <>
          {/* Global metrics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Reviews in Period"
              value={filteredReviews.length.toString()}
              subtitle={`${reviewedProjectCount} project${
                reviewedProjectCount === 1 ? "" : "s"
              } reviewed`}
              icon={FileCheck2}
            />

            <StatCard
              title="Average Code Score"
              value={
                averageScores.overall != null
                  ? `${averageScores.overall}/100`
                  : "—"
              }
              subtitle="completed reviews"
              icon={BarChart3}
            />

            <StatCard
              title="Average Security"
              value={
                averageScores.security != null
                  ? `${averageScores.security}/100`
                  : "—"
              }
              subtitle="completed reviews"
              icon={Shield}
            />

            <StatCard
              title="Issues Detected"
              value={issueTotals.total.toString()}
              subtitle={`${issueTotals.critical} critical • ${issueTotals.high} high`}
              icon={AlertTriangle}
            />
          </div>

          {/* Quality trend + severity */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader
                title="Code Quality Trends"
                subtitle={`Score progression for completed reviews in ${rangeConfig.label.toLowerCase()}`}
              />

              <TrendLineChart data={trendData} />
            </Card>

            <Card className="flex flex-col">
              <CardHeader
                title="Issue Severity Distribution"
                subtitle="Findings from completed reviews in this period"
              />

              {issueTotals.total > 0 ? (
                <DonutChart data={severityData} />
              ) : (
                <div className="flex min-h-48 flex-1 items-center justify-center">
                  <p className="text-xs text-muted">
                    No issue data available for this period.
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Project analytics + score categories */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="overflow-hidden border-border-subtle p-0">
              <div className="border-b border-border-subtle p-4">
                <h3 className="text-xs font-semibold tracking-tight text-text-primary">
                  Project Review Snapshot
                </h3>

                <p className="text-[11px] text-muted">
                  Latest completed review for each project in the selected
                  period
                </p>
              </div>

              {projectAnalytics.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-border-subtle bg-surface font-mono text-[10px] uppercase text-muted">
                      <tr>
                        <th className="px-4 py-2.5">Project</th>

                        <th className="px-3 py-2.5">Score</th>

                        <th className="px-3 py-2.5">Issues</th>

                        <th className="px-4 py-2.5 text-right">
                          Critical / High
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-border-subtle">
                      {projectAnalytics.map((item) => (
                        <tr
                          key={item.projectId}
                          onClick={() =>
                            navigate(`/v1/projects/${item.projectId}`)
                          }
                          className="cursor-pointer transition-colors hover:bg-surface-hover/70"
                        >
                          <td className="px-4 py-3">
                            <div className="font-semibold text-text-primary">
                              {item.name}
                            </div>

                            <div className="mt-0.5 font-mono text-[10px] text-muted">
                              Latest completed review
                            </div>
                          </td>

                          <td className="px-3 py-3 font-mono">
                            {typeof item.score === "number" ? (
                              <span
                                className={
                                  item.score >= 80
                                    ? "font-semibold text-primary"
                                    : "font-semibold text-warning"
                                }
                              >
                                {item.score}
                                /100
                              </span>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>

                          <td className="px-3 py-3 font-mono text-text-secondary">
                            {item.total}
                          </td>

                          <td className="px-4 py-3 text-right font-mono text-[11px]">
                            <span
                              className={
                                item.critical > 0
                                  ? "text-error"
                                  : "text-text-secondary"
                              }
                            >
                              {item.critical}
                            </span>

                            <span className="text-muted"> / </span>

                            <span
                              className={
                                item.high > 0
                                  ? "text-warning"
                                  : "text-text-secondary"
                              }
                            >
                              {item.high}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <FolderGit2 className="mx-auto h-7 w-7 text-muted" />

                  <h4 className="mt-3 text-sm font-semibold text-text-primary">
                    No completed reviews
                  </h4>

                  <p className="mt-1 text-xs text-muted">
                    No project review data is available for this time period.
                  </p>
                </div>
              )}
            </Card>

            {/* Real average score categories */}
            <Card className="space-y-4">
              <CardHeader
                title="Average Quality Dimensions"
                subtitle="Average scores from completed reviews in the selected period"
              />

              {availableScoreCategories.length > 0 ? (
                <div className="space-y-4 py-1">
                  {availableScoreCategories.map((category) => (
                    <ProgressMetric
                      key={category.label}
                      label={`${category.label} (${category.value}/100)`}
                      value={category.value}
                      color={category.color}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex min-h-48 items-center justify-center">
                  <p className="text-xs text-muted">
                    No completed review scores available for this period.
                  </p>
                </div>
              )}

              <div className="border-t border-border-subtle pt-3 text-[11px] text-muted">
                Based on {completedReviews.length} completed review
                {completedReviews.length === 1 ? "" : "s"} in this period.
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
