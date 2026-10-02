import { useCallback, useEffect, useMemo, useState } from "react";

import { getProjects } from "../services/project.service";

import { getReviews } from "../services/review.service";

const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Unable to load dashboard data."
  );
};

export const useDashboard = () => {
  /**
   * ----------------------------------------
   * STATE
   * ----------------------------------------
   */

  const [projects, setProjects] = useState([]);

  const [reviews, setReviews] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  const [projectsPagination, setProjectsPagination] = useState({
    hasNextPage: false,
    nextCursor: null,
  });

  const [reviewsPagination, setReviewsPagination] = useState({
    hasNextPage: false,
    nextCursor: null,
  });

  /**
   * ----------------------------------------
   * FETCH DASHBOARD DATA
   * ----------------------------------------
   */

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      /**
       * Fetch projects + reviews
       * simultaneously.
       */
      const [projectsResponse, reviewsResponse] = await Promise.all([
        getProjects({
          status: "ACTIVE",
          limit: 20,
        }),

        getReviews({
          limit: 20,
        }),
      ]);

      /**
       * Services return our ApiResponse:
       *
       * {
       *   statusCode,
       *   success,
       *   message,
       *   data: {...}
       * }
       */

      const projectsData = projectsResponse?.data;

      const reviewsData = reviewsResponse?.data;

      /**
       * Projects
       */
      setProjects(projectsData?.projects ?? []);

      setProjectsPagination(
        projectsData?.pagination ?? {
          hasNextPage: false,
          nextCursor: null,
        },
      );

      /**
       * Reviews
       */
      setReviews(reviewsData?.reviews ?? []);

      setReviewsPagination(
        reviewsData?.pagination ?? {
          hasNextPage: false,
          nextCursor: null,
        },
      );
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * ----------------------------------------
   * INITIAL LOAD
   * ----------------------------------------
   */

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  /**
   * ----------------------------------------
   * COMPLETED REVIEWS
   * ----------------------------------------
   */

  const completedReviews = useMemo(() => {
    return reviews.filter((review) => review.status === "COMPLETED");
  }, [reviews]);

  const latestCompletedReview = useMemo(() => {
    if (completedReviews.length === 0) {
      return null;
    }

    return [...completedReviews].sort((a, b) => {
      const aDate = a.completedAt || a.createdAt;

      const bDate = b.completedAt || b.createdAt;

      return new Date(bDate).getTime() - new Date(aDate).getTime();
    })[0];
  }, [completedReviews]);

  /**
   * ----------------------------------------
   * ACTIVE REVIEW
   * ----------------------------------------
   *
   * First queued / processing review
   * from currently loaded reviews.
   */

  const activeReview = useMemo(() => {
    return (
      reviews.find(
        (review) =>
          review.status === "QUEUED" || review.status === "PROCESSING",
      ) ?? null
    );
  }, [reviews]);

  /**
   * ----------------------------------------
   * RECENT PROJECTS
   * ----------------------------------------
   */

  const recentProjects = useMemo(() => {
    return projects.slice(0, 3);
  }, [projects]);

  /**
   * ----------------------------------------
   * RECENT REVIEWS
   * ----------------------------------------
   */

  const recentReviews = useMemo(() => {
    return reviews.slice(0, 5);
  }, [reviews]);

  /**
   * ----------------------------------------
   * AVERAGE OVERALL SCORE
   * ----------------------------------------
   *
   * Only completed reviews having a
   * numeric overall score are included.
   */

  const averageScore = useMemo(() => {
    const scores = completedReviews
      .map((review) => review?.scores?.overall)
      .filter((score) => typeof score === "number");

    if (scores.length === 0) {
      return null;
    }

    const total = scores.reduce((sum, score) => sum + score, 0);

    return Math.round(total / scores.length);
  }, [completedReviews]);

  const scoreTrendData = useMemo(() => {
    const sortedReviews = [...completedReviews].sort((a, b) => {
      const aDate = a.completedAt || a.createdAt;

      const bDate = b.completedAt || b.createdAt;

      return new Date(aDate).getTime() - new Date(bDate).getTime();
    });

    return sortedReviews.slice(-10).map((review) => ({
      reviewId: review._id,

      date: review.completedAt || review.createdAt,

      overall: review.scores?.overall ?? null,

      security: review.scores?.security ?? null,

      performance: review.scores?.performance ?? null,

      maintainability: review.scores?.maintainability ?? null,

      reliability: review.scores?.reliability ?? null,
    }));
  }, [completedReviews]);

  /**
   * ----------------------------------------
   * LOADED ISSUE COUNT
   * ----------------------------------------
   *
   * Important:
   * This is NOT necessarily the lifetime
   * issue count because reviews endpoint
   * uses pagination.
   */

  const loadedIssueCount = useMemo(() => {
    return completedReviews.reduce((total, review) => {
      return total + (review?.issueCounts?.total ?? 0);
    }, 0);
  }, [completedReviews]);

  /**
   * ----------------------------------------
   * ISSUE SEVERITY TOTALS
   * ----------------------------------------
   *
   * Useful later for dashboard donut chart.
   */

  const issueSeverityTotals = useMemo(() => {
    return completedReviews.reduce(
      (totals, review) => {
        const counts = review?.issueCounts ?? {};

        totals.critical += counts.critical ?? 0;

        totals.high += counts.high ?? 0;

        totals.medium += counts.medium ?? 0;

        totals.low += counts.low ?? 0;

        totals.info += counts.info ?? 0;

        return totals;
      },
      {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
      },
    );
  }, [completedReviews]);

  /**
   * ----------------------------------------
   * AVERAGE CATEGORY SCORES
   * ----------------------------------------
   *
   * Useful later for dashboard
   * benchmarks/charts.
   */

  const averageScores = useMemo(() => {
    const categories = [
      "overall",
      "security",
      "performance",
      "maintainability",
      "reliability",
    ];

    const result = {};

    categories.forEach((category) => {
      const values = completedReviews
        .map((review) => review?.scores?.[category])
        .filter((value) => typeof value === "number");

      if (values.length === 0) {
        result[category] = null;
        return;
      }

      const total = values.reduce((sum, value) => sum + value, 0);

      result[category] = Math.round(total / values.length);
    });

    return result;
  }, [completedReviews]);

  /**
   * ----------------------------------------
   * REVIEW STATUS COUNTS
   * ----------------------------------------
   */

  const reviewStatusCounts = useMemo(() => {
    return reviews.reduce(
      (counts, review) => {
        const status = review?.status;

        if (status && Object.prototype.hasOwnProperty.call(counts, status)) {
          counts[status] += 1;
        }

        return counts;
      },
      {
        QUEUED: 0,
        PROCESSING: 0,
        COMPLETED: 0,
        FAILED: 0,
        CANCELLED: 0,
      },
    );
  }, [reviews]);

  /**
   * ----------------------------------------
   * RETURN
   * ----------------------------------------
   */

  return {
    projects,
    reviews,

    recentProjects,
    recentReviews,
    completedReviews,

    activeReview,
    reviewStatusCounts,

    averageScore,
    averageScores,

    latestCompletedReview,

    loadedIssueCount,
    issueSeverityTotals,

    scoreTrendData,

    projectsPagination,
    reviewsPagination,

    isLoading,
    error,

    refresh: fetchDashboard,
  };
};
