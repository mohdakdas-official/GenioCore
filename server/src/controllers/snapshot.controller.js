import asyncHandler from "../utils/asyncHandler.js";

import ApiResponse from "../utils/ApiResponse.js";

import { createSnapshot as createSnapshotService } from "../services/snapshot.service.js";

const createSnapshot = asyncHandler(async (req, res) => {
  const { projectId } = res.locals.validatedParams;

  const result = await createSnapshotService({
    ownerId: req.user.id,
    projectId,
    uploadedFilePath: req.file.path,
  });

  const statusCode = result.reused ? 200 : 201;

  const message = result.reused
    ? "Identical code snapshot already exists"
    : "Code snapshot created successfully";

  return res
    .status(statusCode)
    .json(new ApiResponse(statusCode, result, message));
});

export { createSnapshot };
