import api from "./api";

export const loginWithPassword = async ({ email, password }) => {
  const response = await api.post("/auth/login/password", { email, password });

  return response.data;
};
export const loginWithOTP = async (email) => {
  const response = await api.post("/auth/login/otp/send", email);

  return response.data;
};
export const verifyloginOTP = async ({ email, otp }) => {
  const response = await api.post("/auth/login/otp/verify", {
    email,
    otp,
  });

  return response.data;
};

export const registerUser = async ({ fullname, email, password }) => {
  const response = await api.post("/auth/register", {
    fullname,
    email,
    password,
  });

  return response.data;
};

export const verifyEmail = async ({ userId, otp }) => {
  const response = await api.post("/auth/verify-email-otp", { userId, otp });

  return response.data;
};

export const resendVerificationOTP = async ({ userId }) => {
  const response = await api.post("/auth/resend-verification-otp", {
    userId,
  });

  return response.data;
};

export const forgotPasswordOtp = async ({ email }) => {
  const response = await api.post("/auth/forgot-password", { email });

  return response;
};

export const verifyforgotPasswordOtp = async ({ userId, otp }) => {
  const response = await api.post("/auth/verify-reset-otp", { userId, otp });

  return response;
};

export const resetPassword = async ({ resetToken, newPassword }) => {
  const response = await api.post("/auth/reset-password", {
    resetToken,
    newPassword,
  });

  return response;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");

  return response.data;
};

export const refreshAccessToken = async () => {
  const response = await api.post("/auth/refresh-token");

  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post("/auth/logout");

  return response.data;
};
