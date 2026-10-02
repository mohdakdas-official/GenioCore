import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Activity,
  FileCheck2,
  FolderGit2,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

import { getProjects } from "../../services/project.service";

import { getReviews } from "../../services/review.service";
import PageMeta from "../../components/PageMeta";

const FILTERS = ["ALL", "Review", "Security", "Project"];

const ActivityPage = () => {
  const navigate = useNavigate();

  const [filter, setFilter] = useState("ALL");

  const [projects, setProjects] = useState([]);

  const [reviews, setReviews] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  const [hasMoreData, setHasMoreData] = useState(false);

  const getErrorMessage = (error) => {
    return (
      error?.response?.data?.message ||
      error?.message ||
      "Unable to load activity."
    );
  };

  const loadActivity = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const [
        reviewsResponse,
        activeProjectsResponse,
        archivedProjectsResponse,
      ] = await Promise.all([
        getReviews({
          limit: 20,
        }),

        getProjects({
          status: "ACTIVE",
          limit: 20,
        }),

        getProjects({
          status: "ARCHIVED",
          limit: 20,
        }),
      ]);

      const reviewsData = reviewsResponse?.data;

      const activeProjectsData = activeProjectsResponse?.data;

      const archivedProjectsData = archivedProjectsResponse?.data;

      const loadedProjects = [
        ...(activeProjectsData?.projects ?? []),
        ...(archivedProjectsData?.projects ?? []),
      ];

      setReviews(reviewsData?.reviews ?? []);

      setProjects(loadedProjects);

      setHasMoreData(
        Boolean(
          reviewsData?.pagination?.hasNextPage ||
          activeProjectsData?.pagination?.hasNextPage ||
          archivedProjectsData?.pagination?.hasNextPage,
        ),
      );
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  const projectMap = useMemo(() => {
    return new Map(projects.map((project) => [project._id, project]));
  }, [projects]);

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
    if (
      review?.projectId &&
      typeof review.projectId === "object" &&
      review.projectId?.name
    ) {
      return review.projectId.name;
    }

    const projectId = getReviewProjectId(review);

    if (!projectId) {
      return "Unknown Project";
    }

    return projectMap.get(projectId)?.name ?? "Unknown Project";
  };

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    const difference = Date.now() - date.getTime();

    if (difference < 0) {
      return date.toLocaleString();
    }

    const seconds = Math.floor(difference / 1000);

    if (seconds < 60) {
      return "Just now";
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
      return `${days}d ago`;
    }

    return date.toLocaleString();
  };

  const activityItems = useMemo(() => {
    const reviewEvents = reviews.map((review) => {
      const projectId = getReviewProjectId(review);

      const projectName = getProjectName(review);

      const shortId = review?._id?.slice(-8)?.toUpperCase() ?? "UNKNOWN";

      const reviewType = review?.reviewType ?? "FULL";

      const score = review?.scores?.overall;

      const issueCount = review?.issueCounts?.total ?? 0;

      if (review.status === "COMPLETED") {
        return {
          id: `review-${review._id}`,
          type: "review",

          title: `Review #${shortId} completed`,

          project: projectName,

          meta: reviewType,

          description: [
            typeof score === "number" ? `Score ${score}/100` : null,

            `${issueCount} findings`,
          ]
            .filter(Boolean)
            .join(" • "),

          timestamp: review.completedAt || review.updatedAt || review.createdAt,

          status: "success",

          link:
            projectId && review._id
              ? `/v1/projects/${projectId}/reviews/${review._id}`
              : null,
        };
      }

      if (review.status === "FAILED") {
        return {
          id: `review-${review._id}`,
          type: "review",

          title: `Review #${shortId} failed`,

          project: projectName,

          meta: reviewType,

          description: review?.failure?.message || "Review processing failed.",

          timestamp: review.failedAt || review.updatedAt || review.createdAt,

          status: "error",

          link:
            projectId && review._id
              ? `/v1/projects/${projectId}/reviews/${review._id}/processing`
              : null,
        };
      }

      if (review.status === "PROCESSING") {
        const percentage = review?.progress?.percentage;

        return {
          id: `review-${review._id}`,
          type: "review",

          title: `Review #${shortId} processing`,

          project: projectName,

          meta: reviewType,

          description:
            typeof percentage === "number"
              ? `${percentage}% complete`
              : "AI code analysis is in progress.",

          timestamp: review.startedAt || review.updatedAt || review.createdAt,

          status: "info",

          link:
            projectId && review._id
              ? `/v1/projects/${projectId}/reviews/${review._id}/processing`
              : null,
        };
      }

      if (review.status === "QUEUED") {
        return {
          id: `review-${review._id}`,
          type: "review",

          title: `Review #${shortId} queued`,

          project: projectName,

          meta: reviewType,

          description: "Waiting for review processing.",

          timestamp: review.queuedAt || review.createdAt,

          status: "info",

          link:
            projectId && review._id
              ? `/v1/projects/${projectId}/reviews/${review._id}/processing`
              : null,
        };
      }

      if (review.status === "CANCELLED") {
        return {
          id: `review-${review._id}`,
          type: "review",

          title: `Review #${shortId} cancelled`,

          project: projectName,

          meta: reviewType,

          description: "The review was cancelled.",

          timestamp: review.updatedAt || review.createdAt,

          status: "error",

          link:
            projectId && review._id
              ? `/v1/projects/${projectId}/reviews/${review._id}/processing`
              : null,
        };
      }

      return null;
    });

    /**
     * Derived from REAL review
     * issueCounts.
     *
     * This is not a separate
     * backend audit record.
     */
    const securityEvents = reviews
      .filter((review) => review.status === "COMPLETED")
      .map((review) => {
        const critical = review?.issueCounts?.critical ?? 0;

        const high = review?.issueCounts?.high ?? 0;

        if (critical === 0 && high === 0) {
          return null;
        }

        const projectId = getReviewProjectId(review);

        const shortId = review?._id?.slice(-8)?.toUpperCase() ?? "UNKNOWN";

        return {
          id: `security-${review._id}`,

          type: "security",

          title:
            critical > 0
              ? `${critical} critical finding${
                  critical === 1 ? "" : "s"
                } detected`
              : `${high} high severity finding${
                  high === 1 ? "" : "s"
                } detected`,

          project: getProjectName(review),

          meta: `Review #${shortId}`,

          description: `Critical: ${critical} • High: ${high} • Total: ${
            review?.issueCounts?.total ?? 0
          }`,

          timestamp: review.completedAt || review.updatedAt || review.createdAt,

          status: critical > 0 ? "error" : "warning",

          link:
            projectId && review._id
              ? `/v1/projects/${projectId}/reviews/${review._id}`
              : null,
        };
      });

    const projectEvents = projects.flatMap((project) => {
      const events = [];

      if (project?.createdAt) {
        events.push({
          id: `project-created-${project._id}`,

          type: "project",

          title: "Project created",

          project: project.name,

          meta: project.sourceType ?? "MANUAL",

          description: project.description || "Project added to the workspace.",

          timestamp: project.createdAt,

          status: "info",

          link: `/v1/projects/${project._id}`,
        });
      }

      if (project.status === "ARCHIVED" && project.archivedAt) {
        events.push({
          id: `project-archived-${project._id}`,

          type: "project",

          title: "Project archived",

          project: project.name,

          meta: "ARCHIVED",

          description: project.scheduledDeletionAt
            ? `Scheduled deletion: ${new Date(
                project.scheduledDeletionAt,
              ).toLocaleString()}`
            : "Project is archived and cannot start new reviews.",

          timestamp: project.archivedAt,

          status: "warning",

          link: `/v1/projects/${project._id}`,
        });
      }

      return events;
    });

    return [...reviewEvents, ...securityEvents, ...projectEvents]
      .filter((item) => item && item.timestamp)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
  }, [reviews, projects, projectMap]);

  const filtered = useMemo(() => {
    if (filter === "ALL") {
      return activityItems;
    }

    return activityItems.filter((item) => item.type === filter.toLowerCase());
  }, [activityItems, filter]);

  const getStatusIcon = (status, type) => {
    if (status === "error") {
      return <ShieldAlert className="h-4 w-4 text-error" />;
    }

    if (status === "success") {
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    }

    if (status === "warning") {
      return <ShieldAlert className="h-4 w-4 text-warning" />;
    }

    if (type === "project") {
      return <FolderGit2 className="h-4 w-4 text-secondary" />;
    }

    if (type === "review") {
      return <FileCheck2 className="h-4 w-4 text-primary" />;
    }

    return <Activity className="h-4 w-4 text-info" />;
  };

  return (
    <>
      <PageMeta
        title="Activity — GenioCore"
        description="View recent activity across your GenioCore projects, reviews, and account."
      />
      <div className="max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-border-subtle pb-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-text-primary">
              Recent Activity
            </h2>

            <p className="text-xs text-muted">
              Real review, security and project events from your workspace.
            </p>

            {hasMoreData && (
              <p className="mt-1 text-[10px] text-text-disabled">
                Showing activity from currently loaded records.
              </p>
            )}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {FILTERS.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setFilter(category)}
                className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${
                  filter === category
                    ? "border-border-hover bg-surface-hover text-text-primary"
                    : "border-transparent text-muted hover:text-text-secondary"
                }`}
              >
                {category}
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
                    Unable to load activity
                  </p>

                  <p className="mt-1 text-[11px] text-muted">{error}</p>
                </div>
              </div>

              <Button size="sm" variant="secondary" onClick={loadActivity}>
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Loading */}
        {isLoading ? (
          <Card className="py-12 text-center">
            <p className="text-xs text-muted">Loading activity...</p>
          </Card>
        ) : (
          <Card className="p-6">
            {filtered.length === 0 ? (
              <div className="py-10 text-center">
                <Activity className="mx-auto h-7 w-7 text-muted" />

                <h3 className="mt-3 text-sm font-semibold text-text-primary">
                  No activity found
                </h3>

                <p className="mt-1 text-xs text-muted">
                  {filter === "ALL"
                    ? "No review or project activity is available yet."
                    : `No ${filter.toLowerCase()} activity is available in the loaded records.`}
                </p>
              </div>
            ) : (
              <div className="relative space-y-8 pl-6 before:absolute before:bottom-3 before:left-2.5 before:top-3 before:w-px before:bg-border-subtle">
                {filtered.map((item) => (
                  <div
                    key={item.id}
                    className="group relative flex items-start justify-between gap-4"
                  >
                    {/* Timeline icon */}
                    <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-border-subtle bg-surface">
                      {getStatusIcon(item.status, item.type)}
                    </div>

                    <div className="min-w-0 space-y-1 pr-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xs font-semibold text-text-primary">
                          {item.title}
                        </h4>

                        <span className="rounded border border-border-subtle bg-surface px-2 py-0.5 font-mono text-[10px] text-muted">
                          {item.project}

                          {item.meta ? ` • ${item.meta}` : ""}
                        </span>
                      </div>

                      <p className="text-xs leading-relaxed text-muted">
                        {item.description}
                      </p>

                      <span className="block pt-0.5 font-mono text-[10px] text-text-disabled">
                        {formatDate(item.timestamp)}
                      </span>
                    </div>

                    {item.link && (
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={ExternalLink}
                        onClick={() => navigate(item.link)}
                        className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </>
  );
};

export default ActivityPage;
