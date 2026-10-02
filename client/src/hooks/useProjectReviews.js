import { useCallback, useEffect, useMemo, useState } from "react";

import { getProjectReviews as getProjectReviewsService } from "../services/review.service";

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Unable to load project reviews.";

export const useProjectReviews = (projectId, { status, limit = 20 } = {}) => {
  const [reviews, setReviews] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [error, setError] = useState("");

  const [pagination, setPagination] = useState({
    hasNextPage: false,
    nextCursor: null,
  });

  /*
   * FETCH REVIEWS
   */
  const fetchReviews = useCallback(
    async ({ reset = true, cursor = null } = {}) => {
      if (!projectId) {
        setReviews([]);
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
        const response = await getProjectReviewsService({
          projectId,
          status,
          limit,
          cursor,
        });

        const data = response?.data;

        const incomingReviews = data?.reviews ?? [];

        setReviews((current) =>
          reset ? incomingReviews : [...current, ...incomingReviews],
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
          setReviews([]);
        }

        throw error;
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [projectId, status, limit],
  );

  useEffect(() => {
    fetchReviews({
      reset: true,
    }).catch(() => {
      // Error already stored in state.
    });
  }, [fetchReviews]);

  /*
   * Latest completed review
   *
   * API already returns newest reviews first,
   * so first completed review = latest completed.
   */
  const latestCompletedReview = useMemo(
    () => reviews.find((review) => review.status === "COMPLETED") ?? null,
    [reviews],
  );

  /*
   * Current active review
   */
  const activeReview = useMemo(
    () =>
      reviews.find(
        (review) =>
          review.status === "QUEUED" || review.status === "PROCESSING",
      ) ?? null,
    [reviews],
  );

  /*
   * Pagination
   */
  const loadMore = async () => {
    if (!pagination.hasNextPage || !pagination.nextCursor || isLoadingMore) {
      return;
    }

    return fetchReviews({
      reset: false,
      cursor: pagination.nextCursor,
    });
  };

  const refresh = () =>
    fetchReviews({
      reset: true,
    });

  return {
    reviews,

    latestCompletedReview,
    activeReview,

    isLoading,
    isLoadingMore,

    error,

    pagination,

    refresh,
    loadMore,
  };
};
