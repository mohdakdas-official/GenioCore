import { useCallback, useEffect, useMemo, useState } from "react";

import { getReviews } from "../services/review.service";

import { getProjects } from "../services/project.service";

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  "Unable to load analytics.";

const getReviewProjectId = (review) => {
  if (!review?.projectId) {
    return null;
  }

  if (typeof review.projectId === "string") {
    return review.projectId;
  }

  return review.projectId?._id ?? null;
};

const getReviewDate = (review) => {
  return (
    review?.completedAt ||
    review?.failedAt ||
    review?.startedAt ||
    review?.queuedAt ||
    review?.createdAt ||
    null
  );
};

const getAverage = (items, selector) => {
  const values = items
    .map(selector)
    .filter((value) => typeof value === "number");

  if (values.length === 0) {
    return null;
  }

  const total = values.reduce((sum, value) => sum + value, 0);

  return Math.round(total / values.length);
};

/**
 * Fetch every currently available
 * review page through cursor pagination.
 */
const fetchAllReviews = async () => {
  const reviews = [];

  let cursor = null;
  let pageCount = 0;

  do {
    const response = await getReviews({
      limit: 20,
      cursor,
    });

    const data = response?.data;

    reviews.push(...(data?.reviews ?? []));

    cursor = data?.pagination?.hasNextPage ? data.pagination.nextCursor : null;

    pageCount += 1;

    if (pageCount >= 100) {
      break;
    }
  } while (cursor);

  return reviews;
};

const fetchProjectsByStatus = async (status) => {
  const projects = [];

  let cursor = null;
  let pageCount = 0;

  do {
    const response = await getProjects({
      status,
      limit: 20,
      cursor,
    });

    const data = response?.data;

    projects.push(...(data?.projects ?? []));

    cursor = data?.pagination?.hasNextPage ? data.pagination.nextCursor : null;

    pageCount += 1;

    if (pageCount >= 100) {
      break;
    }
  } while (cursor);

  return projects;
};

export const useAnalytics = (timeRange = "30d") => {
  const [reviews, setReviews] = useState([]);

  const [projects, setProjects] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);

    setError("");

    try {
      const [allReviews, activeProjects, archivedProjects] = await Promise.all([
        fetchAllReviews(),

        fetchProjectsByStatus("ACTIVE"),

        fetchProjectsByStatus("ARCHIVED"),
      ]);

      setReviews(allReviews);

      setProjects([...activeProjects, ...archivedProjects]);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  /**
   * Project lookup
   */
  const projectMap = useMemo(() => {
    return new Map(projects.map((project) => [project._id, project]));
  }, [projects]);

  /**
   * Time range
   */
  const rangeDays = useMemo(() => {
    switch (timeRange) {
      case "7d":
        return 7;

      case "30d":
        return 30;

      case "90d":
        return 90;

      case "all":
        return null;

      default:
        return 30;
    }
  }, [timeRange]);

  const filteredReviews = useMemo(() => {
    if (rangeDays === null) {
      return reviews;
    }

    const cutoff = Date.now() - rangeDays * 24 * 60 * 60 * 1000;

    return reviews.filter((review) => {
      const date = getReviewDate(review);

      if (!date) {
        return false;
      }

      const timestamp = new Date(date).getTime();

      if (Number.isNaN(timestamp)) {
        return false;
      }

      return timestamp >= cutoff;
    });
  }, [reviews, rangeDays]);

  const completedReviews = useMemo(() => {
    return filteredReviews.filter((review) => review.status === "COMPLETED");
  }, [filteredReviews]);

  /**
   * Scores
   */
  const averageScores = useMemo(() => {
    return {
      overall: getAverage(
        completedReviews,
        (review) => review?.scores?.overall,
      ),

      security: getAverage(
        completedReviews,
        (review) => review?.scores?.security,
      ),

      performance: getAverage(
        completedReviews,
        (review) => review?.scores?.performance,
      ),

      maintainability: getAverage(
        completedReviews,
        (review) => review?.scores?.maintainability,
      ),

      reliability: getAverage(
        completedReviews,
        (review) => review?.scores?.reliability,
      ),
    };
  }, [completedReviews]);

  /**
   * Issues
   */
  const issueTotals = useMemo(() => {
    return completedReviews.reduce(
      (totals, review) => {
        const counts = review?.issueCounts ?? {};

        totals.total += counts.total ?? 0;

        totals.critical += counts.critical ?? 0;

        totals.high += counts.high ?? 0;

        totals.medium += counts.medium ?? 0;

        totals.low += counts.low ?? 0;

        totals.info += counts.info ?? 0;

        return totals;
      },
      {
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
      },
    );
  }, [completedReviews]);

  /**
   * Number of projects having reviews
   * in selected period.
   */
  const reviewedProjectCount = useMemo(() => {
    const projectIds = new Set();

    filteredReviews.forEach((review) => {
      const projectId = getReviewProjectId(review);

      if (projectId) {
        projectIds.add(projectId);
      }
    });

    return projectIds.size;
  }, [filteredReviews]);

  /**
   * Trend chart
   */
  const trendData = useMemo(() => {
    return [...completedReviews]
      .sort((a, b) => {
        const aDate = getReviewDate(a);

        const bDate = getReviewDate(b);

        return new Date(aDate).getTime() - new Date(bDate).getTime();
      })
      .map((review) => ({
        reviewId: review._id,

        date: review.completedAt || review.createdAt,

        overall: review?.scores?.overall ?? null,

        security: review?.scores?.security ?? null,

        performance: review?.scores?.performance ?? null,

        maintainability: review?.scores?.maintainability ?? null,

        reliability: review?.scores?.reliability ?? null,
      }));
  }, [completedReviews]);

  /**
   * Latest completed review
   * for each project.
   */
  const projectAnalytics = useMemo(() => {
    const latestByProject = new Map();

    completedReviews.forEach((review) => {
      const projectId = getReviewProjectId(review);

      if (!projectId) {
        return;
      }

      const previous = latestByProject.get(projectId);

      if (!previous) {
        latestByProject.set(projectId, review);

        return;
      }

      const currentDate = new Date(
        review.completedAt || review.createdAt,
      ).getTime();

      const previousDate = new Date(
        previous.completedAt || previous.createdAt,
      ).getTime();

      if (currentDate > previousDate) {
        latestByProject.set(projectId, review);
      }
    });

    return Array.from(latestByProject.entries())
      .map(([projectId, review]) => {
        let projectName = "Unknown Project";

        if (
          review?.projectId &&
          typeof review.projectId === "object" &&
          review.projectId?.name
        ) {
          projectName = review.projectId.name;
        } else {
          projectName = projectMap.get(projectId)?.name ?? "Unknown Project";
        }

        return {
          projectId,

          name: projectName,

          score: review?.scores?.overall ?? null,

          total: review?.issueCounts?.total ?? 0,

          critical: review?.issueCounts?.critical ?? 0,

          high: review?.issueCounts?.high ?? 0,

          completedAt: review.completedAt || review.createdAt,
        };
      })
      .sort((a, b) => {
        if (b.critical !== a.critical) {
          return b.critical - a.critical;
        }

        if (b.high !== a.high) {
          return b.high - a.high;
        }

        return (a.score ?? 101) - (b.score ?? 101);
      });
  }, [completedReviews, projectMap]);

  return {
    reviews,
    projects,

    filteredReviews,
    completedReviews,

    averageScores,
    issueTotals,

    reviewedProjectCount,

    trendData,
    projectAnalytics,

    isLoading,
    error,

    refresh: fetchAnalytics,
  };
};
