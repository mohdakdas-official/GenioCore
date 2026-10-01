import { useCallback, useEffect, useState } from "react";

import {
  getProjectById as getProjectByIdService,
  updateProject as updateProjectService,
  archiveProject as archiveProjectService,
  restoreProject as restoreProjectService,
} from "../services/project.service";

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong.";

export const useProject = (projectId) => {
  const [project, setProject] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [isUpdating, setIsUpdating] = useState(false);

  const [error, setError] = useState("");

  /*
   * ----------------------------------------
   * FETCH SINGLE PROJECT
   * ----------------------------------------
   */

  const fetchProject = useCallback(async () => {
    if (!projectId) {
      setProject(null);
      setIsLoading(false);
      return null;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await getProjectByIdService(projectId);

      const data = response?.data ?? null;

      setProject(data);

      return data;
    } catch (error) {
      setProject(null);

      setError(getErrorMessage(error));

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject().catch(() => {
      // Error already stored in hook.
    });
  }, [fetchProject]);

  /*
   * ----------------------------------------
   * UPDATE PROJECT
   * ----------------------------------------
   */

  const updateProject = async (payload) => {
    if (!projectId) return null;

    setIsUpdating(true);
    setError("");

    try {
      const response = await updateProjectService({
        projectId,
        data: payload,
      });

      const updatedProject = response?.data ?? null;

      if (updatedProject) {
        setProject(updatedProject);
      }

      return updatedProject;
    } catch (error) {
      setError(getErrorMessage(error));

      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  /*
   * ----------------------------------------
   * ARCHIVE
   * ----------------------------------------
   */

  const archiveProject = async () => {
    if (!projectId) return null;

    setIsUpdating(true);
    setError("");

    try {
      const response = await archiveProjectService(projectId);

      const updatedProject = response?.data;

      if (updatedProject) {
        setProject(updatedProject);
      } else {
        setProject((current) =>
          current
            ? {
                ...current,
                status: "ARCHIVED",
              }
            : current,
        );
      }

      return updatedProject;
    } catch (error) {
      setError(getErrorMessage(error));

      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  /*
   * ----------------------------------------
   * RESTORE
   * ----------------------------------------
   */

  const restoreProject = async () => {
    if (!projectId) return null;

    setIsUpdating(true);
    setError("");

    try {
      const response = await restoreProjectService(projectId);

      const updatedProject = response?.data;

      if (updatedProject) {
        setProject(updatedProject);
      } else {
        setProject((current) =>
          current
            ? {
                ...current,
                status: "ACTIVE",
              }
            : current,
        );
      }

      return updatedProject;
    } catch (error) {
      setError(getErrorMessage(error));

      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  /*
   * ----------------------------------------
   * MANUAL REFRESH
   * ----------------------------------------
   */

  const refresh = () => fetchProject();

  return {
    project,

    isLoading,
    isUpdating,

    error,

    updateProject,
    archiveProject,
    restoreProject,

    refresh,
  };
};
