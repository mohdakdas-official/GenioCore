import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  loginWithPassword,
  loginWithOTP,
  verifyloginOTP,
  registerUser,
  verifyEmail,
  resendVerificationOTP,
  forgotPasswordOtp,
  verifyforgotPasswordOtp,
  resetPassword,
  logoutUser,
} from "../services/auth.service";
import { setAccessToken, clearAccessToken } from "../services/api";

const useAuth = () => {
  const [isLoginWithPassLoading, setIsLoginWithPassLoading] = useState(false);
  const [isLoginWithOTPLoading, setIsLoginWithOTPLoading] = useState(false);
  const [isVerifyLoginOTPLoading, setIsVerifyLoginOTPLoading] = useState(false);
  const [isRegisterUserLoading, setIsRegisterUserLoading] = useState(false);
  const [isVerifyEmailLoading, setIsVerifyEmailLoading] = useState(false);
  const [isResendVerificationOTPLoading, setIsResendVerificationOTPLoading] =
    useState(false);
  const [isForgotPasswordOTPLoading, setIsForgotPasswordOTPLoading] =
    useState(false);
  const [
    isVerifyForgotPasswordOTPLoading,
    setIsVerifyForgotPasswordOTPLoading,
  ] = useState(false);
  const [isResetPasswordLoading, setIsResetPasswordOTPLoading] =
    useState(false);
  const [isLogoutUserLoading, setIsLogoutUserLoading] = useState(false);
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  const { user, setUser, isAuthLoading } = context;

  const handleLoginWithPassword = async ({ email, password }) => {
    setIsLoginWithPassLoading(true);

    try {
      const data = await loginWithPassword({ email, password });

      const { accessToken, user } = data.data;

      setAccessToken(accessToken);
      setUser(user);

      return data;
    } finally {
      setIsLoginWithPassLoading(false);
    }
  };
  const handleLoginWithOTP = async (email) => {
    setIsLoginWithOTPLoading(true);

    try {
      const data = await loginWithOTP(email);

      return data;
    } catch (error) {
      throw error;
    } finally {
      setIsLoginWithOTPLoading(false);
    }
  };
  const handleVerifyLoginOTP = async ({ email, otp }) => {
    setIsVerifyLoginOTPLoading(true);

    try {
      const data = await verifyloginOTP({ email, otp });

      const { accessToken, user } = data.data;

      setAccessToken(accessToken);
      setUser(user);

      return data;
    } catch (error) {
      throw error;
    } finally {
      setIsVerifyLoginOTPLoading(false);
    }
  };

  const handleRegisterUser = async ({ fullname, email, password }) => {
    setIsRegisterUserLoading(true);
    try {
      const data = await registerUser({
        fullname,
        email,
        password,
      });

      return data;
    } finally {
      setIsRegisterUserLoading(false);
    }
  };

  const handleVerifyEmail = async ({ userId, otp }) => {
    setIsVerifyEmailLoading(true);
    try {
      const data = await verifyEmail({ userId, otp });

      return data;
    } finally {
      setIsVerifyEmailLoading(false);
    }
  };

  const handleResendVerificationOTP = async ({ userId }) => {
    setIsResendVerificationOTPLoading(true);
    try {
      const data = await resendVerificationOTP({ userId });

      return data;
    } finally {
      setIsResendVerificationOTPLoading(false);
    }
  };

  const handleForgotPasswordOtp = async ({ email }) => {
    setIsForgotPasswordOTPLoading(true);
    try {
      const data = await forgotPasswordOtp({ email });

      return data;
    } finally {
      setIsForgotPasswordOTPLoading(false);
    }
  };

  const handleVerifyForgotPasswordOtp = async ({ userId, otp }) => {
    setIsVerifyForgotPasswordOTPLoading(true);
    try {
      const data = await verifyforgotPasswordOtp({ userId, otp });

      return data;
    } finally {
      setIsVerifyForgotPasswordOTPLoading(false);
    }
  };

  const handleResetPassword = async ({ resetToken, newPassword }) => {
    setIsResetPasswordOTPLoading(true);
    try {
      const data = await resetPassword({ resetToken, newPassword });

      return data;
    } finally {
      setIsResetPasswordOTPLoading(false);
    }
  };

  const handleLogoutUser = async () => {
    setIsLogoutUserLoading(true);
    try {
      const data = await logoutUser();

      return data;
    } finally {
      clearAccessToken();
      setUser(null);
      setIsLogoutUserLoading(false);
    }
  };

  return {
    user,
    isAuthLoading,
    isLoginWithPassLoading,
    isLoginWithOTPLoading,
    isVerifyLoginOTPLoading,
    isRegisterUserLoading,
    isVerifyEmailLoading,
    isResendVerificationOTPLoading,
    isForgotPasswordOTPLoading,
    isVerifyForgotPasswordOTPLoading,
    isResetPasswordLoading,
    isLogoutUserLoading,
    handleLoginWithPassword,
    handleLoginWithOTP,
    handleVerifyLoginOTP,
    handleRegisterUser,
    handleVerifyEmail,
    handleResendVerificationOTP,
    handleForgotPasswordOtp,
    handleVerifyForgotPasswordOtp,
    handleResetPassword,
    handleLogoutUser,
  };
};

export default useAuth;
