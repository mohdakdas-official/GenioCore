import {
  registerUser,
  verifyEmailOTP,
  resendVerificationOTP,
  loginWithPassword,
  sendLoginOTP,
  verifyLoginOTP,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  refreshToken,
  logoutUser,
  getCurrentUser,
} from "../services/auth.service.js";

import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const registerController = asyncHandler(async (req, res) => {
  const result = await registerUser({
    fullname: req.body.fullname,
    email: req.body.email,
    password: req.body.password,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, result.data, result.message));
});

export const verifyEmailOTPController = asyncHandler(async (req, res) => {
  const result = await verifyEmailOTP(req.body.userId, req.body.otp);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Email verified successfully"));
});

export const resendVerificationOTPController = asyncHandler(
  async (req, res) => {
    const result = await resendVerificationOTP(req.body.userId);

    return res.status(200).json(new ApiResponse(200, result, result.message));
  },
);

export const loginWithPasswordController = asyncHandler(async (req, res) => {
  const result = await loginWithPassword({
    email: req.body.email,
    password: req.body.password,
  });

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: result.user,
        accessToken: result.accessToken,
      },
      "Login successful",
    ),
  );
});

export const sendLoginOTPController = asyncHandler(async (req, res) => {
  const result = await sendLoginOTP(req.body.email);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        userId: result.userId,
        email: result.email,
      },
      result.message,
    ),
  );
});

export const verifyLoginOTPController = asyncHandler(async (req, res) => {
  const result = await verifyLoginOTP({
    email: req.body.email,
    otp: req.body.otp,
  });

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    samesite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: result.user,
        accessToken: result.accessToken,
      },
      "Login successfull",
    ),
  );
});

export const forgotPasswordController = asyncHandler(async (req, res) => {
  const result = await forgotPassword(req.body.email);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        userId: result.userId,
        email: result.email,
      },
      result.message,
    ),
  );
});

export const verifyResetOTPController = asyncHandler(async (req, res) => {
  const result = await verifyResetOTP(req.body.userId, req.body.otp);

  return res
    .status(200)
    .json(new ApiResponse(200, result.resetToken, result.message));
});

export const resetPasswordController = asyncHandler(async (req, res) => {
  const result = await resetPassword({
    resetToken: req.body.resetToken,
    newPassword: req.body.newPassword,
  });

  return res.status(200).json(new ApiResponse(200, null, result.message));
});

export const refreshTokenController = asyncHandler(async (req, res) => {
  const refreshTokenValue = req.cookies.refreshToken;

  const result = await refreshToken(refreshTokenValue);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        accessToken: result.accessToken,
      },
      "Access token refreshed successfully",
    ),
  );
});

export const logoutController = asyncHandler(async (req, res) => {
  await logoutUser({
    userId: req.user.id,
    refreshTokenValue: req.cookies.refreshToken,
    accessTokenJti: req.user.jti,
    accessTokenExp: req.user.exp,
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Logged out successfully"));
});

export const getCurrentUserController = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User profile fetched successfully"));
});
