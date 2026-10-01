import UserPreference from "../models/user-preference.model.js";
import ApiError from "../utils/ApiError.js";

export const updateUserPreferenceFields = async ({
  userId,
  experienceLevel,
}) => {
  const preferences = await UserPreference.findOne({
    userId,
  });

  if (!preferences) {
    throw new ApiError(404, "User preferences not found.");
  }

  if (experienceLevel !== undefined) {
    preferences.experienceLevel = experienceLevel;
  }

  if (preferences.isModified()) {
    await preferences.save();
  }

  return preferences.toObject();
};

export const getUserPreferencesByUserId = async (userId) => {
  const preferences = await UserPreference.findOne({
    userId,
  })
    .select("purposes experienceLevel referralSource createdAt updatedAt")
    .lean();

  return preferences;
};
