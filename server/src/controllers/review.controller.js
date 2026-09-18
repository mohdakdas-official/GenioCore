import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  createReview as createReviewService,
  getReviewById as getReviewByIdService,
  retryReview,
} from "../services/review.service.js";

import { getReviewIssues } from "../services/reviewIssue.service.js";
export const createReview = asyncHandler(async (req, res) => {
  const { projectId } = res.locals.validatedParams;

  const review = await createReviewService({
    ownerId: req.user.id,
    projectId,
    data: req.body,
  });

  return res
    .status(202)
    .json(new ApiResponse(202, review, "Review queued successfully"));
});

export const getReviewById = asyncHandler(async (req, res) => {
  const { projectId, reviewId } = res.locals.validatedParams;

  const review = await getReviewByIdService({
    ownerId: req.user.id,
    projectId,
    reviewId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, review, "Review retrieved successfully"));
});

export const getReviewIssuesController = asyncHandler(async (req, res) => {
  const { projectId, reviewId } = res.locals.validatedParams;

  const { status, severity, limit, cursor } = res.locals.validatedQuery;

  const result = await getReviewIssues({
    projectId,
    reviewId,

    ownerId: req.user.id,

    status,
    severity,
    limit,
    cursor,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Review issues retrieved successfully"));
});

export const retryReviewController = asyncHandler(async (req, res) => {
  const { projectId, reviewId } = res.locals.validatedParams;

  const review = await retryReview({
    projectId,
    reviewId,

    ownerId: req.user.id,
  });

  return res
    .status(202)
    .json(new ApiResponse(202, review, "Review retry queued successfully"));
});
