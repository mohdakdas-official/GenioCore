import { useEffect, useState } from "react";

import { Modal } from "../../components/ui/Model";
import { Button } from "../../components/ui/Button";

import {
  FolderGit2,
  GitBranch,
  UploadCloud,
  Cpu,
  CheckCircle2,
  FileCode,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { getProjects } from "../../services/project.service";
import { uploadSnapshot } from "../../services/snapshot.service";
import { createReview } from "../../services/review.service";
import PageMeta from "../../components/PageMeta";

export const StartReviewModal = ({
  isOpen,
  onClose,
  initialProjectId = null,
}) => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  /*
   * Real projects
   */
  const [projects, setProjects] = useState([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);

  /*
   * Review form
   */
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId);

  const [sourceType, setSourceType] = useState("upload");

  const [uploadedFile, setUploadedFile] = useState(null);

  /*
   * Backend artifacts
   */
  const [snapshotId, setSnapshotId] = useState(null);

  /*
   * UI state
   */
  const [isUploading, setIsUploading] = useState(false);

  const [isCreatingReview, setIsCreatingReview] = useState(false);

  const [error, setError] = useState("");

  /*
   * Backend currently supports these review types.
   *
   * FULL maps best to the current "all scopes"
   * experience.
   */
  const [reviewType, setReviewType] = useState("FULL");

  /*
   * -----------------------------------------
   * Load real projects
   * -----------------------------------------
   */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const loadProjects = async () => {
      setIsProjectsLoading(true);
      setError("");

      try {
        const response = await getProjects({
          status: "ACTIVE",
          limit: 20,
        });

        const realProjects = response?.data?.projects ?? [];

        setProjects(realProjects);

        const hasInitialProject =
          initialProjectId &&
          realProjects.some((project) => project._id === initialProjectId);

        if (hasInitialProject) {
          setSelectedProjectId(initialProjectId);
        } else if (realProjects.length > 0) {
          setSelectedProjectId(realProjects[0]._id);
        } else {
          setSelectedProjectId(null);
        }
      } catch (error) {
        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to load projects.",
        );
      } finally {
        setIsProjectsLoading(false);
      }
    };

    loadProjects();
  }, [isOpen, initialProjectId]);

  /*
   * Reset transient wizard state when closed.
   */

  useEffect(() => {
    if (!isOpen) {
      setStep(1);

      setSourceType("upload");

      setUploadedFile(null);
      setSnapshotId(null);

      setReviewType("FULL");

      setError("");
    }
  }, [isOpen]);

  const selectedProject =
    projects.find((project) => project._id === selectedProjectId) ?? null;

  /*
   * -----------------------------------------
   * File selection
   * -----------------------------------------
   */

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    setError("");
    setSnapshotId(null);

    if (!file) {
      setUploadedFile(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith(".zip")) {
      setUploadedFile(null);

      setError("Only ZIP archives are supported.");

      event.target.value = "";

      return;
    }

    setUploadedFile(file);
  };

  /*
   * -----------------------------------------
   * Wizard continue
   * -----------------------------------------
   */

  const handleContinue = async () => {
    setError("");

    /*
     * STEP 1
     */

    if (step === 1) {
      if (!selectedProjectId) {
        setError("Please select a project.");

        return;
      }

      setStep(2);
      return;
    }

    /*
     * STEP 2
     *
     * Snapshot is uploaded HERE.
     *
     * We don't wait until final submit because
     * Review creation needs snapshotId.
     */

    if (step === 2) {
      if (sourceType !== "upload") {
        setError(
          "Remote Git fetch is not available yet. Please upload a ZIP snapshot.",
        );

        return;
      }

      if (!uploadedFile) {
        setError("Please select a ZIP archive.");

        return;
      }

      /*
       * If this exact wizard session already
       * uploaded the file, don't upload again
       * when user goes Back → Continue.
       */

      if (snapshotId) {
        setStep(3);
        return;
      }

      setIsUploading(true);

      try {
        const response = await uploadSnapshot({
          projectId: selectedProjectId,
          file: uploadedFile,
        });

        const createdSnapshot = response?.data;

        const realSnapshotId = createdSnapshot?.snapshot?._id;

        if (!realSnapshotId) {
          throw new Error(
            "Snapshot was created but no snapshot ID was returned.",
          );
        }

        setSnapshotId(realSnapshotId);

        setStep(3);
      } catch (error) {
        setError(
          error?.response?.data?.message ||
            error?.message ||
            "Unable to upload code snapshot.",
        );
      } finally {
        setIsUploading(false);
      }

      return;
    }

    /*
     * STEP 3
     */

    if (step === 3) {
      setStep(4);
    }
  };

  /*
   * -----------------------------------------
   * Create real Review
   * -----------------------------------------
   */

  const handleStartReview = async () => {
    if (!selectedProjectId || !snapshotId) {
      setError("Project snapshot is missing.");

      return;
    }

    setIsCreatingReview(true);
    setError("");

    try {
      const response = await createReview({
        projectId: selectedProjectId,

        snapshotId,

        reviewType,

        routingMode: "AUTO",
      });

      const review = response?.data;

      const reviewId = review?._id;

      if (!reviewId) {
        throw new Error("Review was queued but no review ID was returned.");
      }

      onClose();

      navigate(
        `/v1/projects/${selectedProjectId}/reviews/${reviewId}/processing`,
        {
          state: {
            projectId: selectedProjectId,
          },
        },
      );
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to start review.",
      );
    } finally {
      setIsCreatingReview(false);
    }
  };

  const isBusy = isUploading || isCreatingReview;

  return (
    <>
      <PageMeta
        title="Reviews — GenioCore"
        description="View and manage your GenioCore code reviews, track review status, and access completed review reports."
      />
      <Modal
        isOpen={isOpen}
        onClose={isBusy ? undefined : onClose}
        title="Trigger AI Code Review"
        subtitle={`Step ${step} of 4 — ${
          step === 1
            ? "Target Project"
            : step === 2
              ? "Source Snapshot"
              : step === 3
                ? "Analysis Configuration"
                : "Review Summary"
        }`}
        maxWidth="max-w-xl"
      >
        <div className="space-y-6">
          {/* Progress */}

          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  item <= step
                    ? "bg-primary"
                    : "bg-surface-hover border border-border-subtle"
                }`}
              />
            ))}
          </div>

          {/* STEP 1 */}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-text-primary">
                  Select Target Project
                </label>

                {isProjectsLoading ? (
                  <div className="flex items-center justify-center gap-2 rounded-lg border border-border-subtle bg-surface py-8 text-xs text-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading projects...
                  </div>
                ) : projects.length === 0 ? (
                  <div className="rounded-lg border border-border-subtle bg-surface p-4 text-xs text-muted">
                    No active projects available. Create a project first.
                  </div>
                ) : (
                  <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                    {projects.map((project) => {
                      const isSelected = selectedProjectId === project._id;

                      return (
                        <button
                          key={project._id}
                          type="button"
                          onClick={() => {
                            setSelectedProjectId(project._id);

                            /*
                             * Different project
                             * means old snapshot
                             * cannot be reused.
                             */

                            setUploadedFile(null);

                            setSnapshotId(null);
                          }}
                          className={`flex w-full items-center justify-between rounded-lg border p-3 text-left transition-all ${
                            isSelected
                              ? "border-primary bg-surface-hover text-text-primary"
                              : "border-border-subtle bg-surface text-text-secondary hover:border-border-hover"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <FolderGit2 className="h-4 w-4 shrink-0 text-primary" />

                            <div>
                              <div className="text-xs font-semibold">
                                {project.name}
                              </div>

                              <div className="mt-0.5 text-[10px] font-mono text-muted">
                                {project.sourceType} • {project.status}
                              </div>
                            </div>
                          </div>

                          {isSelected && (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2 */}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {/* Git - disabled */}

                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-lg border border-border-subtle bg-surface p-3 text-left opacity-45"
                >
                  <GitBranch className="mb-2 h-4 w-4 text-muted" />

                  <div className="text-xs font-semibold text-text-secondary">
                    Live Remote Git Fetch
                  </div>

                  <div className="mt-0.5 text-[10px] text-muted">
                    Coming soon
                  </div>
                </button>

                {/* ZIP */}

                <button
                  type="button"
                  onClick={() => setSourceType("upload")}
                  className={`rounded-lg border p-3 text-left transition-all ${
                    sourceType === "upload"
                      ? "border-primary bg-surface-hover text-text-primary"
                      : "border-border-subtle bg-surface text-muted"
                  }`}
                >
                  <UploadCloud className="mb-2 h-4 w-4 text-primary" />

                  <div className="text-xs font-semibold">
                    Upload Snapshot Bundle
                  </div>

                  <div className="mt-0.5 text-[10px] text-muted">
                    Upload your project source as a ZIP archive
                  </div>
                </button>
              </div>

              <div className="rounded-xl border-2 border-dashed border-border-subtle p-6 text-center transition-colors hover:border-primary/50">
                <FileCode className="mx-auto mb-2 h-8 w-8 text-muted" />

                <div className="text-xs font-medium text-text-primary">
                  {uploadedFile
                    ? uploadedFile.name
                    : "Select your project ZIP archive"}
                </div>

                <div className="mt-1 text-[10px] text-muted">
                  ZIP archive only
                </div>

                {uploadedFile && (
                  <div className="mt-2 text-[10px] font-mono text-muted">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                )}

                <input
                  type="file"
                  id="review-file-upload"
                  accept=".zip,application/zip"
                  className="hidden"
                  disabled={isUploading}
                  onChange={handleFileChange}
                />

                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="mt-3"
                  disabled={isUploading}
                  onClick={() =>
                    document.getElementById("review-file-upload")?.click()
                  }
                >
                  Browse Files
                </Button>

                {isUploading && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-primary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Inspecting and preparing snapshot...
                  </div>
                )}

                {snapshotId && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    Snapshot ready
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3 */}

          {step === 3 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-text-primary">
                  Review Type
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      value: "FULL",
                      label: "Full Review",
                      description:
                        "Security, performance, and maintainability analysis",
                    },
                    ,
                    {
                      value: "SECURITY",
                      label: "Security",
                      description: "Security-focused analysis",
                    },
                    {
                      value: "PERFORMANCE",
                      label: "Performance",
                      description: "Runtime and performance-focused analysis",
                    },
                    {
                      value: "MAINTAINABILITY",
                      label: "Maintainability",
                      description:
                        "Code quality and maintainability-focused analysis",
                    },
                  ].map((type) => {
                    const selected = reviewType === type.value;

                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setReviewType(type.value)}
                        className={`rounded-lg border p-3 text-left transition-colors ${
                          selected
                            ? "border-primary bg-surface-hover"
                            : "border-border-subtle bg-surface hover:border-border-hover"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-xs font-semibold text-text-primary">
                              {type.label}
                            </div>

                            <div className="mt-1 text-[10px] leading-4 text-muted">
                              {type.description}
                            </div>
                          </div>

                          {selected && (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Engine */}

              <div className="space-y-2">
                <label className="block text-xs font-medium text-text-primary">
                  AI Routing
                </label>

                <div className="flex items-center justify-between rounded-lg border border-primary bg-surface-hover p-3">
                  <div className="flex items-center gap-2.5">
                    <Cpu className="h-4 w-4 text-primary" />

                    <div>
                      <div className="text-xs font-semibold text-text-primary">
                        Automatic
                      </div>

                      <div className="text-[10px] text-muted">
                        GenioCore selects an available AI model automatically.
                      </div>
                    </div>
                  </div>

                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 */}

          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-3 rounded-xl border border-border-subtle bg-surface p-4 text-xs">
                <SummaryRow
                  label="Project"
                  value={selectedProject?.name ?? "Unknown"}
                />

                <SummaryRow
                  label="Source"
                  value={uploadedFile?.name ?? "ZIP Snapshot"}
                />

                <SummaryRow
                  label="Snapshot"
                  value={
                    snapshotId ? `${snapshotId.slice(0, 8)}...` : "Not ready"
                  }
                />

                <SummaryRow label="Review Type" value={reviewType} />

                <SummaryRow label="AI Routing" value="AUTO" last />
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 p-3 text-xs text-primary">
                <Sparkles className="h-4 w-4 shrink-0" />

                <span>
                  The review will be queued for background processing.
                </span>
              </div>
            </div>
          )}

          {/* Error */}

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-error/25 bg-error/10 p-3 text-xs text-error">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

              <span>{error}</span>
            </div>
          )}

          {/* Controls */}

          <div className="flex items-center justify-between border-t border-border-subtle pt-4">
            {step > 1 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={ArrowLeft}
                disabled={isBusy}
                onClick={() => setStep((current) => Math.max(1, current - 1))}
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                icon={isUploading ? Loader2 : ArrowRight}
                iconPosition="right"
                disabled={
                  isBusy ||
                  (step === 1 && !selectedProjectId) ||
                  (step === 2 && !uploadedFile)
                }
                onClick={handleContinue}
              >
                {isUploading ? "Preparing..." : "Continue"}
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                icon={isCreatingReview ? Loader2 : Sparkles}
                disabled={isCreatingReview || !snapshotId}
                onClick={handleStartReview}
              >
                {isCreatingReview ? "Queuing..." : "Run Code Analysis"}
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

const SummaryRow = ({ label, value, last = false }) => {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-1 ${
        last ? "" : "border-b border-border-subtle"
      }`}
    >
      <span className="text-muted">{label}:</span>

      <span className="max-w-[65%] truncate text-right font-mono font-medium text-text-primary">
        {value}
      </span>
    </div>
  );
};
