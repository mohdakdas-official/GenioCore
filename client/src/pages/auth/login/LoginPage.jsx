import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import useAuth from "../../../hooks/useAuth";

import LeftSection from "../../../components/auth/login/LeftSection";
import PasswordForm from "../../../components/auth/login/PasswordForm";
import OtpForm from "../../../components/auth/login/OtpForm";
import PageMeta from "../../../components/PageMeta";

const LoginPage = () => {
  const navigate = useNavigate();
  const {
    isLoginWithPassLoading,
    isLoginWithOTPLoading,
    isVerifyLoginOTPLoading,
    handleLoginWithPassword,
    handleLoginWithOTP,
    handleVerifyLoginOTP,
  } = useAuth();

  // Navigation tab & loading states
  const [authMethod, setAuthMethod] = useState("password");
  const [errors, setErrors] = useState({});

  // OTP flow state
  const [otpEmail, setOtpEmail] = useState("");
  const [currentOTPEmail, setCurrentOTPEmail] = useState("");
  const [otpStage, setOtpStage] = useState("request");
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(30);
  const [isCountingDown, setIsCountingDown] = useState(false);

  // Timer countdown
  useEffect(() => {
    let timer;
    if (isCountingDown && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0) {
      setIsCountingDown(false);
    }
    return () => clearInterval(timer);
  }, [isCountingDown, countdown]);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const clearErrors = (keys = []) => {
    setErrors((prev) => {
      const updated = { ...prev };
      keys.forEach((key) => delete updated[key]);
      return updated;
    });
  };

  // Password Submit
  const handlePasswordSubmit = async ({ email, password }) => {
    const newErrors = {};
    if (!email.trim())
      newErrors.passwordEmail = "Please enter your email address.";
    else if (!isValidEmail(email))
      newErrors.passwordEmail = "Please enter a valid email address.";
    if (!password) newErrors.password = "Password is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    try {
      await handleLoginWithPassword({ email, password });
      navigate("/v1/dashboard");
    } catch (error) {
      console.log(
        "Login error:",
        error?.response?.data?.message || error?.message,
      );
      setErrors({
        form: "Invalid credentials.",
      });
    }
  };

  // OTP Request
  const handleOtpRequest = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!otpEmail.trim())
      newErrors.otpEmail = "Please enter your email address.";
    else if (!isValidEmail(otpEmail))
      newErrors.otpEmail = "Please enter a valid email address.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      const data = await handleLoginWithOTP({ email: otpEmail });
      setCurrentOTPEmail(data?.data?.email || otpEmail);
      setOtpStage("verify");
      setCountdown(30);
      setIsCountingDown(true);
    } catch (error) {
      setErrors({
        form:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to send OTP.",
      });
    }
  };

  // OTP Verification
  const handleOtpVerify = async (e) => {
    e.preventDefault();
    const enteredOtp = otpValues.join("");

    if (enteredOtp.length < 6) {
      setErrors({ otp: "Please enter the complete 6-digit OTP." });
      return;
    }

    setErrors({});

    try {
      await handleVerifyLoginOTP({
        email: currentOTPEmail,
        otp: enteredOtp,
      });
      navigate("/v1/dashboard");
    } catch (error) {
      setErrors({
        form:
          error?.response?.data?.message ||
          error?.message ||
          "Invalid or expired OTP.",
      });
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (isCountingDown) return;
    setOtpValues(["", "", "", "", "", ""]);
    setCountdown(30);
    setIsCountingDown(true);

    try {
      await handleLoginWithOTP({ email: currentOTPEmail || otpEmail });
    } catch (error) {
      setErrors({
        form:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to resend OTP.",
      });
    }
  };

  return (
    <>
      <PageMeta
        title="Sign In — GenioCore"
        description="Sign in to your GenioCore account."
      />
      <div className="min-h-screen w-full bg-background text-[#E6EDF3] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans antialiased relative overflow-hidden selection:bg-primary/30 selection:text-success">
        {/* Background Ambient Glows */}
        <div
          className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[130px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-secondary/10 blur-[150px]"
          aria-hidden="true"
        />

        {/* Main Authentication Grid Box */}
        <div className="relative z-10 w-full max-w-5xl rounded-2xl border border-border-subtle bg-surface/90 backdrop-blur-xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
          {/* Left Presentation Section */}
          <LeftSection />

          {/* Right Form Section */}
          <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-center bg-surface">
            <div className="max-w-md w-full mx-auto">
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-text-primary tracking-tight">
                  Welcome back
                </h2>
                <p className="text-sm text-muted mt-1">
                  Sign in to continue to your workspace.
                </p>
              </div>

              {/* Auth Tab Switcher */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-surface-hover rounded-xl border border-white/5 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod("password");
                    setErrors({});
                  }}
                  className={`py-2 text-xs font-medium rounded-lg transition-all duration-150 cursor-pointer ${
                    authMethod === "password"
                      ? "bg-primary text-background font-semibold shadow-sm"
                      : "text-muted hover:text-text-primary"
                  }`}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod("otp");
                    setErrors({});
                  }}
                  className={`py-2 text-xs font-medium rounded-lg transition-all duration-150 cursor-pointer ${
                    authMethod === "otp"
                      ? "bg-primary text-background font-semibold shadow-sm"
                      : "text-muted hover:text-text-primary"
                  }`}
                >
                  Email OTP
                </button>
              </div>

              {/* Method Forms */}
              {authMethod === "password" ? (
                <PasswordForm
                  onSubmit={handlePasswordSubmit}
                  isLoading={isLoginWithPassLoading}
                  errors={errors}
                  clearError={clearErrors}
                />
              ) : (
                <OtpForm
                  stage={otpStage}
                  otpEmail={otpEmail}
                  setOtpEmail={setOtpEmail}
                  onRequestOtp={handleOtpRequest}
                  onVerifyOtp={handleOtpVerify}
                  onChangeEmail={() => {
                    setOtpStage("request");
                    setOtpValues(["", "", "", "", "", ""]);
                    setErrors({});
                    setIsCountingDown(false);
                  }}
                  onResendOtp={handleResendOtp}
                  countdown={countdown}
                  isCountingDown={isCountingDown}
                  otpValues={otpValues}
                  setOtpValues={setOtpValues}
                  isLoading={isLoginWithOTPLoading || isVerifyLoginOTPLoading}
                  errors={errors}
                  clearError={clearErrors}
                />
              )}

              {/* Footers */}
              <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-muted">
                Don't have an account?{" "}
                <Link
                  to="/v1/auth/signup"
                  className="text-success font-semibold hover:underline"
                >
                  Create an account
                </Link>
                <div className="mt-6 text-center">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white transition group"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-gray-400 group-hover:-translate-x-1 transition-transform" />
                    <span>Back to home</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
