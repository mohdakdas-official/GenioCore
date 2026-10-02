import fs from "fs/promises";
import os from "os";
import path from "path";
import crypto from "crypto";

import Project from "../models/project.model.js";
import CodeSnapshot from "../models/codeSnapshot.model.js";

import ApiError from "../utils/ApiError.js";

import { inspectProjectZip } from "./snapshotInspection.service.js";

import { createSanitizedSnapshotArchive } from "./snapshotArchive.service.js";

import { uploadSnapshot, deletedSnapshot } from "./storage/storage.service.js";

const createSnapshot = async ({ ownerId, projectId, uploadedFilePath }) => {
  if (!ownerId) {
    throw new ApiError(401, "Authentication required");
  }

  let snapshot = null;
  let storageKey = null;

  const sanitizedZipPath = path.join(
    os.tmpdir(),
    `geniocore-sanitized-${crypto.randomUUID()}.zip`,
  );

  try {
    const project = await Project.findOne({
      _id: projectId,
      ownerId,
      status: "ACTIVE",
    })
      .select("_id sourceType")
      .lean();

    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    const inspection = await inspectProjectZip(uploadedFilePath);

    /*
     * Reuse an identical READY snapshot.
     */
    const existingSnapshot = await CodeSnapshot.findOne({
      ownerId,
      projectId,
      contentHash: inspection.contentHash,
      status: "READY",
    }).lean();

    if (existingSnapshot) {
      return {
        snapshot: existingSnapshot,
        reused: true,
      };
    }

    snapshot = await CodeSnapshot.create({
      ownerId,
      projectId,

      sourceType: project.sourceType,

      status: "PROCESSING",

      fileCount: inspection.fileCount,

      totalBytes: inspection.totalBytes,

      contentHash: inspection.contentHash,
    });

    await createSanitizedSnapshotArchive({
      sourceZipPath: uploadedFilePath,

      files: inspection.files,

      outputPath: sanitizedZipPath,
    });

    storageKey = await uploadSnapshot({
      ownerId,
      projectId,
      snapshotId: snapshot._id,
      filePath: sanitizedZipPath,
    });

    try {
      const readySnapshot = await CodeSnapshot.findByIdAndUpdate(
        snapshot._id,
        {
          $set: {
            storageKey,
            status: "READY",
          },
        },
        {
          returnDocument: "after",
          runValidators: true,
        },
      ).lean();

      return {
        snapshot: readySnapshot,
        reused: false,
      };
    } catch (error) {
      /*
       * Another concurrent request may have
       * created the exact same READY snapshot.
       */
      if (error?.code === 11000) {
        const existingSnapshot = await CodeSnapshot.findOne({
          ownerId,
          projectId,
          contentHash: inspection.contentHash,
          status: "READY",
        }).lean();

        await deletedSnapshot(storageKey);

        await CodeSnapshot.deleteOne({
          _id: snapshot._id,
          status: "PROCESSING",
        });

        if (existingSnapshot) {
          return {
            snapshot: existingSnapshot,
            reused: true,
          };
        }
      }

      throw error;
    }
  } catch (error) {
    if (snapshot && snapshot.status === "PROCESSING") {
      await CodeSnapshot.updateOne(
        {
          _id: snapshot._id,
          status: "PROCESSING",
        },
        {
          $set: {
            status: "FAILED",
          },
        },
      ).catch(() => {});
    }

    if (storageKey) {
      await deletedSnapshot(storageKey).catch(() => {});
    }

    throw error;
  } finally {
    await Promise.allSettled([
      fs.unlink(uploadedFilePath),
      fs.unlink(sanitizedZipPath),
    ]);
  }
};

export { createSnapshot };
