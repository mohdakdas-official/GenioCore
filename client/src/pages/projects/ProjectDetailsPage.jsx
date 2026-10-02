import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FolderGit2,
  Play,
  ArrowLeft,
  Shield,
  Zap,
  Wrench,
  CheckCircle,
  FileCheck2,
  AlertCircle,
  Activity as ActivityIcon,
  Settings as SettingsIcon,
  Archive,
  ArchiveRestore,
} from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Tabs } from "../../components/ui/Tabs";
import {
  StatusBadge,
  SeverityBadge,
} from "../../components/shared/StatusBadge";
import { StatCard } from "../../components/shared/StatCard";
import { Input, Textarea } from "../../components/ui/Input";
import { useProject } from "../../hooks/useProject";
import { useProjectReviews } from "../../hooks/useProjectReviews";
import { useReviewIssues } from "../../hooks/useReviewIssues";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";

const ProjectDetailsPage = () => {
  const { projectId } = useParams();
  const [confirmDialog, setConfirmDialog] = useState(null);
  const {
    project,
    isLoading: isProjectLoading,
    isUpdating,
    error: projectError,
    updateProject,
    archiveProject,
    restoreProject,
  } = useProject(projectId);

  const {
    reviews,
    latestCompletedReview,
    activeReview,

    isLoading: areReviewsLoading,
    isLoadingMore: areMoreReviewsLoading,

    error: reviewsError,

    pagination: reviewsPagination,

    loadMore: loadMoreReviews,
    refresh: refreshReviews,
  } = useProjectReviews(projectId);

  const {
    issues,
    isLoading: areIssuesLoading,
    isLoadingMore: areMoreIssuesLoading,
    error: issuesError,
    pagination: issuesPagination,
    loadMore: loadMoreIssues,
    refresh: refreshIssues,
  } = useReviewIssues({
    projectId,
    reviewId: latestCompletedReview?._id,
    limit: 50,
  });

  const scores = latestCompletedReview?.scores ?? null;

  const issueCounts = latestCompletedReview?.issueCounts ?? null;

  const languages = project?.techStack?.languages ?? [];

  const frameworks = project?.techStack?.frameworks ?? [];

  const completedReviews = reviews.filter(
    (review) => review.status === "COMPLETED",
  );

  const recentCompletedReviews = completedReviews.slice(0, 5);

  const formatDate = (value) => {
    if (!value) return "—";

    return new Date(value).toLocaleString();
  };
  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status.charAt(0) + status.slice(1).toLowerCase();
  };
  const getActivityDotClass = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-success";

      case "FAILED":
        return "bg-error";

      case "PROCESSING":
      case "QUEUED":
        return "bg-primary";

      case "CREATED":
        return "bg-primary";

      default:
        return "bg-border";
    }
  };
  const formatIssueLocation = (issue) => {
    const filePath = issue?.location?.filePath;
    const lineStart = issue?.location?.lineStart;
    const lineEnd = issue?.location?.lineEnd;

    if (!filePath) {
      return "Location unavailable";
    }

    if (lineStart == null) {
      return filePath;
    }

    if (lineEnd != null && lineEnd !== lineStart) {
      return `${filePath}:${lineStart}-${lineEnd}`;
    }

    return `${filePath}:${lineStart}`;
  };
  const getReviewDuration = (review) => {
    if (!review?.startedAt) {
      if (review?.status === "QUEUED") {
        return "Queued";
      }

      return "—";
    }

    if (review.status === "PROCESSING") {
      return "In progress";
    }

    const end = review.completedAt || review.failedAt;

    if (!end) return "—";

    const milliseconds =
      new Date(end).getTime() - new Date(review.startedAt).getTime();

    if (Number.isNaN(milliseconds) || milliseconds < 0) {
      return "—";
    }

    const seconds = Math.floor(milliseconds / 1000);

    if (seconds < 60) {
      return `${seconds}s`;
    }

    const minutes = Math.floor(seconds / 60);

    const remainingSeconds = seconds % 60;

    return `${minutes}m ${remainingSeconds}s`;
  };

  const openReview = (review) => {
    if (!review?._id) return;

    if (review.status === "COMPLETED") {
      navigate(`/v1/projects/${projectId}/reviews/${review._id}`);

      return;
    }

    navigate(`/v1/projects/${projectId}/reviews/${review._id}/processing`);
  };

  const activityEvents = [
    ...reviews.map((review) => {
      const shortId = review?._id?.slice(-8) ?? "Unknown";

      if (review.status === "COMPLETED") {
        const score = review.scores?.overall;

        const totalIssues = review.issueCounts?.total ?? 0;

        return {
          id: `review-${review._id}`,
          type: "review",
          review,
          status: review.status,
          timestamp: review.completedAt || review.updatedAt || review.createdAt,
          title: `Review #${shortId} completed`,
          description: [
            `${review.reviewType} review`,
            score != null ? `Score ${score}/100` : null,
            `${totalIssues} issues`,
          ]
            .filter(Boolean)
            .join(" • "),
        };
      }

      if (review.status === "FAILED") {
        return {
          id: `review-${review._id}`,
          type: "review",
          review,
          status: review.status,
          timestamp: review.failedAt || review.updatedAt || review.createdAt,
          title: `Review #${shortId} failed`,
          description:
            review.failure?.message ||
            `${review.reviewType} review failed during processing.`,
        };
      }

      if (review.status === "PROCESSING") {
        return {
          id: `review-${review._id}`,
          type: "review",
          review,
          status: review.status,
          timestamp: review.startedAt || review.updatedAt || review.createdAt,
          title: `Review #${shortId} processing`,
          description: `${review.reviewType} review • ${
            review.progress?.percentage ?? 0
          }% complete`,
        };
      }

      if (review.status === "QUEUED") {
        return {
          id: `review-${review._id}`,
          type: "review",
          review,
          status: review.status,
          timestamp: review.queuedAt || review.createdAt,
          title: `Review #${shortId} queued`,
          description: `${review.reviewType} review waiting for processing.`,
        };
      }

      if (review.status === "CANCELLED") {
        return {
          id: `review-${review._id}`,
          type: "review",
          review,
          status: review.status,
          timestamp: review.updatedAt || review.createdAt,
          title: `Review #${shortId} cancelled`,
          description: `${review.reviewType} review was cancelled.`,
        };
      }

      return {
        id: `review-${review._id}`,
        type: "review",
        review,
        status: review.status,
        timestamp: review.createdAt,
        title: `Review #${shortId} created`,
        description: `${review.reviewType} review created.`,
      };
    }),

    ...(project?.createdAt
      ? [
          {
            id: "project-created",
            type: "project",
            status: "CREATED",
            timestamp: project.createdAt,
            title: "Project created",
            description: `${project.name} was added to the workspace.`,
          },
        ]
      : []),

    ...(project?.createdAt &&
    project?.updatedAt &&
    Math.abs(
      new Date(project.updatedAt).getTime() -
        new Date(project.createdAt).getTime(),
    ) > 1000
      ? [
          {
            id: "project-updated",
            type: "project",
            status: "UPDATED",
            timestamp: project.updatedAt,
            title: "Project updated",
            description: "Project metadata or status was updated.",
          },
        ]
      : []),
  ]
    .filter((event) => event.timestamp)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, 20);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [settingsForm, setSettingsForm] = useState({
    name: "",
    description: "",
  });

  const [settingsError, setSettingsError] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState("");
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    if (!project) return;

    setSettingsForm({
      name: project.name ?? "",
      description: project.description ?? "",
    });
  }, [project?._id]);

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: FolderGit2,
    },
    {
      id: "reviews",
      label: "Reviews",
      icon: FileCheck2,
      badge: reviews.length > 0 ? reviews.length.toString() : undefined,
    },
    {
      id: "issues",
      label: "Issues",
      icon: AlertCircle,
      badge: issueCounts?.total > 0 ? issueCounts.total.toString() : undefined,
    },
    {
      id: "activity",
      label: "Activity",
      icon: ActivityIcon,
    },
    {
      id: "settings",
      label: "Settings",
      icon: SettingsIcon,
    },
  ];

  if (isProjectLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-xs text-muted">Loading project...</p>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-error" />

          <div>
            <h3 className="text-sm font-semibold text-text-primary">
              Unable to load project
            </h3>

            <p className="mt-1 text-xs text-muted">
              {projectError || "Project not found."}
            </p>

            <Button
              size="sm"
              variant="secondary"
              className="mt-4"
              onClick={() => navigate("/v1/projects")}
            >
              Back to Projects
            </Button>
          </div>
        </div>
      </Card>
    );
  }
  const getRequestError = (error) =>
    error?.response?.data?.message || error?.message || "Something went wrong.";

  const hasSettingsChanges =
    project &&
    (settingsForm.name.trim() !== project.name ||
      settingsForm.description.trim() !== (project.description ?? ""));

  const handleSaveProject = async () => {
    setSettingsError("");
    setSettingsSuccess("");

    const name = settingsForm.name.trim();
    const description = settingsForm.description.trim();

    if (!name) {
      setSettingsError("Project name is required.");
      return;
    }

    if (!hasSettingsChanges) {
      setSettingsSuccess("No changes to save.");
      return;
    }

    const payload = {};

    if (name !== project.name) {
      payload.name = name;
    }

    if (description !== (project.description ?? "")) {
      payload.description = description;
    }

    try {
      setPendingAction("save");

      await updateProject(payload);

      setSettingsSuccess("Project updated successfully.");
    } catch (error) {
      setSettingsError(getRequestError(error));
    } finally {
      setPendingAction(null);
    }
  };

  const handleArchiveProject = async () => {
    setSettingsError("");
    setSettingsSuccess("");

    try {
      setPendingAction("archive");

      await archiveProject();

      setSettingsSuccess("Project archived successfully.");
    } catch (error) {
      setSettingsError(getRequestError(error));

      throw error;
    } finally {
      setPendingAction(null);
    }
  };

  const handleRestoreProject = async () => {
    setSettingsError("");
    setSettingsSuccess("");

    try {
      setPendingAction("restore");

      await restoreProject();

      setSettingsSuccess("Project restored successfully.");
    } catch (error) {
      setSettingsError(getRequestError(error));

      throw error;
    } finally {
      setPendingAction(null);
    }
  };
  return (
    <div className="space-y-6">
      {/* Top Navigation & Breadcrumb Header */}
      <div className="flex flex-col gap-4 border-b border-border-subtle pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => navigate("/v1/projects")}
          />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-mono text-lg font-bold tracking-tight text-text-primary">
                {project.name}
              </h2>

              <span
                className={`rounded border px-2 py-0.5 font-mono text-[10px] ${
                  project.status === "ACTIVE"
                    ? "border-success/20 bg-success/10 text-success"
                    : "border-border-subtle bg-surface text-muted"
                }`}
              >
                {project.status}
              </span>

              <span className="rounded border border-border-subtle bg-surface px-2 py-0.5 font-mono text-[10px] text-muted">
                {project.sourceType}
              </span>
            </div>

            <p className="mt-0.5 max-w-2xl text-xs text-muted">
              {project.description || "No project description provided."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeReview ? (
            <Button
              size="sm"
              variant="secondary"
              icon={ActivityIcon}
              onClick={() =>
                navigate(
                  `/v1/projects/${projectId}/reviews/${activeReview._id}/processing`,
                )
              }
            >
              View Active Review
            </Button>
          ) : (
            project.status === "ACTIVE" && (
              <Button
                size="sm"
                variant="primary"
                icon={Play}
                onClick={() => navigate(`/v1/reviews?project=${projectId}`)}
              >
                Start New Review
              </Button>
            )
          )}
        </div>
      </div>

      {/* Latest Completed Review Scores */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Overall Code Score"
          value={scores?.overall != null ? `${scores.overall}/100` : "—"}
          subtitle={
            latestCompletedReview
              ? "Latest completed review"
              : "No completed review yet"
          }
          icon={CheckCircle}
        />

        <StatCard
          title="Security"
          value={scores?.security != null ? `${scores.security}/100` : "—"}
          subtitle={
            latestCompletedReview
              ? "Latest completed review"
              : "No completed review yet"
          }
          icon={Shield}
        />

        <StatCard
          title="Performance"
          value={
            scores?.performance != null ? `${scores.performance}/100` : "—"
          }
          subtitle={
            latestCompletedReview
              ? "Latest completed review"
              : "No completed review yet"
          }
          icon={Zap}
        />

        <StatCard
          title="Maintainability"
          value={
            scores?.maintainability != null
              ? `${scores.maintainability}/100`
              : "—"
          }
          subtitle={
            latestCompletedReview
              ? "Latest completed review"
              : "No completed review yet"
          }
          icon={Wrench}
        />
      </div>

      {/* Tabs Bar */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Panels */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* ====================================
        PROJECT + REVIEW SUMMARY
    ===================================== */}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Latest Review Summary */}
            <Card className="space-y-4 lg:col-span-2">
              <CardHeader
                title="Latest Review Summary"
                subtitle="Most recent completed code review"
              />

              {areReviewsLoading ? (
                <p className="text-xs text-muted">
                  Loading review information...
                </p>
              ) : reviewsError ? (
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 text-error" />

                  <p className="text-xs text-error">{reviewsError}</p>
                </div>
              ) : latestCompletedReview ? (
                <div className="space-y-5">
                  {/* Summary */}
                  <p className="text-xs leading-relaxed text-text-secondary">
                    {latestCompletedReview.summary ||
                      "Review completed successfully. No summary was provided."}
                  </p>

                  {/* Review metadata */}
                  <div className="grid grid-cols-2 gap-4 border-t border-border-subtle pt-4 md:grid-cols-4">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-muted">
                        Review Type
                      </span>

                      <span className="mt-1 block font-mono text-xs text-text-primary">
                        {latestCompletedReview.reviewType}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-muted">
                        Issues
                      </span>

                      <span className="mt-1 block font-mono text-xs text-text-primary">
                        {latestCompletedReview.issueCounts?.total ?? 0}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-muted">
                        Provider
                      </span>

                      <span className="mt-1 block font-mono text-xs text-text-primary">
                        {latestCompletedReview.execution?.provider || "AUTO"}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-muted">
                        Completed
                      </span>

                      <span className="mt-1 block text-xs text-text-primary">
                        {formatDate(latestCompletedReview.completedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Issue breakdown */}
                  <div className="border-t border-border-subtle pt-4">
                    <span className="mb-3 block text-[10px] uppercase tracking-wider text-muted">
                      Issue Breakdown
                    </span>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded border border-error/20 bg-error/10 px-2 py-1 font-mono text-[10px] text-error">
                        Critical{" "}
                        {latestCompletedReview.issueCounts?.critical ?? 0}
                      </span>

                      <span className="rounded border border-error/20 bg-error/5 px-2 py-1 font-mono text-[10px] text-error">
                        High {latestCompletedReview.issueCounts?.high ?? 0}
                      </span>

                      <span className="rounded border border-warning/20 bg-warning/10 px-2 py-1 font-mono text-[10px] text-warning">
                        Medium {latestCompletedReview.issueCounts?.medium ?? 0}
                      </span>

                      <span className="rounded border border-border-subtle bg-surface px-2 py-1 font-mono text-[10px] text-text-secondary">
                        Low {latestCompletedReview.issueCounts?.low ?? 0}
                      </span>

                      <span className="rounded border border-border-subtle bg-surface px-2 py-1 font-mono text-[10px] text-muted">
                        Info {latestCompletedReview.issueCounts?.info ?? 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        navigate(
                          `/v1/projects/${projectId}/reviews/${latestCompletedReview._id}`,
                        )
                      }
                    >
                      Open Full Report
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center">
                  <FileCheck2 className="mx-auto h-7 w-7 text-muted" />

                  <h4 className="mt-3 text-sm font-semibold text-text-primary">
                    No completed reviews
                  </h4>

                  <p className="mt-1 text-xs text-muted">
                    Run the first review to generate project scores and
                    findings.
                  </p>
                </div>
              )}
            </Card>

            {/* Project Details */}
            <Card className="space-y-4">
              <CardHeader title="Project Details" />

              <div className="space-y-4 text-xs">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-muted">
                    Source Type
                  </span>

                  <span className="mt-1 inline-flex rounded border border-border-subtle bg-surface px-2 py-0.5 font-mono text-[10px] text-text-primary">
                    {project.sourceType}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-muted">
                    Status
                  </span>

                  <span
                    className={`mt-1 inline-flex rounded border px-2 py-0.5 font-mono text-[10px] ${
                      project.status === "ACTIVE"
                        ? "border-success/20 bg-success/10 text-success"
                        : "border-border-subtle bg-surface text-muted"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-muted">
                    Languages
                  </span>

                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {languages.length > 0 ? (
                      languages.map((language) => (
                        <span
                          key={language.name}
                          className="rounded border border-border-subtle bg-surface px-2 py-0.5 font-mono text-[10px] text-text-primary"
                        >
                          {language.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-muted">
                    Frameworks & Tools
                  </span>

                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {frameworks.length > 0 ? (
                      frameworks.map((framework) => (
                        <span
                          key={framework.name}
                          className="rounded border border-border-subtle bg-surface px-2 py-0.5 font-mono text-[10px] text-text-secondary"
                        >
                          {framework.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </div>
                </div>

                <div className="border-t border-border-subtle pt-3">
                  <span className="block text-[10px] uppercase tracking-wider text-muted">
                    Created
                  </span>

                  <span className="mt-1 block text-[11px] text-text-secondary">
                    {formatDate(project.createdAt)}
                  </span>
                </div>

                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-muted">
                    Last Updated
                  </span>

                  <span className="mt-1 block text-[11px] text-text-secondary">
                    {formatDate(project.updatedAt)}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* ====================================
        RECENT COMPLETED REVIEWS
    ===================================== */}

          <Card className="overflow-hidden border-border-subtle p-0">
            <div className="flex items-center justify-between border-b border-border-subtle p-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                  Recent Completed Reviews
                </h4>

                <p className="mt-0.5 text-[11px] text-muted">
                  Latest completed reviews for this project
                </p>
              </div>

              {reviews.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setActiveTab("reviews")}
                >
                  View All
                </Button>
              )}
            </div>

            {areReviewsLoading ? (
              <div className="p-6 text-center text-xs text-muted">
                Loading reviews...
              </div>
            ) : recentCompletedReviews.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted">
                No completed reviews available.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border-subtle bg-surface font-mono text-[10px] uppercase tracking-wider text-muted">
                    <tr>
                      <th className="px-5 py-3">Review</th>

                      <th className="px-3 py-3">Type</th>

                      <th className="px-3 py-3">Score</th>

                      <th className="px-3 py-3">Issues</th>

                      <th className="px-3 py-3">Completed</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border-subtle">
                    {recentCompletedReviews.map((review) => (
                      <tr
                        key={review._id}
                        onClick={() =>
                          navigate(
                            `/v1/projects/${projectId}/reviews/${review._id}`,
                          )
                        }
                        className="cursor-pointer transition-colors hover:bg-surface-hover/70"
                      >
                        <td className="px-5 py-3">
                          <span className="font-mono text-[11px] font-semibold text-primary">
                            #{review._id.slice(-8)}
                          </span>
                        </td>

                        <td className="px-3 py-3 font-mono text-[11px] text-text-secondary">
                          {review.reviewType}
                        </td>

                        <td className="px-3 py-3 font-mono font-semibold text-text-primary">
                          {review.scores?.overall != null
                            ? `${review.scores.overall}/100`
                            : "—"}
                        </td>

                        <td className="px-3 py-3 font-mono text-[11px] text-muted">
                          {review.issueCounts?.total ?? 0}
                        </td>

                        <td className="px-3 py-3 text-[11px] text-muted">
                          {formatDate(review.completedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === "reviews" && (
        <Card className="overflow-hidden border-border-subtle p-0">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-subtle p-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                Project Review History
              </h4>

              <p className="mt-0.5 text-[11px] text-muted">
                Code reviews created for this project.
              </p>
            </div>

            <span className="font-mono text-[10px] text-muted">
              {reviews.length} loaded
            </span>
          </div>

          {/* Loading */}
          {areReviewsLoading ? (
            <div className="flex min-h-40 items-center justify-center">
              <p className="text-xs text-muted">Loading reviews...</p>
            </div>
          ) : reviewsError ? (
            /* Error */
            <div className="p-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error" />

                <div>
                  <p className="text-xs text-error">{reviewsError}</p>

                  <Button
                    size="sm"
                    variant="secondary"
                    className="mt-3"
                    onClick={refreshReviews}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            </div>
          ) : reviews.length === 0 ? (
            /* Empty */
            <div className="py-10 text-center">
              <FileCheck2 className="mx-auto h-7 w-7 text-muted" />

              <h4 className="mt-3 text-sm font-semibold text-text-primary">
                No reviews yet
              </h4>

              <p className="mt-1 text-xs text-muted">
                Start a review to analyze this project.
              </p>

              {project.status === "ACTIVE" && (
                <Button
                  size="sm"
                  variant="primary"
                  icon={Play}
                  className="mt-4"
                  onClick={() => navigate(`/v1/reviews?project=${projectId}`)}
                >
                  Start Review
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border-subtle bg-surface font-mono text-[10px] uppercase tracking-wider text-muted">
                    <tr>
                      <th className="px-5 py-3">Review</th>

                      <th className="px-3 py-3">Type</th>

                      <th className="px-3 py-3">Status</th>

                      <th className="px-3 py-3">Score</th>

                      <th className="px-3 py-3">Issues</th>

                      <th className="px-3 py-3">Engine</th>

                      <th className="px-3 py-3">Duration</th>

                      <th className="px-5 py-3 text-right">Created</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border-subtle">
                    {reviews.map((review) => {
                      const score = review.scores?.overall;

                      const issueCount = review.issueCounts?.total ?? 0;

                      const provider = review.execution?.provider;

                      const model = review.execution?.model;

                      return (
                        <tr
                          key={review._id}
                          onClick={() => openReview(review)}
                          className="group cursor-pointer transition-colors hover:bg-surface-hover/70"
                        >
                          {/* Review ID */}
                          <td className="px-5 py-3">
                            <div className="font-mono text-[11px] font-semibold text-primary group-hover:underline">
                              #{review._id.slice(-8)}
                            </div>

                            <div className="mt-0.5 font-mono text-[10px] text-muted">
                              {review.routingMode}
                            </div>
                          </td>

                          {/* Type */}
                          <td className="px-3 py-3">
                            <span className="font-mono text-[11px] text-text-secondary">
                              {review.reviewType}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-3 py-3">
                            <span
                              className={`inline-flex rounded border px-2 py-0.5 font-mono text-[10px] ${
                                review.status === "COMPLETED"
                                  ? "border-success/20 bg-success/10 text-success"
                                  : review.status === "FAILED"
                                    ? "border-error/20 bg-error/10 text-error"
                                    : review.status === "PROCESSING" ||
                                        review.status === "QUEUED"
                                      ? "border-primary/20 bg-primary/10 text-primary"
                                      : "border-border-subtle bg-surface text-muted"
                              }`}
                            >
                              {formatStatus(review.status)}
                            </span>
                          </td>

                          {/* Score */}
                          <td className="px-3 py-3 font-mono font-semibold text-text-primary">
                            {score != null ? `${score}/100` : "—"}
                          </td>

                          {/* Issues */}
                          <td className="px-3 py-3">
                            {review.status === "COMPLETED" ? (
                              <div className="font-mono text-[11px]">
                                <span className="text-text-primary">
                                  {issueCount}
                                </span>

                                {(review.issueCounts?.critical ?? 0) > 0 && (
                                  <span className="ml-1.5 text-error">
                                    ({review.issueCounts.critical} critical)
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>

                          {/* AI engine */}
                          <td className="px-3 py-3">
                            <div className="max-w-40">
                              <div className="font-mono text-[10px] text-text-secondary">
                                {provider || "AUTO"}
                              </div>

                              {model && (
                                <div className="truncate font-mono text-[9px] text-muted">
                                  {model}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Duration */}
                          <td className="px-3 py-3 font-mono text-[11px] text-muted">
                            {getReviewDuration(review)}
                          </td>

                          {/* Date */}
                          <td className="px-5 py-3 text-right text-[11px] text-muted">
                            {formatDate(review.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {reviewsPagination.hasNextPage && (
                <div className="flex justify-center border-t border-border-subtle p-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={areMoreReviewsLoading}
                    onClick={loadMoreReviews}
                  >
                    {areMoreReviewsLoading ? "Loading..." : "Load More Reviews"}
                  </Button>
                </div>
              )}
            </>
          )}
        </Card>
      )}

      {activeTab === "issues" && (
        <div className="space-y-4">
          {/* Header */}
          <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                Latest Review Findings
              </h4>

              <p className="mt-1 text-[11px] text-muted">
                {latestCompletedReview
                  ? `Issues detected in review #${latestCompletedReview._id.slice(-8)}`
                  : "No completed review available."}
              </p>
            </div>

            {latestCompletedReview && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  navigate(
                    `/v1/projects/${projectId}/reviews/${latestCompletedReview._id}`,
                  )
                }
              >
                Open Full Report
              </Button>
            )}
          </Card>

          {!latestCompletedReview ? (
            <Card className="py-10 text-center">
              <AlertCircle className="mx-auto h-7 w-7 text-muted" />

              <h4 className="mt-3 text-sm font-semibold text-text-primary">
                No findings available
              </h4>

              <p className="mt-1 text-xs text-muted">
                Complete a code review first to generate findings.
              </p>
            </Card>
          ) : areIssuesLoading ? (
            <Card className="py-10 text-center">
              <p className="text-xs text-muted">Loading findings...</p>
            </Card>
          ) : issuesError ? (
            <Card>
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error" />

                <div>
                  <p className="text-xs text-error">{issuesError}</p>

                  <Button
                    size="sm"
                    variant="secondary"
                    className="mt-3"
                    onClick={refreshIssues}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            </Card>
          ) : issues.length === 0 ? (
            <Card className="py-10 text-center">
              <CheckCircle className="mx-auto h-7 w-7 text-success" />

              <h4 className="mt-3 text-sm font-semibold text-text-primary">
                No issues found
              </h4>

              <p className="mt-1 text-xs text-muted">
                This review did not produce any findings.
              </p>
            </Card>
          ) : (
            <>
              <div className="space-y-3">
                {issues.map((issue) => (
                  <Card
                    key={issue._id}
                    className="space-y-3 border-border-subtle p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-center gap-2">
                        <SeverityBadge
                          severity={formatStatus(issue.severity)}
                        />

                        <span className="min-w-0 text-xs font-semibold text-text-primary">
                          {issue.title}
                        </span>
                      </div>

                      <span className="shrink-0 font-mono text-[10px] text-muted">
                        {formatIssueLocation(issue)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded border border-border-subtle bg-surface px-2 py-0.5 font-mono text-[9px] text-muted">
                        {issue.category}
                      </span>

                      <span className="rounded border border-border-subtle bg-surface px-2 py-0.5 font-mono text-[9px] text-muted">
                        {issue.status}
                      </span>

                      {issue.confidence != null && (
                        <span className="rounded border border-border-subtle bg-surface px-2 py-0.5 font-mono text-[9px] text-muted">
                          Confidence {Math.round(issue.confidence * 100)}%
                        </span>
                      )}

                      {issue.ruleId && (
                        <span className="rounded border border-border-subtle bg-surface px-2 py-0.5 font-mono text-[9px] text-muted">
                          {issue.ruleId}
                        </span>
                      )}
                    </div>

                    {issue.description && (
                      <p className="text-xs leading-relaxed text-text-secondary">
                        {issue.description}
                      </p>
                    )}

                    {issue.recommendation && (
                      <div className="rounded-lg border border-border-subtle bg-surface/60 p-3">
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted">
                          Recommendation
                        </span>

                        <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                          {issue.recommendation}
                        </p>
                      </div>
                    )}

                    {issue.codeSnippet && (
                      <div className="overflow-x-auto rounded-lg border border-border-subtle bg-background p-3">
                        <pre className="font-mono text-[10px] leading-relaxed text-text-secondary">
                          <code>{issue.codeSnippet}</code>
                        </pre>
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              {issuesPagination.hasNextPage && (
                <div className="flex justify-center">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={areMoreIssuesLoading}
                    onClick={loadMoreIssues}
                  >
                    {areMoreIssuesLoading ? "Loading..." : "Load More Issues"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === "activity" && (
        <Card className="p-5">
          <div className="mb-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
              Project Activity
            </h4>

            <p className="mt-1 text-[11px] text-muted">
              Recent project and review activity.
            </p>
          </div>

          {areReviewsLoading ? (
            <div className="py-8 text-center">
              <p className="text-xs text-muted">Loading activity...</p>
            </div>
          ) : reviewsError ? (
            <div className="flex items-start gap-2 py-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error" />

              <div>
                <p className="text-xs text-error">{reviewsError}</p>

                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-3"
                  onClick={refreshReviews}
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : activityEvents.length === 0 ? (
            <div className="py-8 text-center">
              <ActivityIcon className="mx-auto h-7 w-7 text-muted" />

              <p className="mt-3 text-xs text-muted">No activity available.</p>
            </div>
          ) : (
            <div className="relative space-y-6 pl-6 before:absolute before:bottom-2 before:left-2 before:top-2 before:w-px before:bg-border-subtle">
              {activityEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => {
                    if (event.type === "review" && event.review) {
                      openReview(event.review);
                    }
                  }}
                  className={`relative ${
                    event.type === "review" ? "cursor-pointer" : ""
                  }`}
                >
                  <div
                    className={`absolute -left-[19px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-background ${getActivityDotClass(
                      event.status,
                    )}`}
                  />

                  <div
                    className={
                      event.type === "review"
                        ? "rounded-lg transition-colors hover:bg-surface-hover/50"
                        : ""
                    }
                  >
                    <div className="text-xs font-semibold text-text-primary">
                      {event.title}
                    </div>

                    <div className="mt-0.5 text-[11px] leading-relaxed text-muted">
                      {event.description}
                    </div>

                    <div className="mt-1 font-mono text-[10px] text-text-disabled">
                      {formatDate(event.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === "settings" && (
        <div className="max-w-2xl space-y-6">
          {/* General Settings */}
          <Card className="space-y-4">
            <CardHeader
              title="General Settings"
              subtitle="Update basic project information"
            />

            <Input
              label="Project Name"
              value={settingsForm.name}
              disabled={isUpdating}
              onChange={(event) => {
                setSettingsForm((current) => ({
                  ...current,
                  name: event.target.value,
                }));

                setSettingsError("");
                setSettingsSuccess("");
              }}
            />

            <Textarea
              label="Description"
              value={settingsForm.description}
              disabled={isUpdating}
              onChange={(event) => {
                setSettingsForm((current) => ({
                  ...current,
                  description: event.target.value,
                }));

                setSettingsError("");
                setSettingsSuccess("");
              }}
            />

            {settingsError && (
              <div className="flex items-start gap-2 rounded-lg border border-error/20 bg-error/5 p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error" />

                <p className="text-xs text-error">{settingsError}</p>
              </div>
            )}

            {settingsSuccess && (
              <div className="flex items-start gap-2 rounded-lg border border-success/20 bg-success/5 p-3">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success" />

                <p className="text-xs text-success">{settingsSuccess}</p>
              </div>
            )}

            <div className="flex justify-end border-t border-border-subtle pt-4">
              <Button
                size="sm"
                variant="primary"
                disabled={isUpdating || !hasSettingsChanges}
                onClick={handleSaveProject}
              >
                {pendingAction === "save" ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </Card>

          {/* Project State */}
          <Card
            className={
              project.status === "ACTIVE"
                ? "space-y-4 border-warning/20 bg-warning/5"
                : "space-y-4 border-border-subtle"
            }
          >
            <CardHeader
              title="Project State"
              subtitle="Manage project availability"
            />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="text-xs font-semibold text-text-primary">
                    {project.status === "ACTIVE"
                      ? "Archive project"
                      : "Restore project"}
                  </h5>

                  <span
                    className={`rounded border px-2 py-0.5 font-mono text-[9px] ${
                      project.status === "ACTIVE"
                        ? "border-success/20 bg-success/10 text-success"
                        : "border-border-subtle bg-surface text-muted"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>

                <p className="mt-1 max-w-md text-[11px] leading-relaxed text-muted">
                  {project.status === "ACTIVE"
                    ? "Archived projects remain available for review history, but new reviews cannot be started until the project is restored."
                    : "Restore this project to make it active again and allow new code reviews."}
                </p>
              </div>

              {project.status === "ACTIVE" ? (
                <Button
                  size="sm"
                  variant="danger"
                  icon={Archive}
                  disabled={isUpdating}
                  onClick={() =>
                    setConfirmDialog({
                      type: "archive",
                      title: "Archive this project?",
                      description:
                        "The project will become read-only and new reviews cannot be started until you restore it.",
                      confirmText: "Archive Project",
                      variant: "archive",
                    })
                  }
                >
                  Archive
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="primary"
                  icon={ArchiveRestore}
                  disabled={isUpdating}
                  onClick={() =>
                    setConfirmDialog({
                      type: "restore",
                      title: "Restore this project?",
                      description:
                        "The project will become active again and new code reviews can be started.",
                      confirmText: "Restore Project",
                      variant: "restore",
                    })
                  }
                >
                  Restore
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}
      <ConfirmDialog
        isOpen={Boolean(confirmDialog)}
        title={confirmDialog?.title}
        description={confirmDialog?.description}
        confirmText={confirmDialog?.confirmText}
        variant={confirmDialog?.variant}
        isLoading={pendingAction === "archive" || pendingAction === "restore"}
        onClose={() => setConfirmDialog(null)}
        onConfirm={async () => {
          try {
            if (confirmDialog?.type === "archive") {
              await handleArchiveProject();
            }

            if (confirmDialog?.type === "restore") {
              await handleRestoreProject();
            }

            setConfirmDialog(null);
          } catch {
            // Error already shown in settings state.
            // Keep dialog open.
          }
        }}
      />
    </div>
  );
};

export default ProjectDetailsPage;
