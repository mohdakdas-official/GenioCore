import fs from "fs/promises";
import yauzl from "yauzl";

import CodeSnapshot from "../models/codeSnapshot.model.js";
import ApiError from "../utils/ApiError.js";

import { resolveStoragePath } from "./storage/storage.service.js";

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
 * Async generator.
 *
 * Important:
 * Entire repository memory mein load nahi hota.
 * Ek-ek source file yield hoti hai.
 */
async function* iterateSnapshotFiles({ snapshot }) {
  const archivePath = resolveStoragePath(snapshot.storageKey);

  try {
    await fs.access(archivePath);
  } catch {
    throw new ApiError(500, "Snapshot archive could not be found");
  }

  const zipFile = await yauzl.openPromise(archivePath, {
    autoClose: false,
    decodeStrings: true,
    validateEntrySizes: true,
  });

  try {
    for await (const entry of zipFile.eachEntry()) {
      const filePath = entry.fileName.replaceAll("\\", "/");

      if (filePath.endsWith("/")) {
        continue;
      }

      /*
       * Sanitized ZIP should already contain
       * only approved source files.
       *
       * Still keep a defensive size limit.
       */
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
  } finally {
    try {
      zipFile.close();
    } catch {
      // Already closed.
    }
  }
}

export { getSnapshotForReview, iterateSnapshotFiles };
