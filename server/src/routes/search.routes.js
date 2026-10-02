import { Router } from "express";

import authMiddleware from "../middlewares/auth.middleware.js";

import { validateQuery } from "../middlewares/validate.middleware.js";

import { globalSearch } from "../controllers/search.controller.js";

import { globalSearchSchema } from "../validations/search.validation.js";

const searchRouter = Router();

searchRouter.get(
  "/",
  authMiddleware,
  validateQuery(globalSearchSchema),
  globalSearch,
);

export default searchRouter;
