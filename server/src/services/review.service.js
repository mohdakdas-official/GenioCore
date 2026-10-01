import CodeSnapshot from "../models/codeSnapshot.model.js";
import Project from "../models/project.model.js";
import Review from "../models/review.model.js";
import ApiError from "../utils/ApiError.js";
import { enqueueReview, enqueueReviewRetry } from "../queues/review.queue.js";

export const createReview = async ({ ownerId, projectId, data }) => {
  if (!ownerId) {
    throw new ApiError(401, "Authentication required");
  }

  const project = await Project.findOne({
    _id: projectId,
    ownerId,
    status: "ACTIVE",
  })
    .select("_id")
    .lean();

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const snapshot = await CodeSnapshot.findOne({
    _id: data.snapshotId,
    projectId,
    ownerId,
  })
    .select("_id status")
    .lean();

  if (!snapshot) {
    throw new ApiError(404, "Code snapshot not found");
  }

  if (snapshot.status !== "READY") {
    throw new ApiError(409, "Code snapshot is not ready for review");
  }

  const activeReview = await Review.findOne({
    ownerId,
    projectId,
    snapshotId: snapshot._id,
    reviewType: data.reviewType,
    status: {
      $in: ["QUEUED", "PROCESSING"],
    },
  })
    .select("_id status")
    .lean();

  if (activeReview) {
    throw new ApiError(
      409,
      "A review for this code snapshot is already in progress",
    );
  }

  const review = await Review.create({
    ownerId,
    projectId,
    snapshotId: snapshot._id,

    reviewType: data.reviewType,
    routingMode: data.routingMode,

    requestedProvider:
      data.routingMode === "MANUAL" ? data.requestedProvider : null,

    requestedModel: data.routingMode === "MANUAL" ? data.requestedModel : null,

    status: "QUEUED",
    queuedAt: new Date(),
  });

  try {
    await enqueueReview({
      reviewId: review._id.toString(),
      ownerId: ownerId.toString(),
      projectId: projectId.toString(),
      snapshotId: snapshot._id.toString(),
    });
  } catch (error) {
    await Review.updateOne(
      {
        _id: review._id,
        ownerId,
        status: "QUEUED",
      },
      {
        $set: {
          status: "FAILED",
          failedAt: new Date(),

          failure: {
            code: "QUEUE_UNAVAILABLE",
            message: "Review could not be queued for processing",
            retryable: true,
          },
        },
      },
    );

    throw new ApiError(503, "Review service is temporarily unavailable");
  }

  return review;
};

export const getReviewById = async ({ ownerId, projectId, reviewId }) => {
  if (!ownerId) {
    throw new ApiError(401, "Authentication required");
  }

  const review = await Review.findOne({
    _id: reviewId,
    projectId,
    ownerId,
  })
    .select(
      [
        "projectId",
        "snapshotId",
        "status",
        "reviewType",
        "routingMode",
        "requestedProvider",
        "requestedModel",
        "summary",
        "scores",
        "issueCounts",
        "execution",
        "failure",
        "progress",
        "queuedAt",
        "startedAt",
        "completedAt",
        "failedAt",
        "createdAt",
        "updatedAt",
      ].join(" "),
    )
    .lean();

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  return review;
};

export const retryReview = async ({ projectId, reviewId, ownerId }) => {
  const review = await Review.findOne({
    _id: reviewId,
    projectId,
    ownerId,
  });

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  if (review.status !== "FAILED") {
    throw new ApiError(409, "Only failed reviews can be retried");
  }

  /*
   * Check project is still usable.
   */
  const project = await Project.findOne({
    _id: projectId,
    ownerId,
    status: "ACTIVE",
  })
    .select("_id")
    .lean();

  if (!project) {
    throw new ApiError(404, "Active project not found");
  }

  /*
   * Snapshot must still exist and be READY.
   */
  const snapshot = await CodeSnapshot.findOne({
    _id: review.snapshotId,
    projectId,
    ownerId,
    status: "READY",
  })
    .select("_id")
    .lean();

  if (!snapshot) {
    throw new ApiError(409, "Review snapshot is no longer available");
  }

  /*
   * Move same review back to QUEUED.
   *
   * Existing ReviewChunk documents are NOT
   * deleted because they are our checkpoints.
   */
  review.status = "QUEUED";

  review.queuedAt = new Date();

  review.startedAt = null;
  review.failedAt = null;
  review.completedAt = null;

  review.failure = {
    code: null,
    message: null,
    retryable: false,
  };

  await review.save();

  try {
    await enqueueReviewRetry({
      reviewId: review._id.toString(),

      ownerId: ownerId.toString(),
    });
  } catch (error) {
    /*
     * Queueing failed, restore FAILED state.
     */
    review.status = "FAILED";

    review.failedAt = new Date();

    review.failure = {
      code: "QUEUE_UNAVAILABLE",

      message: "Review could not be queued",

      retryable: true,
    };

    await review.save();

    throw new ApiError(503, "Review queue is unavailable");
  }

  return review;
};

export const getReviews = async ({ ownerId, status, limit = 20, cursor }) => {
  if (!ownerId) {
    throw new ApiError(401, "Authentication required");
  }

  const query = {
    ownerId,
  };

  if (status) {
    query.status = status;
  }

  if (cursor) {
    query._id = {
      $lt: cursor,
    };
  }

  const reviews = await Review.find(query)
    .sort({
      _id: -1,
    })
    .limit(limit + 1)
    .select(
      [
        "projectId",
        "snapshotId",
        "status",
        "reviewType",
        "routingMode",
        "summary",
        "scores",
        "issueCounts",
        "execution",
        "failure",
        "progress",
        "queuedAt",
        "startedAt",
        "completedAt",
        "failedAt",
        "createdAt",
        "updatedAt",
      ].join(" "),
    )
    .populate({
      path: "projectId",
      select: "name description status sourceType",
    })
    .lean();

  const hasNextPage = reviews.length > limit;

  const items = hasNextPage ? reviews.slice(0, limit) : reviews;

  const nextCursor =
    hasNextPage && items.length > 0
      ? items[items.length - 1]._id.toString()
      : null;

  return {
    reviews: items,
    pagination: {
      limit,
      hasNextPage,
      nextCursor,
    },
  };
};

export const getProjectReviews = async ({
  ownerId,
  projectId,
  status,
  limit = 20,
  cursor,
}) => {
  if (!ownerId) {
    throw new ApiError(401, "Authentication required");
  }

  const project = await Project.findOne({
    _id: projectId,
    ownerId,
  })
    .select("_id")
    .lean();

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const query = {
    ownerId,
    projectId,
  };

  if (status) {
    query.status = status;
  }

  if (cursor) {
    query._id = {
      $lt: cursor,
    };
  }

  const reviews = await Review.find(query)
    .sort({
      _id: -1,
    })
    .limit(limit + 1)
    .select(
      [
        "projectId",
        "snapshotId",
        "status",
        "reviewType",
        "routingMode",
        "summary",
        "scores",
        "issueCounts",
        "execution",
        "failure",
        "progress",
        "queuedAt",
        "startedAt",
        "completedAt",
        "failedAt",
        "createdAt",
        "updatedAt",
      ].join(" "),
    )
    .lean();

  const hasNextPage = reviews.length > limit;

  const items = hasNextPage ? reviews.slice(0, limit) : reviews;

  const nextCursor =
    hasNextPage && items.length > 0
      ? items[items.length - 1]._id.toString()
      : null;

  return {
    reviews: items,

    pagination: {
      limit,
      hasNextPage,
      nextCursor,
    },
  };
};
