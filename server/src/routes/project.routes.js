import { Router } from "express";
import {
  archiveProject,
  createProject,
  getProjectById,
  getProjects,
  restoreProject,
  updateProject,
} from "../controllers/project.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import {
  validate,
  validateParams,
  validateQuery,
} from "../middlewares/validate.middleware.js";
import {
  createProjectSchema,
  getProjectsQuerySchema,
  projectIdParamsSchema,
  updateProjectSchema,
} from "../validations/project.validation.js";
const projectRouter = Router();

projectRouter.post(
  "/",
  authMiddleware,
  validate(createProjectSchema),
  createProject,
);

projectRouter.get(
  "/",
  authMiddleware,
  validateQuery(getProjectsQuerySchema),
  getProjects,
);

projectRouter.post(
  "/:projectId",
  authMiddleware,
  validateParams(projectIdParamsSchema),
  getProjectById,
);

projectRouter.patch(
  "/:projectId",
  authMiddleware,
  validateParams(projectIdParamsSchema),
  validate(updateProjectSchema),
  updateProject,
);

projectRouter.patch(
  "/:projectId/archive",
  authMiddleware,
  validateParams(projectIdParamsSchema),
  archiveProject,
);

projectRouter.patch(
  "/:projectId/restore",
  authMiddleware,
  validateParams(projectIdParamsSchema),
  restoreProject,
);

export default projectRouter;
