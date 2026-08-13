import express from "express";

import authMiddleware from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";

import {
    completeOnboardingController,
} from "../controllers/onboarding.controller.js";

import {
    onboardingSchema,
} from "../validations/onboarding.validation.js";

const userRouter = express.Router();

userRouter.post(
    "/onboarding",
    authMiddleware,
    validate(onboardingSchema),
    completeOnboardingController
);

export default userRouter;