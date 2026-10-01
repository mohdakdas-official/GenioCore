import { useCallback, useEffect, useState } from "react";
import { getReviews } from "../services/review.service";

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Unable to load reviews.";

export const useReviews = ({ status = "ALL", limit = 20 } = {}) => {
  const [reviews, setReviews] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [error, setError] = useState("");

  const [pagination, setPagination] = useState({
    hasNextPage: false,
    nextCursor: null,
  });

  const loadReviews = useCallback(
    async ({ reset = true, cursor = null } = {}) => {
      if (reset) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      setError("");

      try {
        const response = await getReviews({
          status: status === "ALL" ? undefined : status,
          limit,
          cursor,
        });

        const data = response?.data;

        const newReviews = data?.reviews ?? [];

        setReviews((current) =>
          reset ? newReviews : [...current, ...newReviews],
        );

        setPagination(
          data?.pagination ?? {
            hasNextPage: false,
            nextCursor: null,
          },
        );
      } catch (error) {
        setError(getErrorMessage(error));

        if (reset) {
          setReviews([]);
        }
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [status, limit],
  );

  useEffect(() => {
    loadReviews({
      reset: true,
    });
  }, [loadReviews]);

  const loadMore = useCallback(() => {
    if (!pagination.hasNextPage || !pagination.nextCursor || isLoadingMore) {
      return;
    }

    loadReviews({
      reset: false,
      cursor: pagination.nextCursor,
    });
  }, [
    pagination.hasNextPage,
    pagination.nextCursor,
    isLoadingMore,
    loadReviews,
  ]);

  const refetch = useCallback(() => {
    return loadReviews({
      reset: true,
    });
  }, [loadReviews]);

  return {
    reviews,

    isLoading,
    isLoadingMore,

    error,

    pagination,

    refetch,
    loadMore,
  };
};
