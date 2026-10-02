import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

import {
  updateUserProfileFields,
  getUserProfileById,
  changeUserPassword,
  removeUserAvatar,
  updateUserAvatar,
} from "../services/user.service.js";

import {
  updateUserPreferenceFields,
  getUserPreferencesByUserId,
} from "../services/userPreference.service.js";

import { checkUsernameAvailability } from "../services/user.service.js";

export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const { fullname, username, experienceLevel } = req.body;

  const [updatedUser, updatedPreferences] = await Promise.all([
    updateUserProfileFields({
      userId,
      fullname,
      username,
    }),

    updateUserPreferenceFields({
      userId,
      experienceLevel,
    }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: updatedUser,

        preferences: updatedPreferences,
      },
      "Profile updated successfully.",
    ),
  );
});

export const usernameAvailability = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const { username } = res.locals.validatedQuery;

  const result = await checkUsernameAvailability({
    userId,
    username,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        result,
        result.available
          ? "Username is available."
          : "Username is already taken.",
      ),
    );
});

export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [user, preferences] = await Promise.all([
    getUserProfileById(userId),
    getUserPreferencesByUserId(userId),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
        preferences,
      },
      "Profile retrieved successfully.",
    ),
  );
});

export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const { currentPassword, newPassword } = req.body;

  await changeUserPassword({
    userId,
    currentPassword,
    newPassword,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password changed successfully."));
});

export const updateAvatar = asyncHandler(async (req, res) => {
  const updatedUser = await updateUserAvatar({
    userId: req.user.id,
    file: req.file,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Avatar updated successfully."));
});

export const removeAvatar = asyncHandler(async (req, res) => {
  const updatedUser = await removeUserAvatar(req.user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Avatar removed successfully."));
});
