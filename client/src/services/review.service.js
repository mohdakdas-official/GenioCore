import api from "./api";

export const createReview = async ({
  projectId,
  snapshotId,
  reviewType = "FULL",
  routingMode = "AUTO",
}) => {
  const response = await api.post(`/projects/${projectId}/reviews`, {
    snapshotId,
    reviewType,
    routingMode,
  });

  return response.data;
};

export const getReviewById = async ({ projectId, reviewId }) => {
  const response = await api.get(`/projects/${projectId}/reviews/${reviewId}`);

  return response.data;
};

export const getReviewIssues = async ({
  projectId,
  reviewId,
  severity,
  status,
  cursor,
  limit = 50,
}) => {
  const params = {
    limit,
  };

  if (severity) params.severity = severity;
  if (status) params.status = status;
  if (cursor) params.cursor = cursor;

  const response = await api.get(
    `/projects/${projectId}/reviews/${reviewId}/issues`,
    {
      params,
    },
  );

  return response.data;
};

export const retryReview = async ({ projectId, reviewId }) => {
  const response = await api.post(
    `/projects/${projectId}/reviews/${reviewId}/retry`,
  );

  return response.data;
};

export const getReviews = async ({ status, limit = 20, cursor } = {}) => {
  const params = {
    limit,
  };

  if (status && status !== "ALL") {
    params.status = status;
  }

  if (cursor) {
    params.cursor = cursor;
  }

  const response = await api.get("/reviews", {
    params,
  });

  return response.data;
};

export const getProjectReviews = async ({
  projectId,
  status,
  limit = 20,
  cursor,
}) => {
  const params = {
    limit,
  };

  if (status) {
    params.status = status;
  }

  if (cursor) {
    params.cursor = cursor;
  }

  const response = await api.get(`/projects/${projectId}/reviews`, {
    params,
  });

  return response.data;
};
