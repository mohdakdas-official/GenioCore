import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Shield,
  Zap,
  Wrench,
  CheckCircle,
  FileCode,
  Download,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Loader2,
  AlertTriangle,
  Copy,
  RefreshCw,
  Activity,
} from "lucide-react";

import { Card, CardHeader } from "../../components/ui/Card";

import { Button } from "../../components/ui/Button";

import { Tabs } from "../../components/ui/Tabs";

import { StatCard } from "../../components/shared/StatCard";

import {
  SeverityBadge,
  StatusBadge,
} from "../../components/shared/StatusBadge";

import { DonutChart } from "../../components/charts/DonutChart";

import { getReviewById, getReviewIssues } from "../../services/review.service";

import { getProjectById } from "../../services/project.service";
import PageMeta from "../../components/PageMeta";

const ReviewReportPage = () => {
  const { projectId, reviewId } = useParams();

  const navigate = useNavigate();

  const [review, setReview] = useState(null);

  const [project, setProject] = useState(null);

  const [issues, setIssues] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("issues");

  const [expandedIssue, setExpandedIssue] = useState(null);

  const [selectedFileFilter, setSelectedFileFilter] = useState("ALL");

  const [severityFilter, setSeverityFilter] = useState("ALL");

  /*
   * ----------------------------------------
   * LOAD ALL ISSUES
   * ----------------------------------------
   */

  const fetchAllIssues = useCallback(async () => {
    let cursor = null;

    const collectedIssues = [];

    do {
      const response = await getReviewIssues({
        projectId,
        reviewId,
        cursor,
        limit: 100,
      });

      const payload = response?.data;

      /*
       * Support our expected paginated
       * response while remaining defensive.
       */

      const pageIssues = Array.isArray(payload)
        ? payload
        : (payload?.issues ?? payload?.items ?? []);

      collectedIssues.push(...pageIssues);

      const pagination = payload?.pagination;

      cursor = pagination?.hasNextPage ? pagination.nextCursor : null;
    } while (cursor);

    return collectedIssues;
  }, [projectId, reviewId]);

  /*
   * ----------------------------------------
   * LOAD REPORT
   * ----------------------------------------
   */

  const loadReport = useCallback(async () => {
    if (!projectId || !reviewId) {
      setError("Project or review identifier is missing.");

      setIsLoading(false);

      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const [reviewResponse, projectResponse, reviewIssues] = await Promise.all(
        [
          getReviewById({
            projectId,
            reviewId,
          }),

          getProjectById(projectId),

          fetchAllIssues(),
        ],
      );

      const reviewData = reviewResponse?.data ?? null;

      const projectData = projectResponse?.data ?? null;

      setReview(reviewData);

      setProject(projectData);

      setIssues(reviewIssues);

      if (reviewIssues.length > 0) {
        setExpandedIssue(reviewIssues[0]._id);
      }
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load review report.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [projectId, reviewId, fetchAllIssues]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  /*
   * ----------------------------------------
   * HELPERS
   * ----------------------------------------
   */

  const formatStatus = (value) => {
    if (!value) {
      return "Unknown";
    }

    return value.charAt(0) + value.slice(1).toLowerCase();
  };

  const formatSeverity = (value) => {
    if (!value) {
      return "Info";
    }

    return value.charAt(0) + value.slice(1).toLowerCase();
  };

  const formatCategory = (value) => {
    if (!value) {
      return "General";
    }

    return value
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (character) => character.toUpperCase());
  };

  const getIssueLineLabel = (issue) => {
    const lineStart = issue?.location?.lineStart;

    const lineEnd = issue?.location?.lineEnd;

    if (!lineStart) {
      return "";
    }

    if (lineEnd && lineEnd !== lineStart) {
      return `${lineStart}-${lineEnd}`;
    }

    return `${lineStart}`;
  };

  /*
   * ----------------------------------------
   * FILTERED FINDINGS
   * ----------------------------------------
   */

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const severity = formatSeverity(issue.severity);

      const filePath = issue?.location?.filePath ?? "Project-wide";

      const severityMatches =
        severityFilter === "ALL" || severity === severityFilter;

      const fileMatches =
        selectedFileFilter === "ALL" || filePath === selectedFileFilter;

      return severityMatches && fileMatches;
    });
  }, [issues, severityFilter, selectedFileFilter]);

  /*
   * ----------------------------------------
   * FILE FINDING SUMMARY
   * ----------------------------------------
   */

  const affectedFiles = useMemo(() => {
    const map = new Map();

    for (const issue of issues) {
      const path = issue?.location?.filePath;

      if (!path) {
        continue;
      }

      if (!map.has(path)) {
        map.set(path, {
          path,
          total: 0,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          info: 0,
        });
      }

      const file = map.get(path);

      file.total++;

      const severity = issue.severity?.toLowerCase();

      if (file[severity] !== undefined) {
        file[severity]++;
      }
    }

    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [issues]);

  /*
   * ----------------------------------------
   * JSON EXPORT
   * ----------------------------------------
   */

  const handleExportJson = () => {
    if (!review) {
      return;
    }

    const exportData = {
      generatedAt: new Date().toISOString(),

      project: {
        id: project?._id,
        name: project?.name,
      },

      review,

      issues,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");

    anchor.href = url;

    anchor.download = `review-${reviewId}.json`;

    anchor.click();

    URL.revokeObjectURL(url);
  };

  const handleCopy = async (text) => {
    if (!text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Unable to copy:", error);
    }
  };

  /*
   * ----------------------------------------
   * LOADING / ERROR
   * ----------------------------------------
   */

  if (isLoading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="flex items-center gap-3 text-xs text-muted">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Loading review report...
        </div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="space-y-4">
        <Button
          size="sm"
          variant="ghost"
          icon={ArrowLeft}
          onClick={() => navigate("/v1/reviews")}
        >
          Reviews
        </Button>

        <Card className="border-error/25 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-error" />

            <div>
              <h2 className="text-sm font-semibold text-text-primary">
                Unable to load report
              </h2>

              <p className="mt-1 text-xs text-muted">
                {error || "Review not found."}
              </p>

              <Button
                className="mt-4"
                size="sm"
                variant="secondary"
                icon={RefreshCw}
                onClick={loadReport}
              >
                Retry
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  /*
   * A report only makes sense once completed.
   */

  if (review.status !== "COMPLETED") {
    return (
      <div className="mx-auto max-w-2xl py-10">
        <Card className="space-y-4 p-6 text-center">
          <Activity className="mx-auto h-8 w-8 text-primary" />

          <h2 className="text-sm font-semibold text-text-primary">
            Review is not complete yet
          </h2>

          <p className="text-xs text-muted">
            Current status: {formatStatus(review.status)}
          </p>

          <Button
            size="sm"
            variant="primary"
            onClick={() =>
              navigate(
                `/v1/projects/${projectId}/reviews/${reviewId}/processing`,
              )
            }
          >
            View Processing
          </Button>
        </Card>
      </div>
    );
  }

  /*
   * ----------------------------------------
   * REAL DATA
   * ----------------------------------------
   */

  const scores = review.scores ?? {};

  const issueCounts = review.issueCounts ?? {};

  const execution = review.execution ?? {};

  const providerLabel = [execution.provider, execution.model]
    .filter(Boolean)
    .join(" / ");

  const tabs = [
    {
      id: "issues",
      label: "Findings & Issues",
      badge: String(issues.length),
    },

    {
      id: "files",
      label: "Affected Files",
      badge: String(affectedFiles.length),
    },

    {
      id: "overview",
      label: "Executive Summary",
    },
  ];

  const donutData = [
    {
      label: "Critical",
      value: issueCounts.critical ?? 0,
      color: "var(--error)",
    },
    {
      label: "High",
      value: issueCounts.high ?? 0,
      color: "var(--warning)",
    },
    {
      label: "Medium",
      value: issueCounts.medium ?? 0,
      color: "var(--info)",
    },
    {
      label: "Low",
      value: issueCounts.low ?? 0,
      color: "var(--text-disabled)",
    },
    {
      label: "Info",
      value: issueCounts.info ?? 0,
      color: "var(--muted)",
    },
  ];

  return (
    <>
      <PageMeta
        title="Review Report — GenioCore"
        description="View your GenioCore code review report, including identified security, performance, and maintainability issues."
      />
      <div className="space-y-6">
        {/* ------------------------------------
          HEADER
      ------------------------------------- */}

        <div className="flex flex-col gap-4 border-b border-border-subtle pb-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="ghost"
              icon={ArrowLeft}
              onClick={() => navigate("/v1/reviews")}
            />

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-mono text-lg font-bold tracking-tight text-text-primary">
                  Report #{reviewId}
                </h2>

                <StatusBadge status={formatStatus(review.status)} />
              </div>

              <p className="mt-1 text-xs text-muted">
                {project?.name ?? "Project"}

                {providerLabel ? ` • ${providerLabel}` : ""}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="secondary"
            icon={Download}
            onClick={handleExportJson}
          >
            Export JSON
          </Button>
        </div>

        {/* ------------------------------------
          SCORES
      ------------------------------------- */}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            title="Overall Quality Score"
            value={
              typeof scores.overall === "number" ? `${scores.overall}/100` : "—"
            }
            subtitle={`${issueCounts.total ?? 0} findings`}
            icon={CheckCircle}
          />

          <StatCard
            title="Security Score"
            value={
              typeof scores.security === "number"
                ? `${scores.security}/100`
                : "—"
            }
            subtitle={`${issueCounts.critical ?? 0} critical • ${
              issueCounts.high ?? 0
            } high`}
            icon={Shield}
          />

          <StatCard
            title="Performance"
            value={
              typeof scores.performance === "number"
                ? `${scores.performance}/100`
                : "—"
            }
            subtitle="AI review score"
            icon={Zap}
          />

          <StatCard
            title="Maintainability"
            value={
              typeof scores.maintainability === "number"
                ? `${scores.maintainability}/100`
                : "—"
            }
            subtitle={
              typeof scores.reliability === "number"
                ? `Reliability ${scores.reliability}/100`
                : "Reliability unavailable"
            }
            icon={Wrench}
          />
        </div>

        {/* Tabs */}

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* ====================================
          ISSUES TAB
      ===================================== */}

        {activeTab === "issues" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {/* Severity filters */}

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {["ALL", "Critical", "High", "Medium", "Low", "Info"].map(
                  (severity) => (
                    <button
                      key={severity}
                      type="button"
                      onClick={() => setSeverityFilter(severity)}
                      className={`rounded px-2.5 py-1 font-mono text-xs font-medium transition-colors ${
                        severityFilter === severity
                          ? "border border-border-hover bg-surface-hover text-text-primary"
                          : "border border-transparent text-muted hover:text-text-secondary"
                      }`}
                    >
                      {severity}
                    </button>
                  ),
                )}
              </div>

              {/* Current file filter */}

              {selectedFileFilter !== "ALL" && (
                <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface px-3 py-2">
                  <span className="truncate font-mono text-[11px] text-muted">
                    File: {selectedFileFilter}
                  </span>

                  <button
                    type="button"
                    onClick={() => setSelectedFileFilter("ALL")}
                    className="text-[11px] font-medium text-primary hover:underline"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Finding list */}

              <div className="space-y-3">
                {filteredIssues.length === 0 ? (
                  <Card className="p-8 text-center">
                    <CheckCircle className="mx-auto h-7 w-7 text-success" />

                    <h3 className="mt-3 text-xs font-semibold text-text-primary">
                      No findings match this filter
                    </h3>

                    <p className="mt-1 text-[11px] text-muted">
                      Try a different severity or file filter.
                    </p>
                  </Card>
                ) : (
                  filteredIssues.map((issue) => {
                    const isExpanded = expandedIssue === issue._id;

                    const filePath =
                      issue?.location?.filePath ?? "Project-wide";

                    const line = getIssueLineLabel(issue);

                    return (
                      <Card
                        key={issue._id}
                        className="overflow-hidden border-border-subtle p-0"
                      >
                        {/* Header */}

                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() =>
                            setExpandedIssue(isExpanded ? null : issue._id)
                          }
                          className="flex cursor-pointer items-start justify-between gap-3 p-4 hover:bg-surface-hover/50"
                        >
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <SeverityBadge
                                severity={formatSeverity(issue.severity)}
                              />

                              <span className="font-mono text-[10px] uppercase text-muted">
                                {formatCategory(issue.category)}
                              </span>

                              {typeof issue.confidence === "number" && (
                                <span className="font-mono text-[10px] text-muted">
                                  {Math.round(issue.confidence * 100)}%
                                  confidence
                                </span>
                              )}
                            </div>

                            <h4 className="text-xs font-semibold text-text-primary">
                              {issue.title}
                            </h4>

                            <div className="flex items-center gap-1 font-mono text-[11px] text-muted">
                              <FileCode className="h-3 w-3 shrink-0 text-primary" />

                              <span className="break-all">
                                {filePath}

                                {line ? `:${line}` : ""}
                              </span>
                            </div>
                          </div>

                          <div className="p-1 text-muted">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </div>
                        </div>

                        {/* Body */}

                        {isExpanded && (
                          <div className="border-t border-border-subtle bg-surface/40 px-4 pb-4 pt-4">
                            <div className="space-y-4 text-xs">
                              <div>
                                <span className="mb-1 block font-mono text-[10px] uppercase text-muted">
                                  Finding
                                </span>

                                <p className="leading-relaxed text-text-secondary">
                                  {issue.description}
                                </p>
                              </div>

                              <div>
                                <span className="mb-1 block font-mono text-[10px] uppercase text-muted">
                                  Recommended remediation
                                </span>

                                <p className="leading-relaxed text-text-primary">
                                  {issue.recommendation}
                                </p>
                              </div>

                              {issue.ruleId && (
                                <div>
                                  <span className="mb-1 block font-mono text-[10px] uppercase text-muted">
                                    Rule
                                  </span>

                                  <span className="font-mono text-[11px] text-primary">
                                    {issue.ruleId}
                                  </span>
                                </div>
                              )}

                              {issue.codeSnippet && (
                                <div>
                                  <div className="mb-1 flex items-center justify-between">
                                    <span className="font-mono text-[10px] uppercase text-muted">
                                      Code snippet
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleCopy(issue.codeSnippet)
                                      }
                                      className="inline-flex items-center gap-1 text-[10px] text-muted hover:text-primary"
                                    >
                                      <Copy className="h-3 w-3" />
                                      Copy
                                    </button>
                                  </div>

                                  <pre className="overflow-x-auto rounded-lg border border-border-subtle bg-surface p-3 font-mono text-[11px] text-text-secondary">
                                    {issue.codeSnippet}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })
                )}
              </div>
            </div>

            {/* Severity breakdown */}

            <div className="space-y-6">
              <Card>
                <CardHeader
                  title="Finding Proportions"
                  subtitle="By severity tier"
                />

                <DonutChart data={donutData} />
              </Card>

              <Card className="space-y-3">
                <CardHeader title="Issue Summary" subtitle="Current review" />

                <IssueCountRow
                  label="Critical"
                  value={issueCounts.critical ?? 0}
                />

                <IssueCountRow label="High" value={issueCounts.high ?? 0} />

                <IssueCountRow label="Medium" value={issueCounts.medium ?? 0} />

                <IssueCountRow label="Low" value={issueCounts.low ?? 0} />

                <IssueCountRow label="Info" value={issueCounts.info ?? 0} />
              </Card>
            </div>
          </div>
        )}

        {/* ====================================
          AFFECTED FILES
      ===================================== */}

        {activeTab === "files" && (
          <Card className="overflow-hidden border-border-subtle p-0">
            <div className="border-b border-border-subtle p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                Files With Findings
              </h4>

              <p className="mt-1 text-[11px] text-muted">
                This view contains files referenced by persisted review
                findings.
              </p>
            </div>

            {affectedFiles.length === 0 ? (
              <div className="p-10 text-center text-xs text-muted">
                No affected files.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border-subtle bg-surface font-mono text-[10px] uppercase text-muted">
                    <tr>
                      <th className="px-5 py-2.5">File Path</th>

                      <th className="px-3 py-2.5">Findings</th>

                      <th className="px-3 py-2.5">Critical</th>

                      <th className="px-3 py-2.5">High</th>

                      <th className="px-3 py-2.5">Medium</th>

                      <th className="px-5 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border-subtle">
                    {affectedFiles.map((file) => (
                      <tr key={file.path} className="hover:bg-surface-hover/70">
                        <td className="px-5 py-3 font-mono text-text-primary">
                          {file.path}
                        </td>

                        <td className="px-3 py-3 font-mono text-muted">
                          {file.total}
                        </td>

                        <td className="px-3 py-3 font-mono text-error">
                          {file.critical}
                        </td>

                        <td className="px-3 py-3 font-mono text-warning">
                          {file.high}
                        </td>

                        <td className="px-3 py-3 font-mono text-text-secondary">
                          {file.medium}
                        </td>

                        <td className="px-5 py-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedFileFilter(file.path);

                              setActiveTab("issues");
                            }}
                          >
                            View Findings
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* ====================================
          EXECUTIVE SUMMARY
      ===================================== */}

        {activeTab === "overview" && (
          <div className="max-w-4xl space-y-4">
            <Card className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />

                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                  Review Summary
                </h3>
              </div>

              <p className="text-xs leading-relaxed text-text-secondary">
                {review.summary || "No review summary is available."}
              </p>
            </Card>

            <Card>
              <CardHeader
                title="Execution Details"
                subtitle="AI processing metadata"
              />

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailItem
                  label="Input Tokens"
                  value={
                    typeof execution?.tokenUsage?.input === "number"
                      ? String(execution.tokenUsage.input)
                      : "—"
                  }
                />

                <DetailItem
                  label="Output Tokens"
                  value={
                    typeof execution?.tokenUsage?.output === "number"
                      ? String(execution.tokenUsage.output)
                      : "—"
                  }
                />

                <DetailItem
                  label="Total Tokens"
                  value={
                    typeof execution?.tokenUsage?.total === "number"
                      ? String(execution.tokenUsage.total)
                      : "—"
                  }
                />

                <DetailItem
                  label="Chunks"
                  value={
                    typeof review?.progress?.totalChunks === "number" &&
                    review.progress.totalChunks > 0
                      ? `${review.progress.completedChunks ?? 0} / ${review.progress.totalChunks}`
                      : "—"
                  }
                />

                <DetailItem
                  label="Reliability Score"
                  value={
                    typeof scores.reliability === "number"
                      ? `${scores.reliability}/100`
                      : "—"
                  }
                />
              </div>
            </Card>
          </div>
        )}
      </div>
    </>
  );
};

const IssueCountRow = ({ label, value }) => {
  return (
    <div className="flex items-center justify-between border-b border-border-subtle py-2 last:border-0">
      <span className="text-xs text-muted">{label}</span>

      <span className="font-mono text-xs font-semibold text-text-primary">
        {value}
      </span>
    </div>
  );
};

const DetailItem = ({ label, value }) => {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-3">
      <div className="font-mono text-[10px] uppercase text-muted">{label}</div>

      <div className="mt-1 break-all font-mono text-xs font-medium text-text-primary">
        {value}
      </div>
    </div>
  );
};

export default ReviewReportPage;
