import { useEffect, useMemo, useState } from "react";

import {
  FolderGit2,
  Plus,
  Search,
  LayoutGrid,
  List,
  ExternalLink,
  Play,
  CheckCircle2,
  Archive,
  Loader2,
  AlertTriangle,
} from "lucide-react";

import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/shared/StatCard";
import { CreateProjectModal } from "./CreateProjectModal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";

import { useNavigate } from "react-router-dom";

import { useProjects } from "../../hooks/useProjects";

const STATUS_FILTERS = ["ACTIVE", "ARCHIVED"];

const ProjectsPage = () => {
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState("ACTIVE");

  const [searchTerm, setSearchTerm] = useState("");

  const [viewMode, setViewMode] = useState("table");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [actionProjectId, setActionProjectId] = useState(null);

  const [confirmDialog, setConfirmDialog] = useState(null);

  const {
    projects,
    isLoading,
    isLoadingMore,
    error,
    pagination,

    createProject,
    archiveProject,
    restoreProject,

    loadMore,
  } = useProjects({
    status: statusFilter,
    limit: 20,
  });

  /*
   * ----------------------------------------
   * CREATE PROJECT
   * ----------------------------------------
   */

  const handleCreateProject = async (values) => {
    /*
     * IMPORTANT:
     *
     * Repository URL / branch are currently
     * not part of our active MANUAL ZIP flow.
     *
     * Map only real Project API fields.
     */

    const payload = {
      name: values.name.trim(),

      description: values.description?.trim() || "",

      techStack: {
        languages: values.languages ?? [],
        frameworks: values.frameworks ?? [],
      },
    };

    const response = await createProject(payload);

    const createdProject = response?.data;

    return createdProject;
  };

  const handleConfirmProjectAction = async () => {
    const project = confirmDialog?.project;

    if (!project?._id) {
      return;
    }

    setActionProjectId(project._id);

    try {
      if (confirmDialog.type === "archive") {
        await archiveProject(project._id);
      }

      if (confirmDialog.type === "restore") {
        await restoreProject(project._id);
      }

      // Close only after successful request.
      setConfirmDialog(null);
    } catch {
      // useProjects already stores the API error.
      // Keep dialog open if request fails.
    } finally {
      setActionProjectId(null);
    }
  };
  /*
   * ----------------------------------------
   * ARCHIVE / RESTORE
   * ----------------------------------------
   */

  const handleToggleArchive = (project) => {
    if (!project?._id) {
      return;
    }

    const isArchive = project.status === "ACTIVE";

    setConfirmDialog({
      project,
      type: isArchive ? "archive" : "restore",

      title: isArchive ? "Archive this project?" : "Restore this project?",

      description: isArchive
        ? `"${project.name}" will become read-only and new reviews cannot be started until you restore it.`
        : `"${project.name}" will become active again and new code reviews can be started.`,

      confirmText: isArchive ? "Archive Project" : "Restore Project",

      variant: isArchive ? "archive" : "restore",
    });
  };

  /*
   * ----------------------------------------
   * SEARCH
   * ----------------------------------------
   */

  const filteredProjects = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return projects;
    }

    return projects.filter((project) => {
      const name = project?.name?.toLowerCase() ?? "";

      const description = project?.description?.toLowerCase() ?? "";

      const languages = project?.techStack?.languages ?? [];

      const frameworks = project?.techStack?.frameworks ?? [];

      const stack = [...languages, ...frameworks]
        .map((item) => item?.name?.toLowerCase() ?? "")
        .join(" ");

      return (
        name.includes(query) ||
        description.includes(query) ||
        stack.includes(query)
      );
    });
  }, [projects, searchTerm]);

  /*
   * ----------------------------------------
   * HELPERS
   * ----------------------------------------
   */

  const getLanguages = (project) => project?.techStack?.languages ?? [];

  const getFrameworks = (project) => project?.techStack?.frameworks ?? [];

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    return new Date(value).toLocaleDateString();
  };

  const openProject = (projectId) => {
    navigate(`/v1/projects/${projectId}`);
  };

  const startReview = (projectId) => {
    /*
     * For now Reviews page opens wizard.
     * Later we can pass initialProjectId
     * directly from here.
     */

    navigate(`/v1/reviews?project=${projectId}`);
  };

  return (
    <div className="space-y-6">
      {/* ====================================
          HEADER
      ===================================== */}

      <div className="flex flex-col gap-4 border-b border-border-subtle pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-text-primary">
            Projects
          </h2>

          <p className="text-xs text-muted">
            Manage codebases and launch AI-assisted code reviews.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          icon={Plus}
          onClick={() => setIsModalOpen(true)}
        >
          New Project
        </Button>
      </div>

      {/* ====================================
          STATS
      ===================================== */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Loaded Projects"
          value={projects.length.toString()}
          subtitle={
            pagination.hasNextPage
              ? "more available"
              : statusFilter.toLowerCase()
          }
          icon={FolderGit2}
        />

        <StatCard
          title="Active View"
          value={statusFilter === "ACTIVE" ? projects.length.toString() : "—"}
          subtitle="active projects"
          icon={CheckCircle2}
        />

        <StatCard
          title="Review Metrics"
          value="—"
          subtitle="available from reviews"
        />

        <StatCard
          title="Average Health"
          value="—"
          subtitle="dashboard aggregation pending"
        />
      </div>

      {/* ====================================
          CONTROLS
      ===================================== */}

      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />

          <input
            type="text"
            placeholder="Search projects by name or stack..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="h-9 w-full rounded-lg border border-border-subtle bg-card pl-9 pr-3 text-xs text-text-primary placeholder:text-muted focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Status filter */}

          <div className="flex items-center rounded-lg border border-border-subtle bg-card p-0.5">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
                  statusFilter === status
                    ? "bg-surface-hover text-text-primary"
                    : "text-muted hover:text-text-secondary"
                }`}
              >
                {status === "ACTIVE" ? "Active" : "Archived"}
              </button>
            ))}
          </div>

          {/* View mode */}

          <div className="flex items-center rounded-lg border border-border-subtle bg-card p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === "table"
                  ? "bg-surface-hover text-text-primary"
                  : "text-muted"
              }`}
              title="Table view"
            >
              <List className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`rounded-md p-1.5 transition-colors ${
                viewMode === "cards"
                  ? "bg-surface-hover text-text-primary"
                  : "text-muted"
              }`}
              title="Cards view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ====================================
          ERROR
      ===================================== */}

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-error/25 bg-error/10 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-error" />

          <span className="text-xs text-error">{error}</span>
        </div>
      )}

      {/* ====================================
          CONTENT
      ===================================== */}

      {isLoading ? (
        <Card className="flex min-h-56 items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-muted">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Loading projects...
          </div>
        </Card>
      ) : filteredProjects.length === 0 ? (
        <Card className="py-12 text-center">
          <FolderGit2 className="mx-auto h-8 w-8 text-muted" />

          <h4 className="mt-3 text-sm font-semibold text-text-primary">
            No projects found
          </h4>

          <p className="mx-auto mt-1 max-w-sm text-xs text-muted">
            {searchTerm
              ? "No projects match your search."
              : statusFilter === "ARCHIVED"
                ? "You have no archived projects."
                : "Create your first project to start reviewing code."}
          </p>
        </Card>
      ) : viewMode === "table" ? (
        <Card className="overflow-hidden border-border-subtle p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border-subtle bg-surface font-mono text-[10px] uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3">Project</th>

                  <th className="px-3 py-3">Stack</th>

                  <th className="px-3 py-3">Source</th>

                  <th className="px-3 py-3">Status</th>

                  <th className="px-3 py-3">Updated</th>

                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border-subtle">
                {filteredProjects.map((project) => {
                  const languages = getLanguages(project);

                  const frameworks = getFrameworks(project);

                  return (
                    <tr
                      key={project._id}
                      onClick={() => openProject(project._id)}
                      className="group cursor-pointer transition-colors hover:bg-surface-hover/70"
                    >
                      <td className="px-5 py-3">
                        <div className="font-semibold text-text-primary transition-colors group-hover:text-primary">
                          {project.name}
                        </div>

                        <div className="max-w-xs truncate text-[11px] text-muted">
                          {project.description || "No description"}
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex max-w-full flex-wrap gap-1">
                          {[...languages, ...frameworks]
                            .slice(0, 4)
                            .map((item, index) => (
                              <span
                                key={`${item.name}-${index}`}
                                className="rounded border border-border-subtle bg-surface px-1.5 py-0.5 font-mono text-[10px] text-text-secondary"
                              >
                                {item.name}
                              </span>
                            ))}

                          {languages.length + frameworks.length > 4 && (
                            <span className="rounded border border-border-subtle bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted">
                              +{languages.length + frameworks.length - 4}
                            </span>
                          )}

                          {languages.length + frameworks.length === 0 && (
                            <span className="text-muted">—</span>
                          )}
                        </div>
                      </td>

                      <td className="px-3 py-3 font-mono text-[11px] text-muted">
                        {project.sourceType}
                      </td>

                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex rounded border px-2 py-0.5 font-mono text-[10px] ${
                            project.status === "ACTIVE"
                              ? "border-success/20 bg-success/10 text-success"
                              : "border-border-subtle bg-surface text-muted"
                          }`}
                        >
                          {project.status}
                        </span>
                      </td>

                      <td className="px-3 py-3 font-mono text-[11px] text-muted">
                        {formatDate(project.updatedAt)}
                      </td>

                      <td className="px-5 py-3 text-right">
                        <div
                          className="inline-flex items-center gap-1"
                          onClick={(event) => event.stopPropagation()}
                        >
                          {project.status === "ACTIVE" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              icon={Play}
                              title="Start Review"
                              onClick={() => startReview(project._id)}
                            />
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            icon={ExternalLink}
                            title="Open Project"
                            onClick={() => openProject(project._id)}
                          />

                          <Button
                            size="sm"
                            variant="ghost"
                            icon={
                              actionProjectId === project._id
                                ? Loader2
                                : Archive
                            }
                            disabled={actionProjectId === project._id}
                            title={
                              project.status === "ACTIVE"
                                ? "Archive Project"
                                : "Restore Project"
                            }
                            onClick={() => handleToggleArchive(project)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const stack = [...getLanguages(project), ...getFrameworks(project)];

            return (
              <Card
                key={project._id}
                hover
                onClick={() => openProject(project._id)}
                className="cursor-pointer space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold text-text-primary">
                      {project.name}
                    </h3>

                    <span
                      className={`rounded border px-2 py-0.5 font-mono text-[10px] ${
                        project.status === "ACTIVE"
                          ? "border-success/20 bg-success/10 text-success"
                          : "border-border-subtle bg-surface text-muted"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <p className="mt-1 line-clamp-2 text-xs text-muted">
                    {project.description || "No description"}
                  </p>
                </div>

                <div className="border-t border-border-subtle pt-3">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-muted">Source</span>

                    <span className="font-mono text-text-primary">
                      {project.sourceType}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {stack.slice(0, 4).map((item, index) => (
                      <span
                        key={`${item.name}-${index}`}
                        className="rounded border border-border-subtle bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted"
                      >
                        {item.name}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

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
            {isLoadingMore ? "Loading..." : "Load More Projects"}
          </Button>
        </div>
      )}

      {/* ====================================
          CREATE MODAL
      ===================================== */}

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateProject={handleCreateProject}
      />

      <ConfirmDialog
        isOpen={Boolean(confirmDialog)}
        title={confirmDialog?.title}
        description={confirmDialog?.description}
        confirmText={confirmDialog?.confirmText}
        variant={confirmDialog?.variant}
        isLoading={Boolean(actionProjectId)}
        onClose={() => {
          if (actionProjectId) return;

          setConfirmDialog(null);
        }}
        onConfirm={handleConfirmProjectAction}
      />
    </div>
  );
};

export default ProjectsPage;
