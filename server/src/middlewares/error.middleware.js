import multer from "multer";

import ApiError from "../utils/ApiError.js";
import logger from "../config/logger.js";

const errorHandler = (err, req, res, next) => {
  logger.error(err);

  /*
   * Multer upload errors
   */
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        message: "Avatar image must be smaller than 10 MB.",
      });
    }

    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Only one avatar image can be uploaded.",
      });
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected file field. Use 'avatar' as the file field name.",
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message || "Invalid file upload.",
    });
  }

  /*
   * Application errors
   */
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  /*
   * Unknown / internal errors
   */
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",

    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};

export default errorHandler;
