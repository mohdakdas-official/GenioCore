import { useCallback, useEffect, useState } from "react";

import {
  getProjects as getProjectsService,
  createProject as createProjectService,
  updateProject as updateProjectService,
  getProjectById as getProjectByIdService,
  archiveProject as archiveProjectService,
  restoreProject as restoreProjectService,
} from "../services/project.service";

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong.";

export const useProjects = ({ status = "ACTIVE", limit = 20 } = {}) => {
  const [projects, setProjects] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [error, setError] = useState("");

  const [pagination, setPagination] = useState({
    hasNextPage: false,
    nextCursor: null,
  });

  /*
   * Fetch project list
   */
  const fetchProjects = useCallback(
    async ({ reset = true, cursor = null } = {}) => {
      if (reset) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      setError("");

      try {
        const response = await getProjectsService({
          status,
          limit,
          cursor,
        });

        const data = response?.data;

        const incomingProjects = data?.projects ?? [];

        setProjects((current) =>
          reset ? incomingProjects : [...current, ...incomingProjects],
        );

        setPagination(
          data?.pagination ?? {
            hasNextPage: false,
            nextCursor: null,
          },
        );

        return data;
      } catch (error) {
        setError(getErrorMessage(error));

        if (reset) {
          setProjects([]);
        }

        throw error;
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [status, limit],
  );

  /*
   * Refresh whenever status changes
   */
  useEffect(() => {
    fetchProjects({
      reset: true,
    }).catch(() => {
      // Error already stored in hook state.
    });
  }, [fetchProjects]);

  /*
   * Create
   */
  const createProject = async (payload) => {
    setError("");

    try {
      const response = await createProjectService(payload);

      const project = response?.data;

      /*
       * Newly-created project should normally
       * be ACTIVE. Only add it to the current
       * list if it belongs in this status view.
       */
      if (project && (!project.status || project.status === status)) {
        setProjects((current) => [project, ...current]);
      }

      return project;
    } catch (error) {
      setError(getErrorMessage(error));

      throw error;
    }
  };

  /*
   * Archive
   */
  const archiveProject = async (projectId) => {
    setError("");

    try {
      const response = await archiveProjectService(projectId);

      /*
       * Status changed ACTIVE → ARCHIVED,
       * so remove it from current ACTIVE list.
       */
      setProjects((current) =>
        current.filter((project) => project._id !== projectId),
      );

      return response?.data;
    } catch (error) {
      setError(getErrorMessage(error));

      throw error;
    }
  };

  /*
   * Restore
   */
  const restoreProject = async (projectId) => {
    setError("");

    try {
      const response = await restoreProjectService(projectId);

      /*
       * Status changed ARCHIVED → ACTIVE,
       * so remove from current archived list.
       */
      setProjects((current) =>
        current.filter((project) => project._id !== projectId),
      );

      return response?.data;
    } catch (error) {
      setError(getErrorMessage(error));

      throw error;
    }
  };

  /*
   * Pagination helper
   */
  const loadMore = async () => {
    if (!pagination.hasNextPage || !pagination.nextCursor || isLoadingMore) {
      return;
    }

    return fetchProjects({
      reset: false,
      cursor: pagination.nextCursor,
    });
  };

  /*
   * Manual refresh helper
   */
  const refresh = () =>
    fetchProjects({
      reset: true,
    });

  return {
    projects,

    isLoading,
    isLoadingMore,

    error,

    pagination,

    createProject,
    archiveProject,
    restoreProject,

    refresh,
    loadMore,
  };
};
