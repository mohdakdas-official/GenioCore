import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import {
  deleteCloudinaryImage,
  uploadAvatarImage,
} from "./cloudinary.service.js";

export const updateUserProfileFields = async ({
  userId,
  fullname,
  username,
}) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (fullname !== undefined) {
    user.fullname = fullname.trim();
  }

  if (username !== undefined) {
    const normalizedUsername = username.trim().toLowerCase();

    if (normalizedUsername !== user.username) {
      const existingUser = await User.findOne({
        username: normalizedUsername,
        _id: {
          $ne: userId,
        },
      })
        .select("_id")
        .lean();

      if (existingUser) {
        throw new ApiError(409, "Username is already taken.");
      }

      user.username = normalizedUsername;
    }
  }

  if (user.isModified()) {
    await user.save();
  }

  return User.findById(userId)
    .select(
      "username fullname email avatar isVerified isOnboarded lastLoginAt createdAt updatedAt",
    )
    .lean();
};

export const checkUsernameAvailability = async ({ userId, username }) => {
  const normalizedUsername = username.trim().toLowerCase();

  const existingUser = await User.findOne({
    username: normalizedUsername,
  })
    .select("_id username")
    .lean();

  if (!existingUser) {
    return {
      username: normalizedUsername,
      available: true,
      isCurrentUsername: false,
    };
  }

  if (existingUser._id.toString() === userId.toString()) {
    return {
      username: normalizedUsername,
      available: true,
      isCurrentUsername: true,
    };
  }

  return {
    username: normalizedUsername,
    available: false,
    isCurrentUsername: false,
  };
};

export const getUserProfileById = async (userId) => {
  const user = await User.findById(userId)
    .select(
      "username fullname email avatar isVerified isOnboarded lastLoginAt createdAt updatedAt",
    )
    .lean();

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return user;
};

export const changeUserPassword = async ({
  userId,
  currentPassword,
  newPassword,
}) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);

  if (!isCurrentPasswordCorrect) {
    throw new ApiError(400, "Current password is incorrect.");
  }

  const isSamePassword = await user.comparePassword(newPassword);

  if (isSamePassword) {
    throw new ApiError(
      400,
      "New password must be different from the current password.",
    );
  }

  user.password = newPassword;

  await user.save();

  return true;
};

export const updateUserAvatar = async ({ userId, file }) => {
  const user = await User.findById(userId).select("+avatarPublicId");

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (!file?.buffer) {
    throw new ApiError(400, "Avatar image is required.");
  }

  const oldPublicId = user.avatarPublicId;

  const uploaded = await uploadAvatarImage({
    buffer: file.buffer,
    userId,
  });

  user.avatar = uploaded.url;
  user.avatarPublicId = uploaded.publicId;

  await user.save();

  if (oldPublicId) {
    try {
      await deleteCloudinaryImage(oldPublicId);
    } catch (error) {
      console.error("Failed to delete old avatar:", error);
    }
  }

  return User.findById(userId)
    .select("username fullname email avatar isVerified isOnboarded")
    .lean();
};

export const removeUserAvatar = async (userId) => {
  const user = await User.findById(userId).select("+avatarPublicId");

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const oldPublicId = user.avatarPublicId;

  user.avatar = null;
  user.avatarPublicId = null;

  await user.save();

  if (oldPublicId) {
    try {
      await deleteCloudinaryImage(oldPublicId);
    } catch (error) {
      console.error("Failed to delete avatar from Cloudinary:", error);
    }
  }

  return User.findById(userId)
    .select("username fullname email avatar isVerified isOnboarded")
    .lean();
};
