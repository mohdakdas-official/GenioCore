import path from "path";
import crypto from "crypto";
import yauzl from "yauzl";

import ApiError from "../utils/ApiError.js";

/*
 * Safety limits for the archive itself.
 *
 * Archive may contain ignored files like:
 * node_modules, .git, images, builds, etc.
 */
const MAX_ARCHIVE_ENTRIES = 100_000;

/*
 * Limits for files NeuAspire will actually analyze.
 */
const MAX_SOURCE_FILES = 5_000;

const MAX_TOTAL_SOURCE_BYTES = 100 * 1024 * 1024; // 100 MB

const MAX_SINGLE_SOURCE_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

const ignoredDirectories = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".cache",
  ".next",
  ".nuxt",
  "vendor",
]);

const ignoredExactFiles = new Set([
  // Secrets / credentials
  ".env",
  ".env.local",
  ".env.development",
  ".env.production",
  ".env.test",
  "credentials.json",
  "id_rsa",
  "id_dsa",

  // Dependency lockfiles
  // These are generated files and are not useful
  // for LLM-based source-code review.
  "package-lock.json",
  "npm-shrinkwrap.json",
  "yarn.lock",
  "pnpm-lock.yaml",
]); 

const forbiddenExtensions = new Set([".pem", ".key", ".p12", ".pfx"]);

const supportedExtensions = new Set([
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",

  ".ts",
  ".tsx",

  ".json",

  ".html",
  ".htm",

  ".css",
  ".scss",
  ".sass",
  ".less",

  ".md",

  ".yml",
  ".yaml",

  ".xml",

  ".py",

  ".java",

  ".c",
  ".h",
  ".cpp",
  ".hpp",

  ".cs",

  ".go",

  ".rs",

  ".php",

  ".rb",

  ".sh",

  ".sql",

  ".graphql",
  ".gql",

  ".vue",
  ".svelte",

  ".kt",
  ".kts",

  ".swift",

  ".dart",

  ".toml",
  ".ini",
  ".conf",
  ".properties",
]);

const supportedSpecialFiles = new Set(["Dockerfile", "Makefile", "Procfile"]);

const normalizeEntryPath = (fileName) => {
  const normalized = fileName.replaceAll("\\", "/");

  if (normalized.startsWith("/") || /^[A-Za-z]:\//.test(normalized)) {
    throw new ApiError(400, "ZIP archive contains an unsafe file path");
  }

  const segments = normalized.split("/");

  if (segments.includes("..")) {
    throw new ApiError(400, "ZIP archive contains an unsafe file path");
  }

  return normalized;
};

const shouldIgnorePath = (filePath) => {
  const segments = filePath.split("/");

  return segments.some((segment) => ignoredDirectories.has(segment));
};

const isSensitiveFile = (filePath) => {
  const basename = path.posix.basename(filePath);

  const lowercaseBasename = basename.toLowerCase();

  const extension = path.posix.extname(lowercaseBasename).toLowerCase();

  /*
   * .env.example is useful for understanding
   * configuration structure and normally does
   * not contain real secrets.
   */
  if (lowercaseBasename === ".env.example") {
    return false;
  }

  /*
   * Reject all actual .env variants.
   *
   * Examples:
   * .env
   * .env.production
   * .env.local
   */
  if (lowercaseBasename === ".env" || lowercaseBasename.startsWith(".env.")) {
    return true;
  }

  return (
    ignoredExactFiles.has(lowercaseBasename) ||
    forbiddenExtensions.has(extension)
  );
};

const isSupportedSourceFile = (filePath) => {
  const basename = path.posix.basename(filePath);

  if (supportedSpecialFiles.has(basename)) {
    return true;
  }

  const extension = path.posix.extname(basename).toLowerCase();

  return supportedExtensions.has(extension);
};

const hashZipEntry = async ({ zipFile, entry, globalState }) => {
  const stream = await zipFile.openReadStreamPromise(entry);

  const hash = crypto.createHash("sha256");

  let bytesRead = 0;

  let binaryDetected = false;

  let inspectedBytes = 0;

  for await (const chunk of stream) {
    bytesRead += chunk.length;

    globalState.totalSourceBytes += chunk.length;

    /*
     * Defense in depth.
     *
     * We already inspect entry.uncompressedSize
     * before opening the stream, but we also
     * enforce the limit while reading.
     */
    if (bytesRead > MAX_SINGLE_SOURCE_FILE_BYTES) {
      throw new ApiError(
        413,
        `A source file exceeds the ${
          MAX_SINGLE_SOURCE_FILE_BYTES / 1024 / 1024
        } MB limit`,
      );
    }

    if (globalState.totalSourceBytes > MAX_TOTAL_SOURCE_BYTES) {
      throw new ApiError(
        413,
        `Relevant source code cannot exceed ${
          MAX_TOTAL_SOURCE_BYTES / 1024 / 1024
        } MB`,
      );
    }

    /*
     * Basic binary detection.
     *
     * Only inspect the first 8 KB.
     * Source files containing NULL bytes are
     * not suitable for normal text analysis.
     */
    if (!binaryDetected && inspectedBytes < 8192) {
      const remaining = 8192 - inspectedBytes;

      const sample = chunk.subarray(0, remaining);

      if (sample.includes(0)) {
        binaryDetected = true;
      }

      inspectedBytes += sample.length;
    }

    hash.update(chunk);
  }

  return {
    bytesRead,
    binaryDetected,
    fileHash: hash.digest("hex"),
  };
};

const inspectProjectZip = async (zipPath) => {
  let zipFile;

  try {
    zipFile = await yauzl.openPromise(zipPath, {
      decodeStrings: true,
      validateEntrySizes: true,
    });

    const sourceFiles = [];

    let archiveEntryCount = 0;
    let sourceFileCount = 0;
    let ignoredFileCount = 0;

    const globalState = {
      totalSourceBytes: 0,
    };

    for await (const entry of zipFile.eachEntry()) {
      const filePath = normalizeEntryPath(entry.fileName);

      /*
       * Directory entry.
       */
      if (filePath.endsWith("/")) {
        continue;
      }

      archiveEntryCount++;

      /*
       * Protect against archives containing
       * enormous numbers of tiny entries.
       */
      if (archiveEntryCount > MAX_ARCHIVE_ENTRIES) {
        throw new ApiError(
          413,
          `Archive cannot contain more than ${MAX_ARCHIVE_ENTRIES} files`,
        );
      }

      /*
       * Reject encrypted/password-protected
       * archive entries.
       */
      if ((entry.generalPurposeBitFlag & 0x1) !== 0) {
        throw new ApiError(400, "Encrypted ZIP archives are not supported");
      }

      /*
       * IMPORTANT:
       *
       * Ignore irrelevant paths BEFORE
       * checking individual source-file size.
       *
       * Therefore a huge .git object or
       * node_modules file won't cause the
       * entire project to fail.
       */
      if (shouldIgnorePath(filePath)) {
        ignoredFileCount++;
        continue;
      }

      if (isSensitiveFile(filePath)) {
        ignoredFileCount++;
        continue;
      }

      if (!isSupportedSourceFile(filePath)) {
        ignoredFileCount++;
        continue;
      }

      /*
       * From this point onwards the entry is
       * considered reviewable source/config.
       */
      sourceFileCount++;

      if (sourceFileCount > MAX_SOURCE_FILES) {
        throw new ApiError(
          413,
          `Project cannot contain more than ${MAX_SOURCE_FILES} reviewable source files`,
        );
      }

      if (entry.uncompressedSize > MAX_SINGLE_SOURCE_FILE_BYTES) {
        throw new ApiError(
          413,
          `Source file "${filePath}" exceeds the ${
            MAX_SINGLE_SOURCE_FILE_BYTES / 1024 / 1024
          } MB limit`,
        );
      }

      const result = await hashZipEntry({
        zipFile,
        entry,
        globalState,
      });

      /*
       * A file may have a source-looking
       * extension while actually containing
       * binary data.
       */
      if (result.binaryDetected) {
        ignoredFileCount++;
        continue;
      }

      sourceFiles.push({
        path: filePath,
        size: result.bytesRead,
        hash: result.fileHash,
      });
    }

    if (sourceFiles.length === 0) {
      throw new ApiError(
        400,
        "No supported source code files were found in the ZIP archive",
      );
    }

    /*
     * Deterministic project content hash.
     *
     * ZIP metadata/order does not affect
     * this hash.
     */
    sourceFiles.sort((a, b) => a.path.localeCompare(b.path));

    const projectHash = crypto.createHash("sha256");

    for (const file of sourceFiles) {
      projectHash.update(file.path);
      projectHash.update("\0");

      projectHash.update(file.hash);
      projectHash.update("\0");
    }

    return {
      contentHash: projectHash.digest("hex"),

      fileCount: sourceFiles.length,

      totalBytes: sourceFiles.reduce((total, file) => total + file.size, 0),

      archiveEntryCount,

      ignoredFileCount,

      files: sourceFiles,
    };
  } catch (error) {
    console.error("ZIP INSPECTION ERROR:", error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(400, "Invalid or corrupted ZIP archive");
  } finally {
    try {
      zipFile?.close();
    } catch {
      // ZIP may already be closed.
    }
  }
};

export { inspectProjectZip };
