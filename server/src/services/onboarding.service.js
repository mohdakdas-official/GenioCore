import User from "../models/user.model.js";
import UserPreference from "../models/user-preference.model.js";

import ApiError from "../utils/ApiError.js";

export const completeOnboarding = async (
  userId,
  { username, avatar, purposes, experienceLevel, referralSource },
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.isVerified) {
    throw new ApiError(
      403,
      "Please verify your email before completing onboarding",
    );
  }

  if (user.isOnboarded) {
    throw new ApiError(400, "Onboarding is already completed");
  }

  const existingUsername = await User.findOne({
    username,
    _id: { $ne: user._id },
  });

  if (existingUsername) {
    throw new ApiError(409, "Username is already taken");
  }

  user.username = username;

  if (avatar !== undefined) {
    user.avatar = avatar;
  }

  await UserPreference.findOneAndUpdate(
    {
      userId: user._id,
    },
    {
      userId: user._id,
      purposes,
      experienceLevel,
      referralSource: referralSource,
    },
    {
      upsert: true,
      returnDocument: "after",
      runValidators: true,
    },
  );

  user.isOnboarded = true;

  await user.save();

  return {
    id: user._id,
    fullname: user.fullname,
    email: user.email,
    username: user.username,
    avatar: user.avatar,
    isVerified: user.isVerified,
    isOnboarded: user.isOnboarded,
  };
};
