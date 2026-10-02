import express from "express";
import { validate } from "../middlewares/validate.middleware.js";
import {
  registerSchema,
  verifyEmailOTPSchema,
  resendVerificationOTPSchema,
  loginPasswordSchema,
  sendLoginOTPSchema,
  verifyLoginOTPSchema,
  forgotPasswordSchema,
  verifyResetOTPSchema,
  resetPasswordSchema,
} from "../validations/auth.validation.js";

import {
  registerController,
  verifyEmailOTPController,
  resendVerificationOTPController,
  loginWithPasswordController,
  sendLoginOTPController,
  verifyLoginOTPController,
  forgotPasswordController,
  verifyResetOTPController,
  resetPasswordController,
  refreshTokenController,
  logoutController,
  getCurrentUserController,
} from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const authRouter = express.Router();

authRouter.post("/register", validate(registerSchema), registerController);

authRouter.post(
  "/verify-email-otp",
  validate(verifyEmailOTPSchema),
  verifyEmailOTPController,
);

authRouter.post(
  "/resend-verification-otp",
  validate(resendVerificationOTPSchema),
  resendVerificationOTPController,
);

authRouter.post(
  "/login/password",
  validate(loginPasswordSchema),
  loginWithPasswordController,
);

authRouter.post(
  "/login/otp/send",
  validate(sendLoginOTPSchema),
  sendLoginOTPController,
);

authRouter.post(
  "/login/otp/verify",
  validate(verifyLoginOTPSchema),
  verifyLoginOTPController,
);

authRouter.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  forgotPasswordController,
);

authRouter.post(
  "/verify-reset-otp",
  validate(verifyResetOTPSchema),
  verifyResetOTPController,
);

authRouter.post(
  "/reset-password",
  validate(resetPasswordSchema),
  resetPasswordController,
);

authRouter.post("/refresh-token", refreshTokenController);

authRouter.post("/logout", authMiddleware, logoutController);

authRouter.get("/me", authMiddleware, getCurrentUserController);

export default authRouter;
