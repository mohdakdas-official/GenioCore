import { useMemo, useState } from "react";

import {
  Bell,
  CheckCheck,
  ShieldAlert,
  FileCheck2,
  AlertCircle,
  Trash2,
  Loader2,
  ExternalLink,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { Card } from "../../components/ui/Card";

import { Button } from "../../components/ui/Button";

import { useNotifications } from "../../hooks/useNotifications";
import PageMeta from "../../components/PageMeta";

const NotificationsPage = () => {
  const navigate = useNavigate();

  const [filter, setFilter] = useState("ALL");

  const {
    notifications,
    unreadCount,
    pagination,
    isLoading,
    isLoadingMore,
    isUpdating,
    error,
    markAsRead,
    markAllAsRead,
    dismiss,
    loadMore,
    refresh,
  } = useNotifications({
    filter,
    limit: 20,
  });

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

  const getIcon = (type) => {
    switch (type) {
      case "SECURITY_ALERT":
        return ShieldAlert;

      case "REVIEW_FAILED":
        return AlertCircle;

      case "REVIEW_COMPLETED":
        return FileCheck2;

      default:
        return Bell;
    }
  };

  const getIconClass = (notification) => {
    if (notification.severity === "CRITICAL") {
      return "bg-error/15 text-error";
    }

    if (notification.severity === "HIGH") {
      return "bg-warning/15 text-warning";
    }

    return "bg-primary/15 text-primary";
  };

  const getNotificationLink = (notification) => {
    if (!notification?.projectId || !notification?.reviewId) {
      return null;
    }

    const projectId =
      typeof notification.projectId === "object"
        ? notification.projectId._id
        : notification.projectId;

    const reviewId =
      typeof notification.reviewId === "object"
        ? notification.reviewId._id
        : notification.reviewId;

    if (!projectId || !reviewId) {
      return null;
    }

    if (
      notification.type === "REVIEW_COMPLETED" ||
      notification.type === "SECURITY_ALERT"
    ) {
      return `/v1/projects/${projectId}/reviews/${reviewId}`;
    }

    return `/v1/projects/${projectId}/reviews/${reviewId}/processing`;
  };

  const visibleNotifications = useMemo(() => {
    return notifications;
  }, [notifications]);

  const handleOpenNotification = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    const link = getNotificationLink(notification);

    if (link) {
      navigate(link);
    }
  };

  return (
    <>
      <PageMeta
        title="Notifications — GenioCore"
        description="View review updates, alerts, and important activity notifications across your GenioCore workspace."
      />
      <div className="max-w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-border-subtle pb-2 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-text-primary">
                Notification Center
              </h2>

              {unreadCount > 0 && (
                <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-primary">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <p className="text-xs text-muted">
              Review completion, failures and security findings from your code
              analysis workflow.
            </p>
          </div>

          <Button
            size="sm"
            variant="ghost"
            icon={CheckCheck}
            onClick={markAllAsRead}
            disabled={unreadCount === 0 || isUpdating}
          >
            Mark all read
          </Button>
        </div>

        {/* Error */}
        {error && (
          <Card className="border-error/20">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-error">
                  Unable to process notifications
                </p>

                <p className="mt-1 text-[11px] text-muted">{error}</p>
              </div>

              <Button size="sm" variant="secondary" onClick={refresh}>
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Filters */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === "ALL"
                ? "border-border-hover bg-surface-hover text-text-primary"
                : "border-transparent text-muted hover:text-text-secondary"
            }`}
          >
            All
          </button>

          <button
            type="button"
            onClick={() => setFilter("UNREAD")}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === "UNREAD"
                ? "border-border-hover bg-surface-hover text-text-primary"
                : "border-transparent text-muted hover:text-text-secondary"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <Card className="py-12 text-center">
            <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted" />

            <p className="mt-2 text-xs text-muted">Loading notifications...</p>
          </Card>
        ) : visibleNotifications.length === 0 ? (
          <Card className="py-12 text-center">
            <Bell className="mx-auto h-8 w-8 text-muted opacity-40" />

            <p className="mt-2 text-xs text-muted">
              {filter === "UNREAD"
                ? "No unread notifications."
                : "No notifications yet."}
            </p>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {visibleNotifications.map((notification) => {
              const Icon = getIcon(notification.type);

              const link = getNotificationLink(notification);

              return (
                <Card
                  key={notification._id}
                  className={`border p-4 transition-colors ${
                    !notification.isRead
                      ? "border-border-hover bg-surface"
                      : "border-border-subtle bg-card opacity-80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => handleOpenNotification(notification)}
                      className="flex min-w-0 flex-1 items-start gap-3 text-left"
                    >
                      <div
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${getIconClass(
                          notification,
                        )}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-xs font-semibold text-text-primary">
                            {notification.title}
                          </h4>

                          {!notification.isRead && (
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          )}
                        </div>

                        <p className="text-xs leading-relaxed text-muted">
                          {notification.message}
                        </p>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[10px] text-text-disabled">
                            {formatDate(notification.createdAt)}
                          </span>

                          {notification.severity &&
                            notification.severity !== "NORMAL" && (
                              <span
                                className={`rounded border px-1.5 py-0.5 font-mono text-[9px] ${
                                  notification.severity === "CRITICAL"
                                    ? "border-error/20 bg-error/10 text-error"
                                    : "border-warning/20 bg-warning/10 text-warning"
                                }`}
                              >
                                {notification.severity}
                              </span>
                            )}

                          {link && (
                            <ExternalLink className="h-3 w-3 text-muted" />
                          )}
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => dismiss(notification._id)}
                      disabled={isUpdating}
                      className="shrink-0 p-1 text-muted transition-colors hover:text-error disabled:opacity-50"
                      title="Dismiss notification"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </Card>
              );
            })}

            {pagination.hasNextPage && (
              <div className="flex justify-center pt-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={loadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationsPage;
