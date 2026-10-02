import {
  FolderGit2,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { StatCard } from "../../components/shared/StatCard";
import { Card, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { TrendLineChart } from "../../components/charts/TrendLineChart";
import { DonutChart } from "../../components/charts/DonutChart";
import { ProgressMetric } from "../../components/shared/ProgressMetric";
import { AiInsightsCard } from "../../components/shared/AiInsightsCard";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../../hooks/useDashboard";
import PageMeta from "../../components/shared/PageMeta";

const DashboardPage = () => {
  const navigate = useNavigate();
  const {
    projects,
    reviews,
    recentReviews,
    activeReview,
    latestCompletedReview,
    averageScore,
    averageScores,
    scoreTrendData,
    loadedIssueCount,
    issueSeverityTotals,
    projectsPagination,
    reviewsPagination,
    isLoading,
    completedReviews,
    error,
    refresh,
  } = useDashboard();

  const getReviewProjectId = (review) => {
    if (!review?.projectId) {
      return null;
    }

    if (typeof review.projectId === "string") {
      return review.projectId;
    }

    return review.projectId?._id ?? null;
  };

  const getProjectName = (review) => {
    // In case backend later populates projectId
    if (
      review?.projectId &&
      typeof review.projectId === "object" &&
      review.projectId?.name
    ) {
      return review.projectId.name;
    }

    const projectId = getReviewProjectId(review);

    const project = projects.find((item) => item._id === projectId);

    return project?.name ?? "Unknown Project";
  };

  const getReviewEngine = (review) => {
    const provider = review?.execution?.provider;

    const model = review?.execution?.model;

    if (provider && model) {
      return `${provider} / ${model}`;
    }

    return model || provider || "—";
  };

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    return new Date(value).toLocaleString();
  };

  const issueSeverityData = [
    {
      label: "Critical",
      value: issueSeverityTotals.critical,
      color: "var(--error)",
    },
    {
      label: "High",
      value: issueSeverityTotals.high,
      color: "var(--warning)",
    },
    {
      label: "Medium",
      value: issueSeverityTotals.medium,
      color: "var(--info)",
    },
    {
      label: "Low",
      value: issueSeverityTotals.low,
      color: "var(--text-disabled)",
    },
    {
      label: "Info",
      value: issueSeverityTotals.info,
      color: "var(--muted)",
    },
  ];

  const benchmarkTargets = {
    security: 95,
    maintainability: 85,
    performance: 90,
    reliability: 85,
  };

  const benchmarkMetCount = [
    averageScores.security >= benchmarkTargets.security,
    averageScores.maintainability >= benchmarkTargets.maintainability,
    averageScores.performance >= benchmarkTargets.performance,
    averageScores.reliability >= benchmarkTargets.reliability,
  ].filter(Boolean).length;

  const dashboardInsights = latestCompletedReview
    ? [
        {
          id: "summary",
          category: "Latest Review",
          color: "text-primary",
          title: "AI Review Summary",
          description:
            latestCompletedReview.summary ||
            "The latest review completed successfully.",
        },

        {
          id: "issues",
          category: "Findings",
          color:
            (latestCompletedReview.issueCounts?.critical ?? 0) > 0
              ? "text-error"
              : (latestCompletedReview.issueCounts?.high ?? 0) > 0
                ? "text-warning"
                : "text-success",

          title: `${
            latestCompletedReview.issueCounts?.total ?? 0
          } issues detected`,

          description: `Critical: ${
            latestCompletedReview.issueCounts?.critical ?? 0
          }, High: ${latestCompletedReview.issueCounts?.high ?? 0}, Medium: ${
            latestCompletedReview.issueCounts?.medium ?? 0
          }, Low: ${latestCompletedReview.issueCounts?.low ?? 0}.`,
        },

        {
          id: "quality",
          category: "Code Quality",
          color: "text-success",

          title:
            typeof latestCompletedReview.scores?.overall === "number"
              ? `Overall score: ${latestCompletedReview.scores.overall}/100`
              : "Code quality analysis completed",

          description: `Security: ${
            latestCompletedReview.scores?.security ?? "—"
          }, Performance: ${
            latestCompletedReview.scores?.performance ?? "—"
          }, Maintainability: ${
            latestCompletedReview.scores?.maintainability ?? "—"
          }, Reliability: ${latestCompletedReview.scores?.reliability ?? "—"}.`,
        },

        {
          id: "engine",
          category: "AI Engine",
          color: "text-primary",

          title: latestCompletedReview.execution?.provider
            ? `${latestCompletedReview.execution.provider} analysis`
            : "AI analysis",

          description: latestCompletedReview.execution?.model
            ? `Model: ${latestCompletedReview.execution.model}.`
            : "Model information unavailable.",
        },
      ]
    : [];

  return (
    <>
      <PageMeta title="Dashboard — GenioCore" />
      <div className="space-y-6">
        {/* Action Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
          <div>
            <h2 className="text-lg font-bold text-text-primary tracking-tight">
              Code Intelligence Dashboard
            </h2>

            <p className="text-xs text-muted">
              AI-powered code review intelligence across your active projects.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate("/v1/projects")}
            >
              View Projects
            </Button>

            <Button
              size="sm"
              variant="primary"
              icon={Plus}
              onClick={() => {
                if (activeReview) {
                  const projectId = getReviewProjectId(activeReview);

                  if (projectId) {
                    navigate(
                      `/v1/projects/${projectId}/reviews/${activeReview._id}/processing`,
                    );

                    return;
                  }
                }

                navigate("/v1/reviews");
              }}
            >
              {activeReview ? "View Active Review" : "Trigger New Review"}
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-error/20">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-error">
                  Unable to load dashboard data
                </p>

                <p className="mt-1 text-[11px] text-muted">{error}</p>
              </div>

              <Button size="sm" variant="secondary" onClick={refresh}>
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Row 1: Top 4 Analytics Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title={
              projectsPagination.hasNextPage
                ? "Active Projects Loaded"
                : "Active Projects"
            }
            value={isLoading ? "—" : projects.length.toString()}
            subtitle={
              projectsPagination.hasNextPage
                ? "more projects available"
                : "currently active"
            }
            icon={FolderGit2}
          />

          <StatCard
            title={reviewsPagination.hasNextPage ? "Reviews Loaded" : "Reviews"}
            value={isLoading ? "—" : reviews.length.toString()}
            subtitle={
              reviewsPagination.hasNextPage
                ? "more reviews available"
                : "available reviews"
            }
            icon={FileCheck2}
          />

          <StatCard
            title="Average Code Score"
            value={
              isLoading
                ? "—"
                : averageScore !== null
                  ? averageScore.toString()
                  : "—"
            }
            subtitle="from loaded completed reviews"
            icon={CheckCircle2}
          />

          <StatCard
            title="Issues Detected"
            value={isLoading ? "—" : loadedIssueCount.toString()}
            subtitle="from loaded completed reviews"
            icon={AlertTriangle}
          />
        </div>

        {/* Row 2: Code Quality Overview & Issue Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 flex flex-col justify-between">
            <CardHeader
              title="Code Quality Trends"
              subtitle="Overall, security, maintainability, and performance score progression"
            />
            <TrendLineChart data={scoreTrendData} />
          </Card>

          <Card className="flex flex-col justify-between">
            <CardHeader
              title="Issue Severity Breakdown"
              subtitle="Findings from loaded completed reviews"
            />

            {loadedIssueCount > 0 ? (
              <DonutChart data={issueSeverityData} />
            ) : (
              <div className="flex min-h-48 items-center justify-center">
                <p className="text-xs text-muted">
                  No issue data available yet.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Row 3: Recent Reviews Table & Quality Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Reviews (2 Columns) */}
          <Card className="lg:col-span-2 overflow-hidden flex flex-col justify-between">
            <div>
              <CardHeader
                title="Recent Reviews"
                subtitle="Latest static and semantic evaluations"
                action={
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate("/v1/reviews")}
                  >
                    View All
                  </Button>
                }
              />

              <div className="overflow-x-auto -mx-5 -mb-5">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface border-y border-border-subtle text-muted uppercase text-[10px] font-mono tracking-wider">
                    <tr>
                      <th className="py-2.5 px-5">Project / Type</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Score</th>
                      <th className="py-2.5 px-3">Issues</th>
                      <th className="py-2.5 px-3">Engine</th>
                      <th className="py-2.5 px-5 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {recentReviews.map((review) => {
                      const projectId = getReviewProjectId(review);

                      const score = review?.scores?.overall;

                      const issueCounts = review?.issueCounts ?? {};

                      const isActive =
                        review.status === "QUEUED" ||
                        review.status === "PROCESSING";

                      return (
                        <tr
                          key={review._id}
                          onClick={() => {
                            if (!projectId) {
                              return;
                            }

                            if (isActive) {
                              navigate(
                                `/v1/projects/${projectId}/reviews/${review._id}/processing`,
                              );

                              return;
                            }

                            navigate(
                              `/v1/projects/${projectId}/reviews/${review._id}`,
                            );
                          }}
                          className="group cursor-pointer transition-colors hover:bg-surface-hover/70"
                        >
                          {/* Project */}
                          <td className="py-3 px-5">
                            <div className="font-semibold text-text-primary transition-colors group-hover:text-primary">
                              {getProjectName(review)}
                            </div>

                            <div className="font-mono text-[10px] text-muted">
                              {review.reviewType ?? "FULL"}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3">
                            <StatusBadge status={review.status} />
                          </td>

                          {/* Score */}
                          <td className="py-3 px-3 font-mono font-medium text-text-primary">
                            {typeof score === "number" ? `${score}/100` : "—"}
                          </td>

                          {/* Issues */}
                          <td className="py-3 px-3 font-mono text-xs">
                            {review.status === "COMPLETED" ? (
                              <div className="flex items-center gap-1.5 text-[11px]">
                                {(issueCounts.critical ?? 0) > 0 && (
                                  <span className="font-semibold text-error">
                                    {issueCounts.critical}C
                                  </span>
                                )}

                                {(issueCounts.high ?? 0) > 0 && (
                                  <span className="text-warning">
                                    {issueCounts.high}H
                                  </span>
                                )}

                                <span className="text-muted">
                                  {issueCounts.medium ?? 0}M
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>

                          {/* AI Engine */}
                          <td className="py-3 px-3 font-mono text-[11px] text-muted">
                            {getReviewEngine(review)}
                          </td>

                          {/* Created */}
                          <td className="py-3 px-5 text-right text-[11px] text-muted">
                            {formatDate(review.createdAt)}
                          </td>
                        </tr>
                      );
                    })}

                    {!isLoading && recentReviews.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-10 text-center text-xs text-muted"
                        >
                          No reviews yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* Quality Goals (1 Column) */}
          <Card className="flex flex-col justify-between">
            <CardHeader
              title="Quality Benchmarks"
              subtitle="Average scores from loaded completed reviews"
            />

            {completedReviews.length > 0 ? (
              <>
                <div className="space-y-4 py-2">
                  <ProgressMetric
                    label="Security (Target: 95%)"
                    value={averageScores.security ?? 0}
                    color="var(--success)"
                  />

                  <ProgressMetric
                    label="Maintainability (Target: 85%)"
                    value={averageScores.maintainability ?? 0}
                    color="var(--primary)"
                  />

                  <ProgressMetric
                    label="Performance (Target: 90%)"
                    value={averageScores.performance ?? 0}
                    color="var(--secondary)"
                  />

                  <ProgressMetric
                    label="Reliability (Target: 85%)"
                    value={averageScores.reliability ?? 0}
                    color="var(--warning)"
                  />
                </div>

                <div className="border-t border-border-subtle pt-3 text-[11px] text-muted">
                  {benchmarkMetCount} of 4 benchmarks met across loaded
                  completed reviews.
                </div>
              </>
            ) : (
              <div className="flex min-h-48 items-center justify-center">
                <p className="text-xs text-muted">
                  No completed review data available yet.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Row 4: AI Insights Reusable Banner */}
        <AiInsightsCard insights={dashboardInsights} />
      </div>
    </>
  );
};

export default DashboardPage;
