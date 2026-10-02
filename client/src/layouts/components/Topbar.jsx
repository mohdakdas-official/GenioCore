import {
  Bell,
  BellRing,
  ChevronRight,
  FileSearch,
  FolderKanban,
  LayoutGrid,
  Loader2,
  Menu,
  Plus,
  Search,
  ShieldAlert,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";

import { useContext, useEffect, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import { Button } from "../../components/ui/Button";

import { Avatar } from "../../components/ui/Avatar";

import { AuthContext } from "../../context/AuthContext";

import { useNotifications } from "../../hooks/useNotifications";

import { useGlobalSearch } from "../../hooks/useGlobalSearch";

const getId = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === "object") {
    return value._id;
  }

  return value;
};

export const Topbar = ({ onOpenMobile }) => {
  const { user } = useContext(AuthContext);

  const navigate = useNavigate();

  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const searchInputRef = useRef(null);

  const {
    projects,
    reviews,
    issues,
    notifications: searchNotifications,
    navigation,
    actions,
    isSearching,
    error: searchError,
    hasResults,
  } = useGlobalSearch(searchTerm);

  const { unreadCount } = useNotifications({
    filter: "UNREAD",
    limit: 1,
  });

  const getGreeting = () => {
    const hours = new Date().getHours();

    if (hours < 12) {
      return "Good morning";
    }

    if (hours < 18) {
      return "Good afternoon";
    }

    return "Good evening";
  };

  const firstName = user?.fullname
    ? user.fullname.trim().split(/\s+/)[0]
    : user?.username || "there";

  const openSearch = () => {
    setIsSearchOpen(true);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchTerm("");
  };

  const handleNavigate = (path) => {
    closeSearch();
    navigate(path);
  };

  const handleProjectOpen = (projectId) => {
    handleNavigate(`/v1/projects/${projectId}`);
  };

  const handleReviewOpen = (review) => {
    const projectId = getId(review?.projectId);

    if (!projectId) {
      return;
    }

    if (review.status === "COMPLETED") {
      handleNavigate(`/v1/projects/${projectId}/reviews/${review._id}`);

      return;
    }

    handleNavigate(
      `/v1/projects/${projectId}/reviews/${review._id}/processing`,
    );
  };

  const handleIssueOpen = (issue) => {
    const projectId = getId(issue?.projectId);

    const reviewId = getId(issue?.reviewId);

    if (!projectId || !reviewId) {
      return;
    }

    handleNavigate(`/v1/projects/${projectId}/reviews/${reviewId}`);
  };

  const handleNotificationOpen = (notification) => {
    const projectId = getId(notification?.projectId);

    const reviewId = getId(notification?.reviewId);

    if (projectId && reviewId) {
      if (
        notification.type === "REVIEW_COMPLETED" ||
        notification.type === "SECURITY_ALERT"
      ) {
        handleNavigate(`/v1/projects/${projectId}/reviews/${reviewId}`);

        return;
      }

      handleNavigate(
        `/v1/projects/${projectId}/reviews/${reviewId}/processing`,
      );

      return;
    }

    handleNavigate("/v1/notifications");
  };

  /*
   * Ctrl/Cmd + K
   */
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();

        setIsSearchOpen((current) => !current);

        return;
      }

      if (event.key === "Escape" && isSearchOpen) {
        closeSearch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }

    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  }, [isSearchOpen]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border-subtle bg-surface/80 px-4 backdrop-blur-md sm:px-6">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobile}
            className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-text-primary lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            <h1 className="text-xs font-semibold tracking-tight text-text-primary">
              {getGreeting()}, {firstName}
            </h1>

            <p className="hidden text-[11px] text-muted sm:block">
              Review your projects, analysis and latest activity.
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={openSearch}
            className="hidden h-8 items-center cursor-pointer gap-2 rounded-lg border border-border-subtle bg-card px-3 text-xs text-muted transition-colors hover:border-border-hover hover:text-text-secondary md:flex"
          >
            <Search className="h-3.5 w-3.5" />

            <span>Search platform...</span>

            <kbd className="rounded border border-border-subtle bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted">
              Ctrl K
            </kbd>
          </button>

          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            title="Start Review"
            onClick={() => navigate("/v1/reviews?start=1")}
          >
            <span className="hidden sm:inline">Start Review</span>
          </Button>

          <button
            type="button"
            onClick={() => navigate("/v1/notifications")}
            className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
          >
            <Bell className="h-4 w-4" />

            {unreadCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex min-h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-1 font-mono text-[8px] font-bold text-primary-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <div className="mx-0.5 hidden h-4 w-px bg-border-subtle sm:block" />

          <button
            type="button"
            onClick={() => navigate("/v1/settings")}
            className="rounded-lg p-1 transition-colors hover:bg-surface-hover cursor-pointer"
          >
            <Avatar
              name={user?.fullname || user?.username}
              email={user?.email}
              size="sm"
              src={user?.avatar}
            />
          </button>
        </div>
      </header>

      {/* Global Search */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-100 flex items-start justify-center bg-black/50 px-4 pt-[10vh] backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeSearch();
            }
          }}
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-border-subtle bg-card shadow-xl">
            {/* Input */}
            <div className="flex items-center gap-3 border-b border-border-subtle px-4">
              <Search className="h-4 w-4 shrink-0 text-muted" />

              <input
                ref={searchInputRef}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search projects, reviews, issues, notifications, pages..."
                className="h-12 min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-muted"
              />

              {isSearching && (
                <Loader2 className="h-4 w-4 animate-spin text-muted" />
              )}

              <button
                type="button"
                onClick={closeSearch}
                className="rounded-md p-1 text-muted hover:bg-surface-hover hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[65vh] overflow-y-auto p-2">
              {searchTerm.trim().length < 2 ? (
                <div className="px-4 py-12 text-center">
                  <Search className="mx-auto h-7 w-7 text-muted opacity-40" />

                  <p className="mt-2 text-xs font-medium text-text-primary">
                    Search the entire platform
                  </p>

                  <p className="mt-1 text-[11px] text-muted">
                    Projects, reviews, findings, notifications and platform
                    pages.
                  </p>
                </div>
              ) : searchError && !hasResults ? (
                <div className="px-4 py-10 text-center">
                  <XCircle className="mx-auto h-6 w-6 text-error" />

                  <p className="mt-2 text-xs text-error">{searchError}</p>
                </div>
              ) : !hasResults && !isSearching ? (
                <div className="px-4 py-12 text-center">
                  <Search className="mx-auto h-7 w-7 text-muted opacity-40" />

                  <p className="mt-2 text-xs font-medium text-text-primary">
                    No results found
                  </p>

                  <p className="mt-1 text-[11px] text-muted">
                    Try a project name, file, finding, review status, provider
                    or page name.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Actions */}
                  {actions.length > 0 && (
                    <SearchSection title="Actions">
                      {actions.map((item) => (
                        <SearchRow
                          key={item.id}
                          icon={Sparkles}
                          title={item.label}
                          description={item.description}
                          onClick={() => handleNavigate(item.path)}
                        />
                      ))}
                    </SearchSection>
                  )}

                  {/* Navigation */}
                  {navigation.length > 0 && (
                    <SearchSection title="Pages">
                      {navigation.map((item) => (
                        <SearchRow
                          key={item.id}
                          icon={LayoutGrid}
                          title={item.label}
                          description={item.description}
                          onClick={() => handleNavigate(item.path)}
                        />
                      ))}
                    </SearchSection>
                  )}

                  {/* Projects */}
                  {projects.length > 0 && (
                    <SearchSection title="Projects">
                      {projects.map((project) => (
                        <SearchRow
                          key={project._id}
                          icon={FolderKanban}
                          title={project.name}
                          description={
                            project.description || `${project.status} project`
                          }
                          meta={project.status}
                          onClick={() => handleProjectOpen(project._id)}
                        />
                      ))}
                    </SearchSection>
                  )}

                  {/* Reviews */}
                  {reviews.length > 0 && (
                    <SearchSection title="Reviews">
                      {reviews.map((review) => (
                        <SearchRow
                          key={review._id}
                          icon={FileSearch}
                          title={review.projectId?.name || "Code Review"}
                          description={review.summary || review._id}
                          meta={`${review.reviewType} • ${review.status}`}
                          onClick={() => handleReviewOpen(review)}
                        />
                      ))}
                    </SearchSection>
                  )}

                  {/* Issues */}
                  {issues.length > 0 && (
                    <SearchSection title="Findings">
                      {issues.map((issue) => (
                        <SearchRow
                          key={issue._id}
                          icon={ShieldAlert}
                          title={issue.title}
                          description={
                            issue.location?.filePath || issue.description
                          }
                          meta={`${issue.severity} • ${issue.category}`}
                          onClick={() => handleIssueOpen(issue)}
                        />
                      ))}
                    </SearchSection>
                  )}

                  {/* Notifications */}
                  {searchNotifications.length > 0 && (
                    <SearchSection title="Notifications">
                      {searchNotifications.map((notification) => (
                        <SearchRow
                          key={notification._id}
                          icon={BellRing}
                          title={notification.title}
                          description={notification.message}
                          meta={notification.severity}
                          onClick={() => handleNotificationOpen(notification)}
                        />
                      ))}
                    </SearchSection>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-border-subtle bg-surface/50 px-4 py-2">
              <span className="text-[10px] text-muted">
                Search across your workspace
              </span>

              <span className="font-mono text-[10px] text-text-disabled">
                ESC to close
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const SearchSection = ({ title, children }) => {
  return (
    <section>
      <p className="px-2 pb-1.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-text-disabled">
        {title}
      </p>

      <div className="space-y-1">{children}</div>
    </section>
  );
};

const SearchRow = ({ icon: Icon, title, description, meta, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-surface-hover"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-surface">
        <Icon className="h-4 w-4 text-primary" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-xs font-semibold text-text-primary">
            {title}
          </p>

          {meta && (
            <span className="shrink-0 rounded border border-border-subtle px-1.5 py-0.5 font-mono text-[8px] text-muted">
              {meta}
            </span>
          )}
        </div>

        {description && (
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-muted">
            {description}
          </p>
        )}
      </div>

      <ChevronRight className="mt-2 h-3.5 w-3.5 shrink-0 text-muted" />
    </button>
  );
};
