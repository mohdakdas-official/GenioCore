import { Router } from "express";

import { createSnapshot } from "../controllers/snapshot.controller.js";

import { projectIdParamsSchema } from "../validations/project.validation.js";

import authMiddleware from "../middlewares/auth.middleware.js";

import { validateParams } from "../middlewares/validate.middleware.js";

import { snapshotUpload } from "../middlewares/snapshotUpload.middleware.js";

const snapshotRouter = Router({
  mergeParams: true,
});

snapshotRouter.post(
  "/",
  authMiddleware,
  validateParams(projectIdParamsSchema),
  snapshotUpload,
  createSnapshot,
);

export default snapshotRouter;
