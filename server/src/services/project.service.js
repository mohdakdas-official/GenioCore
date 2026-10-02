import mongoose from "mongoose";
import Project from "../models/project.model.js";
import ApiError from "../utils/ApiError.js";
import { base64url } from "zod";

const encodeCursor = (project) => {
  const payload = JSON.stringify({
    updatedAt: project.updatedAt,
    id: project._id.toString(),
  });

  return Buffer.from(payload).toString("base64url");
};

const decodeCursor = (cursor) => {
  try {
    const decoded = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8"),
    );

    if (
      !decoded.updatedAt ||
      !decoded.id ||
      !mongoose.Types.ObjectId.isValid(decoded.id)
    ) {
      throw new Error();
    }

    const updatedAt = new Date(decoded.updatedAt);

    if (Number.isNaN(updatedAt.getTime())) {
      throw new Error();
    }

    return {
      updatedAt,
      id: new mongoose.Types.ObjectId(decoded.id),
    };
  } catch (error) {
    throw new ApiError(400, "Invalid pagination cursor");
  }
};

export const createProject = async ({ ownerId, data }) => {
  if (!ownerId) {
    throw new ApiError(401, "Authentication required");
  }

  try {
    const project = await Project.create({
      ownerId,
      name: data.name,
      description: data.description,

      //MVP currently supports MANUAL projects only.
      sourceType: "MANUAL",
      techStack: {
        languages: data.techStack?.languages ?? [],
        frameworks: data.techStack?.frameworks ?? [],
      },

      status: "ACTIVE",
      archivedAt: null,
    });

    return project;
  } catch (error) {
    if (error?.code === 11000) {
      (409, "This project is already connected to your account.");
    }

    throw error;
  }
};

export const getProjects = async ({
  ownerId,
  status = "ACTIVE",
  limit = 20,
  cursor,
}) => {
  if (!ownerId) {
    throw new ApiError(401, "Authentication required");
  }

  const filter = {
    ownerId,
    status,
  };

  if (cursor) {
    const decodedCursor = decodedCursor(cursor);

    filter.$or = [
      {
        updatedAt: {
          $lt: decodedCursor.updatedAt,
        },
      },
      {
        updatedAt: decodedCursor.updatedAt,
        id: {
          $lt: decodedCursor.id,
        },
      },
    ];
  }

  //Fetch one extra document only to determine whether another page exists
  const projects = await Project.find(filter)
    .select("name description sourceType techStack status createdAt updatedAt")
    .sort({
      updatedAt: -1,
      _id: -1,
    })
    .limit(limit + 1)
    .lean();

  const hasNextPage = projects.length > limit;

  if (hasNextPage) {
    projects.pop();
  }

  const lastProject = projects.at(-1);

  return {
    projects,
    pagination: {
      limit,
      hasNextPage,
      nextCursor: hasNextPage && lastProject ? encodeCursor(lastProject) : null,
    },
  };
};

export const getProjectById = async ({ ownerId, projectId }) => {
  if (!ownerId) {
    throw new ApiError(401, "Authentication required");
  }

  const project = await Project.findOne({ _id: projectId, ownerId })
    .select(
      "name description sourceType repository techStack status archivedAt createdAt updatedAt",
    )
    .lean();

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return project;
};

export const updateProject = async ({ ownerId, projectId, data }) => {
  if (!ownerId) {
    throw new ApiError(401, "Authentication required");
  }

  const updateData = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.description !== undefined) {
    updateData.description = data.description;
  }

  if (data.techStack !== undefined) {
    if (data.techStack.languages !== undefined) {
      updateData["techStack.languages"] = data.techStack.languages;
    }

    if (data.techStack.frameworks !== undefined) {
      updateData["techStack.frameworks"] = data.techStack.frameworks;
    }
  }

  const project = await Project.findOneAndUpdate(
    {
      _id: projectId,
      ownerId,
    },
    {
      $set: updateData,
    },
    {
      returnDocument: "after",
      runValidators: true,
    },
  ).lean();

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  return project;
};

export const archiveProject = async ({ ownerId, projectId }) => {
  if (!ownerId) {
    throw new ApiError(401, "Authenticaiton required");
  }

  const archivedAt = new Date();

  const scheduledDeletionAt = new Date(
    archivedAt.getTime() + 30 * 24 * 60 * 60 * 1000,
  );

  const project = await Project.findOneAndUpdate(
    {
      _id: projectId,
      ownerId,
      status: "ACTIVE",
    },
    {
      $set: {
        status: "ARCHIVED",
        archivedAt,
        scheduledDeletionAt,
      },
    },
    {
      returnDocument: "after",
      runValidators: true,
    },
  ).lean();

  if (!project) {
    const existingProject = await Project.findOne({
      _id: projectId,
      ownerId,
    })
      .select("status")
      .lean();

    if (!existingProject) {
      throw new ApiError(404, "Project not found");
    }

    if (existingProject.status === "ARCHIVED") {
      throw new ApiError(409, "Project is already archived");
    }

    throw new ApiError(409, "Project cannot be archived");
  }

  return project;
};

export const restoreProject = async ({ ownerId, projectId }) => {
  if (!ownerId) {
    throw new ApiError(401, "Authentication required");
  }

  const project = Project.findOneAndUpdate(
    {
      _id: projectId,
      ownerId,
      status: "ARCHIVED",
    },
    {
      $set: {
        status: "ACTIVE",
        archivedAt: null,
        scheduledDeletionAt: null,
      },
    },
    {
      returnDocument: "after",
      runValidators: true,
    },
  ).lean();

  if (!project) {
    const existingProject = await Project.findOne({
      _id: projectId,
      ownerId,
    })
      .select("status")
      .lean();

    if (!existingProject) {
      throw new ApiError(404, " Project not found");
    }

    if (existingProject.status === "ACTIVE") {
      throw new ApiError(409, "Project is already active");
    }

    throw new ApiError(409, "Project cannot be restored");
  }

  return project;
};
