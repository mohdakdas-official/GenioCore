import { completeOnboarding } from "../services/onboarding.service.js";

import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const completeOnboardingController = asyncHandler(async (req, res) => {
  const result = await completeOnboarding(req.user.id, {
    username: req.body.username,

    purposes: req.body.purposes,

    experienceLevel: req.body.experienceLevel,

    referralSource: req.body.referralSource,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Onboarding completed successfully"));
});
