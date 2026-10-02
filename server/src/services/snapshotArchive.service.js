import fs from "fs";
import yauzl from "yauzl";
import yazl from "yazl";
import { pipeline } from "stream/promises";

import ApiError from "../utils/ApiError.js";

const normalizeEntryPath = (fileName) => {
  const normalized = fileName.replaceAll("\\", "/");

  if (normalized.startsWith("/") || /^[A-Za-z]:\//.test(normalized)) {
    throw new ApiError(400, "ZIP archive contains an unsafe file path");
  }

  if (normalized.split("/").includes("..")) {
    throw new ApiError(400, "ZIP archive contains an unsafe file path");
  }

  return normalized;
};

const createSanitizedSnapshotArchive = async ({
  sourceZipPath,
  files,
  outputPath,
}) => {
  const allowedPaths = new Set(files.map((file) => file.path));

  let sourceZip;

  try {
    sourceZip = await yauzl.openPromise(sourceZipPath, {
      autoClose: false,
      decodeStrings: true,
      validateEntrySizes: true,
    });

    const outputZip = new yazl.ZipFile();

    const outputPromise = pipeline(
      outputZip.outputStream,
      fs.createWriteStream(outputPath),
    );

    let addedFiles = 0;

    for await (const entry of sourceZip.eachEntry()) {
      const filePath = normalizeEntryPath(entry.fileName);

      if (filePath.endsWith("/")) {
        continue;
      }

      if (!allowedPaths.has(filePath)) {
        continue;
      }

      outputZip.addReadStreamLazy(
        filePath,
        {
          size: entry.uncompressedSize,
        },
        (callback) => {
          sourceZip.openReadStream(entry, (error, stream) => {
            callback(error, stream);
          });
        },
      );

      addedFiles++;
    }

    if (addedFiles !== allowedPaths.size) {
      throw new ApiError(
        400,
        "Some validated source files could not be read from the archive",
      );
    }

    outputZip.end();

    await outputPromise;

    return outputPath;
  } catch (error) {
    console.error("SANITIZED ARCHIVE ERROR:", error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, "Failed to prepare code snapshot");
  } finally {
    try {
      sourceZip?.close();
    } catch {
      // Already closed.
    }
  }
};

export { createSanitizedSnapshotArchive };
