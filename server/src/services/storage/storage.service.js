import fs from "fs";
import fsPromises from "fs/promises";
import os from "os";
import path from "path";
import crypto from "crypto";
import { pipeline } from "stream/promises";

import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

import { getR2Client, getR2BucketName } from "../../config/r2.js";

import ApiError from "../../utils/ApiError.js";

/*
 * R2-backed snapshot keys are prefixed so we can distinguish
 * them from old local-development storage keys.
 */
const R2_PREFIX = "r2:";

/*
 * Keep local resolver only for previously-created development
 * snapshots. New production snapshots will use R2.
 */
const LOCAL_STORAGE_ROOT = path.resolve(process.cwd(), "storage");

const getStorageProvider = () => {
  return process.env.SNAPSHOT_STORAGE_PROVIDER?.trim().toUpperCase() || "LOCAL";
};

const buildObjectKey = ({ ownerId, projectId, snapshotId }) => {
  return [
    "snapshots",
    String(ownerId),
    String(projectId),
    `${String(snapshotId)}.zip`,
  ].join("/");
};

const isR2StorageKey = (storageKey) => {
  return typeof storageKey === "string" && storageKey.startsWith(R2_PREFIX);
};

const getR2ObjectKey = (storageKey) => {
  if (!isR2StorageKey(storageKey)) {
    throw new ApiError(500, "Invalid R2 snapshot storage key");
  }

  return storageKey.slice(R2_PREFIX.length);
};

/*
 * Used only for legacy/local snapshots.
 */
const resolveStoragePath = (storageKey) => {
  if (!storageKey) {
    throw new ApiError(500, "Snapshot storage key is missing");
  }

  if (isR2StorageKey(storageKey)) {
    throw new ApiError(
      500,
      "R2 snapshot cannot be resolved as a local filesystem path",
    );
  }

  const resolvedPath = path.resolve(LOCAL_STORAGE_ROOT, storageKey);

  const relativePath = path.relative(LOCAL_STORAGE_ROOT, resolvedPath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new ApiError(500, "Invalid local snapshot storage key");
  }

  return resolvedPath;
};

/*
 * ------------------------------------------------
 * LOCAL STORAGE
 * ------------------------------------------------
 */

const uploadSnapshotLocally = async ({
  ownerId,
  projectId,
  snapshotId,
  filePath,
}) => {
  const storageKey = path
    .join(
      "snapshots",
      String(ownerId),
      String(projectId),
      `${String(snapshotId)}.zip`,
    )
    .replaceAll("\\", "/");

  const destinationPath = resolveStoragePath(storageKey);

  await fsPromises.mkdir(path.dirname(destinationPath), {
    recursive: true,
  });

  await fsPromises.copyFile(filePath, destinationPath);

  return storageKey;
};

/*
 * ------------------------------------------------
 * R2 STORAGE
 * ------------------------------------------------
 */

const uploadSnapshotToR2 = async ({
  ownerId,
  projectId,
  snapshotId,
  filePath,
}) => {
  const client = getR2Client();

  const bucketName = getR2BucketName();

  const objectKey = buildObjectKey({
    ownerId,
    projectId,
    snapshotId,
  });

  const stats = await fsPromises.stat(filePath);

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,

        Key: objectKey,

        Body: fs.createReadStream(filePath),

        ContentType: "application/zip",

        ContentLength: stats.size,

        Metadata: {
          snapshotid: String(snapshotId),
          projectid: String(projectId),
          ownerid: String(ownerId),
        },
      }),
    );

    return `${R2_PREFIX}${objectKey}`;
  } catch (error) {
    console.error("R2 SNAPSHOT UPLOAD ERROR:", error);

    throw new ApiError(500, "Failed to store code snapshot");
  }
};

/*
 * Public upload API used by snapshot.service.js
 */
const uploadSnapshot = async ({ ownerId, projectId, snapshotId, filePath }) => {
  const provider = getStorageProvider();

  if (provider === "R2") {
    return uploadSnapshotToR2({
      ownerId,
      projectId,
      snapshotId,
      filePath,
    });
  }

  if (provider === "LOCAL") {
    return uploadSnapshotLocally({
      ownerId,
      projectId,
      snapshotId,
      filePath,
    });
  }

  throw new ApiError(500, `Unsupported snapshot storage provider: ${provider}`);
};

/*
 * ------------------------------------------------
 * MATERIALIZE SNAPSHOT
 * ------------------------------------------------
 *
 * Worker needs a normal filesystem path because yauzl reads
 * the ZIP archive from disk.
 *
 * LOCAL:
 *   return existing path.
 *
 * R2:
 *   stream object into OS temp directory.
 */

const materializeSnapshot = async (storageKey) => {
  if (!storageKey) {
    throw new ApiError(500, "Snapshot storage key is missing");
  }

  /*
   * Legacy/local snapshot.
   */
  if (!isR2StorageKey(storageKey)) {
    const filePath = resolveStoragePath(storageKey);

    try {
      await fsPromises.access(filePath);
    } catch {
      throw new ApiError(500, "Local snapshot archive could not be found");
    }

    return {
      filePath,

      cleanup: async () => {},
    };
  }

  const objectKey = getR2ObjectKey(storageKey);

  const client = getR2Client();

  const bucketName = getR2BucketName();

  const temporaryPath = path.join(
    os.tmpdir(),
    `geniocore-review-${crypto.randomUUID()}.zip`,
  );

  try {
    const response = await client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      }),
    );

    if (!response.Body) {
      throw new Error("R2 returned an empty object body");
    }

    await pipeline(response.Body, fs.createWriteStream(temporaryPath));

    return {
      filePath: temporaryPath,

      cleanup: async () => {
        await fsPromises.unlink(temporaryPath).catch(() => {});
      },
    };
  } catch (error) {
    await fsPromises.unlink(temporaryPath).catch(() => {});

    console.error("R2 SNAPSHOT DOWNLOAD ERROR:", error);

    throw new ApiError(500, "Snapshot archive could not be downloaded");
  }
};

/*
 * ------------------------------------------------
 * DELETE SNAPSHOT
 * ------------------------------------------------
 */

const deleteSnapshot = async (storageKey) => {
  if (!storageKey) {
    return;
  }

  if (isR2StorageKey(storageKey)) {
    const client = getR2Client();

    const bucketName = getR2BucketName();

    const objectKey = getR2ObjectKey(storageKey);

    try {
      await client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: objectKey,
        }),
      );

      return;
    } catch (error) {
      console.error("R2 SNAPSHOT DELETE ERROR:", error);

      throw new ApiError(500, "Failed to delete stored snapshot");
    }
  }

  const filePath = resolveStoragePath(storageKey);

  await fsPromises.unlink(filePath).catch((error) => {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  });
};

/*
 * Compatibility with your existing snapshot.service.js.
 * You currently import `deletedSnapshot`.
 */
const deletedSnapshot = deleteSnapshot;

export {
  uploadSnapshot,
  materializeSnapshot,
  deleteSnapshot,
  deletedSnapshot,
  resolveStoragePath,
};
