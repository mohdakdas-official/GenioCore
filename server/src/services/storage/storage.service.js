import fs from "fs/promises";
import path from "path";

import ApiError from "../../utils/ApiError.js";

const STORAGE_ROOT = process.env.LOCAL_STORAGE_PATH || path.resolve("storage");

const uploadSnapshot = async ({ ownerId, projectId, snapshotId, filePath }) => {
  /*
   * Local filesystem is only for development.
   * Production will later use object storage.
   */
  if (process.env.NODE_ENV === "production") {
    throw new ApiError(500, "Production object storage is not configured");
  }

  const directory = path.join(
    STORAGE_ROOT,
    "snapshots",
    ownerId.toString(),
    projectId.toString(),
  );

  await fs.mkdir(directory, {
    recursive: true,
  });

  const filename = `${snapshotId}.zip`;

  const destination = path.join(directory, filename);

  await fs.copyFile(filePath, destination);

  return path.relative(STORAGE_ROOT, destination).replaceAll("\\", "/");
};

const deletedSnapshot = async (storageKey) => {
  if (!storageKey) {
    return;
  }

  const resolvedRoot = path.resolve(STORAGE_ROOT);

  const absolutePath = path.resolve(STORAGE_ROOT, storageKey);

  /*
   * Prevent storage-key path traversal.
   */
  if (
    absolutePath !== resolvedRoot &&
    !absolutePath.startsWith(`${resolvedRoot}${path.sep}`)
  ) {
    throw new ApiError(500, "Invalid storage key");
  }

  try {
    await fs.unlink(absolutePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
};

const resolveStoragePath = (storageKey) => {
  if (!storageKey) {
    throw new ApiError(500, "Snapshot storage key is missing");
  }

  const resolvedRoot = path.resolve(STORAGE_ROOT);

  const absolutePath = path.resolve(STORAGE_ROOT, storageKey);

  if (
    absolutePath !== resolvedRoot &&
    !absolutePath.startsWith(`${resolvedRoot}${path.sep}`)
  ) {
    throw new ApiError(500, "Invalid storage key");
  }

  return absolutePath;
};

export { uploadSnapshot, deletedSnapshot, resolveStoragePath };
