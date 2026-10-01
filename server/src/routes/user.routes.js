import express from "express";

import authMiddleware from "../middlewares/auth.middleware.js";
import { validate, validateQuery } from "../middlewares/validate.middleware.js";

import { completeOnboardingController } from "../controllers/onboarding.controller.js";

import { onboardingSchema } from "../validations/onboarding.validation.js";
import {
  changePasswordSchema,
  updateProfileSchema,
  usernameAvailabilitySchema,
} from "../validations/user.validation.js";
import {
  updateProfile,
  usernameAvailability,
  getProfile,
  changePassword,
  updateAvatar,
  removeAvatar,
} from "../controllers/user.controller.js";
import { uploadAvatar } from "../middlewares/picUpload.middleware.js";

const userRouter = express.Router();

userRouter.post(
  "/onboarding",
  authMiddleware,
  validate(onboardingSchema),
  completeOnboardingController,
);

userRouter.patch(
  "/profile",
  authMiddleware,
  validate(updateProfileSchema),
  updateProfile,
);

userRouter.get(
  "/username-availability",
  authMiddleware,
  validateQuery(usernameAvailabilitySchema),
  usernameAvailability,
);

userRouter.patch(
  "/password",
  authMiddleware,
  validate(changePasswordSchema),
  changePassword,
);

userRouter.get("/profile", authMiddleware, getProfile);

userRouter.patch(
  "/avatar",
  authMiddleware,
  uploadAvatar.single("avatar"),
  updateAvatar,
);

userRouter.delete("/avatar", authMiddleware, removeAvatar);

export default userRouter;
