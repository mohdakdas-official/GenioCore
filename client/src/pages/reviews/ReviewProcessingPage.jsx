import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  CheckCircle2,
  Loader2,
  Cpu,
  FileCheck2,
  ArrowRight,
  Clock3,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

import { getReviewById, retryReview } from "../../services/review.service";
import PageMeta from "../../components/PageMeta";

const POLL_INTERVAL_MS = 2500;

const ReviewProcessingPage = () => {
  const { projectId, reviewId } = useParams();

  const navigate = useNavigate();

  const [review, setReview] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  const [isRetrying, setIsRetrying] = useState(false);

  /*
   * ----------------------------------------
   * LOAD REVIEW
   * ----------------------------------------
   */

  const fetchReview = useCallback(
    async ({ silent = false } = {}) => {
      if (!projectId || !reviewId) {
        setError("Project or review identifier is missing.");

        setIsLoading(false);

        return null;
      }

      if (!silent) {
        setIsLoading(true);
      }

      try {
        const response = await getReviewById({
          projectId,
          reviewId,
        });

        const reviewData = response?.data ?? null;

        setReview(reviewData);
        setError("");

        return reviewData;
      } catch (error) {
        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to retrieve review.",
        );

        return null;
      } finally {
        if (!silent) {
          setIsLoading(false);
        }
      }
    },
    [projectId, reviewId],
  );

  /*
   * Initial fetch
   */

  useEffect(() => {
    fetchReview();
  }, [fetchReview]);

  /*
   * ----------------------------------------
   * POLLING
   * ----------------------------------------
   *
   * Poll only while review can still change.
   */

  useEffect(() => {
    if (!review || !["QUEUED", "PROCESSING"].includes(review.status)) {
      return;
    }

    const timer = setInterval(() => {
      fetchReview({
        silent: true,
      });
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(timer);
    };
  }, [review?.status, fetchReview]);

  /*
   * ----------------------------------------
   * RETRY FAILED REVIEW
   * ----------------------------------------
   */

  const handleRetry = async () => {
    if (!projectId || !reviewId || isRetrying) {
      return;
    }

    setIsRetrying(true);
    setError("");

    try {
      await retryReview({
        projectId,
        reviewId,
      });

      await fetchReview({
        silent: true,
      });
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to retry review.",
      );
    } finally {
      setIsRetrying(false);
    }
  };

  /*
   * ----------------------------------------
   * STATES
   * ----------------------------------------
   */

  if (isLoading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="flex items-center gap-3 text-xs text-muted">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Loading review...
        </div>
      </div>
    );
  }

  if (error && !review) {
    return (
      <div className="mx-auto max-w-2xl py-10">
        <Card className="border-error/25 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-error" />

            <div>
              <h2 className="text-sm font-semibold text-text-primary">
                Unable to load review
              </h2>

              <p className="mt-1 text-xs text-muted">{error}</p>

              <Button
                className="mt-4"
                size="sm"
                variant="secondary"
                onClick={() => fetchReview()}
              >
                Try Again
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const status = review?.status ?? "QUEUED";

  const progress = review?.progress ?? {};

  const totalChunks = progress.totalChunks ?? 0;

  const completedChunks = progress.completedChunks ?? 0;

  const percentage = Math.min(100, Math.max(0, progress.percentage ?? 0));

  const isQueued = status === "QUEUED";

  const isProcessing = status === "PROCESSING";

  const isCompleted = status === "COMPLETED";

  const isFailed = status === "FAILED";

  const isCancelled = status === "CANCELLED";

  /*
   * These stages are derived from REAL
   * backend status/progress.
   *
   * No timers.
   */

  const stages = [
    {
      id: "queued",
      label: "Review queued for processing",
      icon: Clock3,
      completed: !isQueued,
      current: isQueued,
    },

    {
      id: "analysis",
      label:
        totalChunks > 0
          ? `Analyzing source code chunks (${completedChunks}/${totalChunks})`
          : "Preparing source analysis",
      icon: Cpu,
      completed: isCompleted || (isProcessing && percentage >= 100),
      current: isProcessing && percentage < 100,
    },

    {
      id: "aggregation",
      label: "Aggregating scores and findings",
      icon: FileCheck2,
      completed: isCompleted,
      current: isProcessing && percentage >= 100,
    },

    {
      id: "complete",
      label: "Review report ready",
      icon: CheckCircle2,
      completed: isCompleted,
      current: false,
    },
  ];

  const provider = review?.execution?.provider;

  const model = review?.execution?.model;

  const engineLabel =
    provider || model
      ? [provider, model && model !== provider ? model : null]
          .filter(Boolean)
          .join(" / ")
      : "AUTO routing";

  const statusMessage = (() => {
    if (isQueued) {
      return "Waiting for an available review worker.";
    }

    if (isProcessing) {
      if (totalChunks > 0) {
        return `${completedChunks} of ${totalChunks} code chunks analyzed.`;
      }

      return "Preparing and analyzing your source snapshot.";
    }

    if (isCompleted) {
      return "Code analysis completed successfully.";
    }

    if (isFailed) {
      return review?.failure?.message || "The review could not be completed.";
    }

    if (isCancelled) {
      return "This review was cancelled.";
    }

    return "Review status is being updated.";
  })();

  return (
    <>
      <PageMeta
        title="Review in Progress — GenioCore"
        description="Track the progress of your code review while GenioCore analyzes the project for security, performance, and maintainability issues."
      />
      <div className="mx-auto max-w-2xl py-10">
        <div className="space-y-8">
          {/* Heading */}

          <div className="space-y-2 text-center">
            <span className="rounded border border-border-subtle bg-surface px-2 py-0.5 font-mono text-[11px] text-muted">
              JOB #{reviewId}
            </span>

            <h2 className="text-2xl font-bold tracking-tight text-text-primary">
              {isCompleted
                ? "Analysis Complete"
                : isFailed
                  ? "Review Failed"
                  : isCancelled
                    ? "Review Cancelled"
                    : "AI Review in Progress"}
            </h2>

            <p className="text-xs text-muted">{statusMessage}</p>
          </div>

          {/* Failure */}

          {isFailed && (
            <div className="rounded-xl border border-error/25 bg-error/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-error" />

                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-semibold text-error">
                    Review processing failed
                  </h3>

                  <p className="mt-1 break-words text-xs leading-5 text-muted">
                    {review?.failure?.message ||
                      "The worker could not complete this review."}
                  </p>

                  {review?.failure?.code && (
                    <div className="mt-2 font-mono text-[10px] text-muted">
                      {review.failure.code}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Processing Card */}

          <Card className="space-y-6 border-border-subtle p-6">
            {/* Real progress */}

            {!isFailed && !isCancelled && (
              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <span className="text-xs font-medium text-text-primary">
                    Review progress
                  </span>

                  <span className="font-mono text-xs text-primary">
                    {isCompleted ? "100%" : `${percentage}%`}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-surface-hover">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{
                      width: `${isCompleted ? 100 : percentage}%`,
                    }}
                  />
                </div>

                {totalChunks > 0 && (
                  <div className="mt-2 text-right font-mono text-[10px] text-muted">
                    {completedChunks}/{totalChunks} chunks
                  </div>
                )}
              </div>
            )}

            {/* Stages */}

            <div className="space-y-3">
              {stages.map((stage) => {
                const Icon = stage.icon;

                return (
                  <div
                    key={stage.id}
                    className={`flex items-center justify-between rounded-lg border p-3.5 transition-all ${
                      stage.current
                        ? "border-primary/50 bg-surface-hover text-text-primary"
                        : stage.completed
                          ? "border-border-subtle bg-surface text-text-secondary"
                          : "border-transparent bg-surface/50 text-muted opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-md ${
                          stage.completed
                            ? "bg-success/15 text-success"
                            : stage.current
                              ? "bg-primary/15 text-primary"
                              : "bg-surface text-muted"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      <span className="text-xs font-medium">{stage.label}</span>
                    </div>

                    {stage.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : stage.current ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <span className="font-mono text-[10px] uppercase text-muted">
                        Pending
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Error during polling but we still have old data */}

            {error && review && (
              <div className="rounded-lg border border-warning/20 bg-warning/5 p-3 text-xs text-warning">
                Latest status refresh failed: {error}
              </div>
            )}

            {/* Footer */}

            <div className="flex flex-col gap-3 border-t border-border-subtle pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="font-mono text-[11px] text-muted">
                Engine: {engineLabel}
              </div>

              {isCompleted ? (
                <Button
                  variant="primary"
                  size="sm"
                  icon={ArrowRight}
                  iconPosition="right"
                  onClick={() =>
                    navigate(`/v1/projects/${projectId}/reviews/${reviewId}`)
                  }
                >
                  View Full Report
                </Button>
              ) : isFailed ? (
                <Button
                  variant="primary"
                  size="sm"
                  icon={isRetrying ? Loader2 : RotateCcw}
                  disabled={isRetrying || review?.failure?.retryable === false}
                  onClick={handleRetry}
                >
                  {isRetrying ? "Retrying..." : "Retry Review"}
                </Button>
              ) : (
                !isCancelled && (
                  <span className="flex items-center gap-2 text-xs text-muted">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />

                    {isQueued ? "Waiting for worker..." : "Analyzing code..."}
                  </span>
                )
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ReviewProcessingPage;
