import multer from "multer";
import ApiError from "../utils/ApiError.js";

const storage = multer.memoryStorage();

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    return cb(new ApiError(400, "Avatar must be a JPG, PNG, or WEBP image."));
  }

  cb(null, true);
};

export const uploadAvatar = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 1,
  },
});
