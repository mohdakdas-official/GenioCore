import { Router } from "express";

import { getReviewsController } from "../controllers/review.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

import { validateQuery } from "../middlewares/validate.middleware.js";

import { getReviewsQuerySchema } from "../validations/review.validation.js";

const reviewHistoryRouter = Router();

reviewHistoryRouter.get(
  "/",
  authMiddleware,
  validateQuery(getReviewsQuerySchema),
  getReviewsController,
);

export default reviewHistoryRouter;
