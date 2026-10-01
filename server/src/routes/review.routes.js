import { Router } from "express";

import {
  createReview,
  getReviewById,
  getReviewIssuesController,
  retryReviewController,
  getProjectReviewsController,
} from "../controllers/review.controller.js";

import {
  createReviewSchema,
  reviewParamsSchema,
  reviewIssuesQuerySchema,
  projectReviewsQuerySchema,
} from "../validations/review.validation.js";

import { projectIdParamsSchema } from "../validations/project.validation.js";

import authMiddleware from "../middlewares/auth.middleware.js";

import {
  validate,
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware.js";

const reviewRouter = Router({
  mergeParams: true,
});

reviewRouter.post(
  "/",
  authMiddleware,
  validateParams(projectIdParamsSchema),
  validate(createReviewSchema),
  createReview,
);

reviewRouter.get(
  "/",
  authMiddleware,
  validateParams(projectIdParamsSchema),
  validateQuery(projectReviewsQuerySchema),
  getProjectReviewsController,
);

reviewRouter.get(
  "/:reviewId",
  authMiddleware,
  validateParams(reviewParamsSchema),
  getReviewById,
);

reviewRouter.get(
  "/:reviewId/issues",
  authMiddleware,
  validateParams(reviewParamsSchema),
  validateQuery(reviewIssuesQuerySchema),
  getReviewIssuesController,
);

reviewRouter.post(
  "/:reviewId/retry",
  authMiddleware,
  validateParams(reviewParamsSchema),
  retryReviewController,
);

export default reviewRouter;
