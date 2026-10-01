import { useEffect, useMemo, useState } from "react";
import {
  FileCheck2,
  Plus,
  Search,
  ChevronRight,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { StatCard } from "../../components/shared/StatCard";
import { StartReviewModal } from "./StartReviewModal";

import { useNavigate, useSearchParams } from "react-router-dom";
import { useReviews } from "../../hooks/useReviews";

const STATUS_FILTERS = [
  "ALL",
  "COMPLETED",
  "PROCESSING",
  "QUEUED",
  "FAILED",
  "CANCELLED",
];
const ReviewsPage = () => {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const initialProjectId = searchParams.get("project");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const {
    reviews,
    isLoading,
    isLoadingMore,
    error,
    pagination,
    refetch,
    loadMore,
  } = useReviews({
    status: statusFilter,
    limit: 20,
  });

  /*
   * ----------------------------------------
   * FETCH REVIEWS
   * ----------------------------------------
   */

  useEffect(() => {
    if (initialProjectId) {
      setIsWizardOpen(true);
    }
  }, [initialProjectId]);

  const getReviewProjectId = (review) => {
    if (!review?.projectId) {
      return null;
    }

    if (typeof review.projectId === "string") {
      return review.projectId;
    }

    return review.projectId?._id ?? null;
  };

  const getReviewProjectName = (review) => {
    if (review?.projectId && typeof review.projectId === "object") {
      return review.projectId?.name ?? "Unknown Project";
    }

    return "Unknown Project";
  };

  const getReviewSourceType = (review) => {
    if (review?.projectId && typeof review.projectId === "object") {
      return review.projectId?.sourceType ?? "MANUAL";
    }

    return "MANUAL";
  };

  const handleCloseReviewModal = () => {
    setIsWizardOpen(false);

    if (!initialProjectId) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);

    nextSearchParams.delete("project");

    setSearchParams(nextSearchParams, {
      replace: true,
    });
  };

  /*
   * ----------------------------------------
   * SEARCH
   *
   * Search works across currently loaded
   * reviews.
   * ----------------------------------------
   */

  const filteredReviews = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return reviews;
    }

    return reviews.filter((review) => {
      const reviewId = review?._id?.toLowerCase() ?? "";

      const projectName = getReviewProjectName(review).toLowerCase();

      const reviewType = review?.reviewType?.toLowerCase() ?? "";

      const provider = review?.execution?.provider?.toLowerCase() ?? "";

      const model = review?.execution?.model?.toLowerCase() ?? "";

      return (
        reviewId.includes(query) ||
        projectName.includes(query) ||
        reviewType.includes(query) ||
        provider.includes(query) ||
        model.includes(query)
      );
    });
  }, [reviews, searchTerm]);

  /*
   * ----------------------------------------
   * REAL STATS FOR CURRENTLY LOADED DATA
   * ----------------------------------------
   */

  const completedCount = reviews.filter(
    (review) => review.status === "COMPLETED",
  ).length;

  const inProgressCount = reviews.filter((review) =>
    ["QUEUED", "PROCESSING"].includes(review.status),
  ).length;

  const failedCount = reviews.filter(
    (review) => review.status === "FAILED",
  ).length;

  /*
   * ----------------------------------------
   * NAVIGATION
   * ----------------------------------------
   */

  const openReview = (review) => {
    const projectId = getReviewProjectId(review);

    const reviewId = review?._id;

    if (!projectId || !reviewId) {
      return;
    }

    if (review.status === "COMPLETED") {
      navigate(`/v1/projects/${projectId}/reviews/${reviewId}`);

      return;
    }

    navigate(`/v1/projects/${projectId}/reviews/${reviewId}/processing`);
  };

  /*
   * ----------------------------------------
   * HELPERS
   * ----------------------------------------
   */

  const formatStatus = (status) => {
    if (!status) {
      return "Unknown";
    }

    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleString();
  };

  const getDuration = (review) => {
    if (review.status === "QUEUED") {
      return "Queued";
    }

    if (review.status === "PROCESSING") {
      return "Running";
    }

    const start = review.startedAt ? new Date(review.startedAt) : null;

    const endDate = review.completedAt || review.failedAt;

    const end = endDate ? new Date(endDate) : null;

    if (!start || !end) {
      return "—";
    }

    const seconds = Math.max(
      0,
      Math.round((end.getTime() - start.getTime()) / 1000),
    );

    if (seconds < 60) {
      return `${seconds}s`;
    }

    const minutes = Math.floor(seconds / 60);

    const remainingSeconds = seconds % 60;

    return `${minutes}m ${remainingSeconds}s`;
  };

  const getEngine = (review) => {
    const provider = review?.execution?.provider;

    const model = review?.execution?.model;

    if (!provider && !model) {
      return "AUTO";
    }

    return [provider, model].filter(Boolean).join(" / ");
  };

  return (
    <div className="space-y-6">
      {/* ====================================
          HEADER
      ===================================== */}

      <div className="flex flex-col gap-4 border-b border-border-subtle pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-text-primary">
            Code Reviews
          </h2>

          <p className="text-xs text-muted">
            Track AI-assisted security, performance, maintainability and code
            quality reviews across your projects.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          icon={Plus}
          onClick={() => setIsWizardOpen(true)}
        >
          Start New Review
        </Button>
      </div>

      {/* ====================================
          REAL STATS
      ===================================== */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Loaded Reviews"
          value={reviews.length.toString()}
          subtitle={
            pagination.hasNextPage ? "more available" : "current result set"
          }
          icon={FileCheck2}
        />

        <StatCard
          title="Completed"
          value={completedCount.toString()}
          subtitle="analysis complete"
          icon={CheckCircle2}
        />

        <StatCard
          title="In Progress"
          value={inProgressCount.toString()}
          subtitle="queued or processing"
          icon={Clock3}
        />

        <StatCard
          title="Failed"
          value={failedCount.toString()}
          subtitle="review jobs"
          icon={XCircle}
        />
      </div>

      {/* ====================================
          FILTERS
      ===================================== */}

      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />

          <input
            type="text"
            placeholder="Search review, project, type or model..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="h-9 w-full rounded-lg border border-border-subtle bg-card pl-9 pr-3 text-xs text-text-primary placeholder:text-muted focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex w-full items-center gap-1.5 overflow-x-auto pb-1 sm:w-auto sm:pb-0">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === status
                  ? "border-border-hover bg-surface-hover text-text-primary"
                  : "border-transparent text-muted hover:text-text-secondary"
              }`}
            >
              {status === "ALL" ? "All" : formatStatus(status)}
            </button>
          ))}
        </div>
      </div>

      {/* ====================================
          ERROR
      ===================================== */}

      {error && (
        <div className="flex items-start justify-between gap-4 rounded-lg border border-error/25 bg-error/10 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-error" />

            <span className="text-xs text-error">{error}</span>
          </div>

          <button
            type="button"
            onClick={refetch}
            className="shrink-0 text-xs font-medium text-primary hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* ====================================
          TABLE
      ===================================== */}

      <Card className="overflow-hidden border-border-subtle p-0">
        {isLoading ? (
          <div className="flex min-h-56 items-center justify-center">
            <div className="flex items-center gap-2 text-xs text-muted">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Loading reviews...
            </div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center px-6 text-center">
            <FileCheck2 className="h-8 w-8 text-muted" />

            <h3 className="mt-3 text-sm font-semibold text-text-primary">
              No reviews found
            </h3>

            <p className="mt-1 max-w-md text-xs text-muted">
              {searchTerm
                ? "No loaded reviews match your search."
                : statusFilter !== "ALL"
                  ? `No ${formatStatus(statusFilter).toLowerCase()} reviews found.`
                  : "Start your first code review to see it here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border-subtle bg-surface font-mono text-[10px] uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3">Review / Target</th>

                  <th className="px-3 py-3">Status</th>

                  <th className="px-3 py-3">Overall Score</th>

                  <th className="px-3 py-3">Sec / Perf / Maint</th>

                  <th className="px-3 py-3">Issues</th>

                  <th className="px-3 py-3">AI Engine</th>

                  <th className="px-3 py-3">Duration</th>

                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border-subtle">
                {filteredReviews.map((review) => {
                  const overallScore = review?.scores?.overall;

                  const securityScore = review?.scores?.security;

                  const performanceScore = review?.scores?.performance;

                  const maintainabilityScore = review?.scores?.maintainability;

                  const totalIssues = review?.issueCounts?.total ?? 0;

                  const criticalIssues = review?.issueCounts?.critical ?? 0;

                  const projectName = getReviewProjectName(review);

                  const sourceType = getReviewSourceType(review);

                  return (
                    <tr
                      key={review._id}
                      onClick={() => openReview(review)}
                      className="group cursor-pointer transition-colors hover:bg-surface-hover/70"
                    >
                      {/* Target */}

                      <td className="px-5 py-3">
                        <div className="font-mono font-semibold text-primary group-hover:underline">
                          #{review._id}
                        </div>

                        <div className="font-medium text-text-primary">
                          {projectName}
                        </div>

                        <div className="font-mono text-[10px] text-muted">
                          {review.reviewType} • {sourceType}
                        </div>
                      </td>

                      {/* Status */}

                      <td className="px-3 py-3">
                        <StatusBadge status={formatStatus(review.status)} />

                        {review.status === "PROCESSING" &&
                          review?.progress?.percentage > 0 && (
                            <div className="mt-1 font-mono text-[10px] text-muted">
                              {review.progress.percentage}%
                            </div>
                          )}
                      </td>

                      {/* Overall */}

                      <td className="px-3 py-3 font-mono font-semibold">
                        {typeof overallScore === "number" ? (
                          <span
                            className={
                              overallScore >= 90
                                ? "text-success"
                                : overallScore >= 80
                                  ? "text-primary"
                                  : "text-warning"
                            }
                          >
                            {overallScore}
                            /100
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>

                      {/* Scores */}

                      <td className="px-3 py-3 font-mono text-[11px] text-muted">
                        {typeof overallScore === "number" ? (
                          <span>
                            <span className="text-success">
                              {securityScore ?? "—"}
                            </span>

                            {" / "}

                            <span className="text-secondary">
                              {performanceScore ?? "—"}
                            </span>

                            {" / "}

                            <span className="text-primary">
                              {maintainabilityScore ?? "—"}
                            </span>
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Issues */}

                      <td className="px-3 py-3 font-mono text-xs">
                        {review.status === "COMPLETED" ? (
                          <div className="flex items-center gap-1.5">
                            {criticalIssues > 0 && (
                              <span className="font-semibold text-error">
                                {criticalIssues}C
                              </span>
                            )}

                            <span className="text-text-secondary">
                              {totalIssues} total
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>

                      {/* Engine */}

                      <td className="max-w-44 px-3 py-3 font-mono text-[11px] text-muted">
                        <span
                          className="block truncate"
                          title={getEngine(review)}
                        >
                          {getEngine(review)}
                        </span>
                      </td>

                      {/* Duration */}

                      <td className="px-3 py-3 font-mono text-[11px] text-muted">
                        <div>{getDuration(review)}</div>

                        <div className="mt-0.5 whitespace-nowrap text-[10px]">
                          {formatDate(review.createdAt)}
                        </div>
                      </td>

                      {/* Action */}

                      <td className="px-5 py-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={ChevronRight}
                          onClick={(event) => {
                            event.stopPropagation();

                            openReview(review);
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ====================================
          PAGINATION
      ===================================== */}

      {!isLoading && pagination.hasNextPage && (
        <div className="flex justify-center">
          <Button
            size="sm"
            variant="secondary"
            disabled={isLoadingMore}
            onClick={loadMore}
          >
            {isLoadingMore ? "Loading..." : "Load More Reviews"}
          </Button>
        </div>
      )}

      {/* Start Review */}

      <StartReviewModal
        isOpen={isWizardOpen}
        onClose={handleCloseReviewModal}
        initialProjectId={initialProjectId}
      />
    </div>
  );
};

export default ReviewsPage;
