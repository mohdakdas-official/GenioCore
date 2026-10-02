import yauzl from "yauzl";

import CodeSnapshot from "../models/codeSnapshot.model.js";
import ApiError from "../utils/ApiError.js";

import { materializeSnapshot } from "./storage/storage.service.js";

const MAX_FILE_LOAD_BYTES = 5 * 1024 * 1024; // 5 MB

const readStreamToString = async (stream, maxBytes) => {
  const chunks = [];

  let totalBytes = 0;

  for await (const chunk of stream) {
    totalBytes += chunk.length;

    if (totalBytes > maxBytes) {
      throw new ApiError(
        413,
        "Snapshot source file exceeds the allowed processing size",
      );
    }

    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString("utf8");
};

const getSnapshotForReview = async ({ ownerId, projectId, snapshotId }) => {
  const snapshot = await CodeSnapshot.findOne({
    _id: snapshotId,
    ownerId,
    projectId,
    status: "READY",
  })
    .select(
      "_id projectId ownerId storageKey contentHash fileCount totalBytes status",
    )
    .lean();

  if (!snapshot) {
    throw new ApiError(404, "Code snapshot not found");
  }

  if (!snapshot.storageKey) {
    throw new ApiError(500, "Code snapshot storage is unavailable");
  }

  return snapshot;
};

/*
 * Entire repository is not loaded into memory.
 *
 * R2 object:
 *   R2 → temp ZIP → streamed file-by-file.
 *
 * Local object:
 *   existing local ZIP → streamed file-by-file.
 */
async function* iterateSnapshotFiles({ snapshot }) {
  let zipFile = null;

  let materializedSnapshot = null;

  try {
    materializedSnapshot = await materializeSnapshot(snapshot.storageKey);

    zipFile = await yauzl.openPromise(materializedSnapshot.filePath, {
      autoClose: false,
      decodeStrings: true,
      validateEntrySizes: true,
    });

    for await (const entry of zipFile.eachEntry()) {
      const filePath = entry.fileName.replaceAll("\\", "/");

      if (filePath.endsWith("/")) {
        continue;
      }

      if (entry.uncompressedSize > MAX_FILE_LOAD_BYTES) {
        throw new ApiError(
          413,
          `Source file "${filePath}" is too large to process`,
        );
      }

      const stream = await zipFile.openReadStreamPromise(entry);

      const content = await readStreamToString(stream, MAX_FILE_LOAD_BYTES);

      yield {
        path: filePath,
        size: entry.uncompressedSize,
        content,
      };
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("SNAPSHOT LOAD ERROR:", error);

    throw new ApiError(500, "Snapshot archive could not be processed");
  } finally {
    try {
      zipFile?.close();
    } catch {
      // Already closed.
    }

    if (materializedSnapshot?.cleanup) {
      await materializedSnapshot.cleanup();
    }
  }
}

export { getSnapshotForReview, iterateSnapshotFiles };
