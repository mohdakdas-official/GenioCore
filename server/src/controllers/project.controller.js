import {
  createProject as createProjectService,
  getProjects as getProjectsService,
  getProjectById as getProjectByIdService,
  updateProject as updateProjectService,
  archiveProject as archiveProjectService,
  restoreProject as restoreProjectService,
} from "../services/project.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import Project from "../models/project.model.js";

export const createProject = asyncHandler(async (req, res) => {
  const project = await createProjectService({
    ownerId: req.user.id,
    data: req.body,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, project, "Project created successfully"));
});

export const getProjects = asyncHandler(async (req, res) => {
  const { status, limit, cursor } = res.locals.validatedQuery;

  const result = await getProjectsService({
    ownerId: req.user.id,
    status,
    limit,
    cursor,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Projects retrieved successfully"));
});

export const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = res.locals.validatedParams;

  const project = await getProjectByIdService({
    ownerId: req.user.id,
    projectId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project retrieved successfully"));
});

export const updateProject = asyncHandler(async (req, res) => {
  const { projectId } = res.locals.validatedParams;

  const project = await updateProjectService({
    ownerId: req.user.id,
    projectId,
    data: req.body,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project updated successfully"));
});

export const archiveProject = asyncHandler(async (req, res) => {
  const { projectId } = res.locals.validatedParams;

  const project = await archiveProjectService({
    ownerId: req.user.id,
    projectId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project archived successfully"));
});

export const restoreProject = asyncHandler(async (req, res) => {
  const { projectId } = res.locals.validatedParams;

  const project = await restoreProjectService({
    ownerId: req.user.id,
    projectId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project restored successfully"));
});
