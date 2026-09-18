import multer from "multer";
import os from "os";
import path from "path";
import fs from "fs";
import crypto from "crypto";

import ApiError from "../utils/ApiError.js";

const MAX_ZIP_SIZE = 250 * 1024 * 1024; // 250 MB

const uploadDirectory = path.join(os.tmpdir(), "neuaspire-snapshots");

fs.mkdirSync(uploadDirectory, {
  recursive: true,
});

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (_req, _file, cb) => {
    cb(null, `${crypto.randomUUID()}.zip`);
  },
});

const fileFilter = (_req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (extension !== ".zip") {
    return cb(new ApiError(415, "Only ZIP archives are supported"));
  }

  cb(null, true);
};

const multerUpload = multer({
  storage,

  limits: {
    fileSize: MAX_ZIP_SIZE,
    files: 1,
    fields: 0,
    parts: 2,
  },

  fileFilter,
}).single("file");

const snapshotUpload = (req, res, next) => {
  multerUpload(req, res, (error) => {
    if (error) {
      if (
        error instanceof multer.MulterError &&
        error.code === "LIMIT_FILE_SIZE"
      ) {
        return next(
          new ApiError(
            413,
            `ZIP archive cannot exceed ${MAX_ZIP_SIZE / 1024 / 1024} MB`,
          ),
        );
      }

      if (error instanceof multer.MulterError) {
        return next(new ApiError(400, `Invalid upload: ${error.message}`));
      }

      return next(error);
    }

    if (!req.file) {
      return next(new ApiError(400, "Project ZIP file is required"));
    }

    next();
  });
};

export { snapshotUpload, MAX_ZIP_SIZE };
