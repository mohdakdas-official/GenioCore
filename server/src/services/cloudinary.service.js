import cloudinary from "../config/cloudinary.js";
import ApiError from "../utils/ApiError.js";
import logger from "../config/logger.js";

export const uploadAvatarImage = async ({ buffer, userId }) => {
  if (!buffer) {
    throw new ApiError(400, "Avatar image is required.");
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "geniocore/avatars",

        public_id: `user-${userId}-${Date.now()}`,

        resource_type: "image",

        transformation: [
          {
            width: 512,
            height: 512,
            crop: "fill",
            gravity: "auto",
          },
          {
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      },

      (error, result) => {
        if (error) {
          logger.error("Cloudinary avatar upload failed", {
            message: error.message,
            http_code: error.http_code,
            name: error.name,
          });

          return reject(
            new ApiError(
              502,
              process.env.NODE_ENV === "development"
                ? `Cloudinary upload failed: ${error.message}`
                : "Unable to upload avatar.",
            ),
          );
        }

        if (!result?.secure_url || !result?.public_id) {
          logger.error("Cloudinary returned invalid upload result", {
            result,
          });

          return reject(
            new ApiError(
              502,
              "Cloudinary returned an invalid upload response.",
            ),
          );
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    uploadStream.on("error", (error) => {
      logger.error("Cloudinary upload stream error", {
        message: error.message,
      });
    });

    uploadStream.end(buffer);
  });
};

export const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) {
    return;
  }

  await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });
};
