import { useCallback, useEffect, useState } from "react";

import { getReviewIssues as getReviewIssuesService } from "../services/review.service";

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Unable to load review issues.";

export const useReviewIssues = ({
  projectId,
  reviewId,
  severity,
  status,
  limit = 50,
} = {}) => {
  const [issues, setIssues] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [error, setError] = useState("");

  const [pagination, setPagination] = useState({
    hasNextPage: false,
    nextCursor: null,
  });

  const fetchIssues = useCallback(
    async ({ reset = true, cursor = null } = {}) => {
      if (!projectId || !reviewId) {
        setIssues([]);

        setPagination({
          hasNextPage: false,
          nextCursor: null,
        });

        setIsLoading(false);

        return null;
      }

      if (reset) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      setError("");

      try {
        const response = await getReviewIssuesService({
          projectId,
          reviewId,
          severity,
          status,
          limit,
          cursor,
        });

        const data = response?.data;

        const incomingIssues = data?.issues ?? [];

        setIssues((current) =>
          reset ? incomingIssues : [...current, ...incomingIssues],
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
          setIssues([]);
        }

        throw error;
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [projectId, reviewId, severity, status, limit],
  );

  useEffect(() => {
    fetchIssues({
      reset: true,
    }).catch(() => {
      // Error already stored.
    });
  }, [fetchIssues]);

  const loadMore = async () => {
    if (!pagination.hasNextPage || !pagination.nextCursor || isLoadingMore) {
      return;
    }

    return fetchIssues({
      reset: false,
      cursor: pagination.nextCursor,
    });
  };

  const refresh = () =>
    fetchIssues({
      reset: true,
    });

  return {
    issues,

    isLoading,
    isLoadingMore,

    error,

    pagination,

    loadMore,
    refresh,
  };
};
