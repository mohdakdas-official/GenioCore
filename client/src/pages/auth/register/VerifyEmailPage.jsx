import React, { useState, useEffect, useRef } from "react";
import { Navigate, useNavigate, useLocation, Link } from "react-router-dom";
import {
  Sparkles,
  Terminal,
  ShieldCheck,
  LockKeyhole,
  MailCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  KeyRound,
  RefreshCw,
  Edit3,
} from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import PageMeta from "../../../components/PageMeta";

const OTP_LENGTH = 6;
const RESEND_INTERVAL = 30;

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    handleVerifyEmail,
    handleResendVerificationOTP,
    isResendVerificationOTPLoading,
    isVerifyEmailLoading,
  } = useAuth();

  const userEmail = location.state?.email;
  const userId = location.state?.userId;

  // Guard: Redirect if required state is missing
  if (!userId || !userEmail) {
    return <Navigate to="/v1/auth/signup" replace />;
  }

  // OTP and Verification States
  const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const [resendSuccessMsg, setResendSuccessMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Timer States
  const [countdown, setCountdown] = useState(RESEND_INTERVAL);
  const [isCountingDown, setIsCountingDown] = useState(true);

  // Input element references
  const otpInputRefs = useRef([]);

  // Auto-focus first input on mount
  useEffect(() => {
    otpInputRefs.current[0]?.focus();
  }, []);

  // Timer countdown
  useEffect(() => {
    let timer;

    if (isCountingDown && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsCountingDown(false);
    }

    return () => clearInterval(timer);
  }, [isCountingDown, countdown]);

  // Mask email
  const getMaskedEmail = (email) => {
    if (!email || !email.includes("@")) return email;

    const [user, domain] = email.split("@");

    const maskedUser =
      user.length > 2
        ? `${user[0]}***${user[user.length - 1]}`
        : `${user[0]}***`;

    return `${maskedUser}@${domain}`;
  };

  // OTP input change
  const handleOtpChange = (index, value) => {
    // Only accept numeric inputs
    const cleanValue = value.replace(/\D/g, "");

    if (!cleanValue && value !== "") return;

    const newOtp = [...otpValues];
    newOtp[index] = cleanValue.slice(-1);

    setOtpValues(newOtp);

    if (otpError) {
      setOtpError("");
    }

    // Advance focus if a digit is entered
    if (cleanValue && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // OTP keyboard navigation
  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otpValues[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault();

    const rawData = e.clipboardData.getData("text");
    const sanitizedDigits = rawData.replace(/\D/g, "").slice(0, OTP_LENGTH);

    if (!sanitizedDigits) return;

    const nextValues = [...otpValues];

    sanitizedDigits.split("").forEach((char, idx) => {
      nextValues[idx] = char;
    });

    setOtpValues(nextValues);

    if (otpError) {
      setOtpError("");
    }

    const targetIndex = Math.min(sanitizedDigits.length, OTP_LENGTH - 1);

    otpInputRefs.current[targetIndex]?.focus();
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (isCountingDown || isResendVerificationOTPLoading) {
      return;
    }

    setResendSuccessMsg("");
    setOtpError("");

    try {
      const response = await handleResendVerificationOTP({
        userId,
        email: userEmail,
      });

      setOtpValues(Array(OTP_LENGTH).fill(""));
      setCountdown(RESEND_INTERVAL);
      setIsCountingDown(true);

      setResendSuccessMsg(
        response?.message || "A new verification code has been sent.",
      );

      otpInputRefs.current[0]?.focus();
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to resend code. Please try again.";

      setOtpError(errorMsg);
    }
  };

  // Verify OTP
  const onVerifyOtp = async (e) => {
    e.preventDefault();

    const enteredOtp = otpValues.join("");

    if (enteredOtp.length < OTP_LENGTH) {
      setOtpError(`Please enter the complete ${OTP_LENGTH}-digit code.`);
      return;
    }

    setOtpError("");

    try {
      const response = await handleVerifyEmail({
        userId,
        otp: enteredOtp,
      });

      setIsSuccess(true);

      setTimeout(() => {
        navigate("/v1/auth/login", {
          state: {
            verifiedEmail: userEmail,
            message: response?.message || "Email verified successfully.",
          },
        });
      }, 1500);
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Invalid or expired verification code.";

      setOtpError(errorMsg);
    }
  };

  const isBusy = isVerifyEmailLoading || isResendVerificationOTPLoading;

  return (
    <>
      <PageMeta
        title="Verify Email — GenioCore"
        description="Verify your email address to activate and secure your GenioCore account."
      />
      <div
        className="
        min-h-screen
        w-full
        bg-background
        text-foreground
        flex
        items-center
        justify-center
        p-4 sm:p-6 lg:p-8
        font-sans
        antialiased
        relative
        overflow-hidden
        selection:bg-primary/30
        selection:text-primary-foreground
      "
      >
        {/* Background Glow - Primary */}
        <div
          className="
          pointer-events-none
          absolute
          -top-40
          -left-40
          h-[500px]
          w-[500px]
          rounded-full
          bg-primary/10
          blur-[130px]
        "
          aria-hidden="true"
        />

        {/* Background Glow - Info */}
        <div
          className="
          pointer-events-none
          absolute
          -bottom-40
          -right-40
          h-[500px]
          w-[500px]
          rounded-full
          bg-info/10
          blur-[150px]
        "
          aria-hidden="true"
        />

        {/* Main Container */}
        <div
          className="
          relative
          z-10
          w-full
          max-w-5xl
          rounded-2xl
          border
          border-border
          bg-card/90
          backdrop-blur-xl
          shadow-2xl
          overflow-hidden
          grid
          grid-cols-1
          lg:grid-cols-12
          min-h-[640px]
        "
        >
          {/* =========================================================
            LEFT SECTION
        ========================================================== */}

          <div
            className="
    lg:col-span-6
    bg-gradient-to-b
    from-surface
    to-background
    p-8
    lg:p-12
    flex
    flex-col
    justify-between
    border-b
    lg:border-b-0
    lg:border-r
    border-border
    relative
    overflow-hidden
  "
          >
            {/* Grid Background */}
            <div
              className="
      absolute
      inset-0
      bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)]
      bg-[size:24px_24px]
      pointer-events-none
    "
              aria-hidden="true"
            />

            {/* Intro */}
            <div className="relative z-10">
              <div
                className="
        inline-flex
        items-center
        gap-2
        px-3
        py-1.5
        rounded-full
        bg-primary/10
        border
        border-primary/20
        text-primary
        text-xs
        font-medium
        mb-6
      "
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>GenioCore email verification</span>
              </div>

              <h1
                className="
        text-3xl
        lg:text-4xl
        font-bold
        tracking-tight
        text-text-primary
      "
              >
                GenioCore
              </h1>

              <p
                className="
        mt-2
        text-base
        text-text-secondary
        font-medium
      "
              >
                Verify your email address.
              </p>

              <p
                className="
        mt-1
        max-w-lg
        text-sm
        leading-6
        text-muted
      "
              >
                Enter the verification code sent to your email to activate your
                account and continue to GenioCore.
              </p>
            </div>

            {/* Verification Preview */}
            <div className="my-8 relative z-10">
              <div
                className="
        rounded-xl
        border
        border-border
        bg-background/95
        shadow-2xl
        p-5
        font-mono
        text-xs
        text-text-secondary
        relative
      "
              >
                {/* Terminal Header */}
                <div
                  className="
          flex
          items-center
          justify-between
          pb-3
          mb-4
          border-b
          border-border-subtle
          text-muted
        "
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-error/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-warning/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-success/80 inline-block" />
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-muted">
                    <Terminal className="w-3.5 h-3.5 text-primary" />
                    <span>email-verification</span>
                  </div>
                </div>

                {/* Code */}
                <div className="space-y-1 text-muted leading-relaxed">
                  <p>
                    <span className="text-info">const</span> account ={" "}
                    <span className="text-primary">await</span>{" "}
                    verifyEmail(otp);
                  </p>

                  <p className="text-text-disabled">
                    // confirm email ownership before account activation
                  </p>
                </div>

                {/* Verification Flow */}
                <div className="mt-5 space-y-2">
                  <div
                    className="
            flex
            items-center
            justify-between
            px-3
            py-2
            rounded-lg
            bg-surface-hover
            border
            border-border-subtle
          "
                  >
                    <span className="flex items-center gap-2 text-text-secondary">
                      <MailCheck className="w-3.5 h-3.5 text-primary" />
                      Email Address
                    </span>

                    <span className="text-[10px] text-muted">Provided</span>
                  </div>

                  <div
                    className="
            flex
            items-center
            justify-between
            px-3
            py-2
            rounded-lg
            bg-surface-hover
            border
            border-border-subtle
          "
                  >
                    <span className="flex items-center gap-2 text-text-secondary">
                      <KeyRound className="w-3.5 h-3.5 text-primary" />
                      Verification Code
                    </span>

                    <span className="text-[10px] text-muted">6 digits</span>
                  </div>

                  <div
                    className="
            flex
            items-center
            justify-between
            px-3
            py-2
            rounded-lg
            bg-surface-hover
            border
            border-border-subtle
          "
                  >
                    <span className="flex items-center gap-2 text-text-secondary">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      Account Activation
                    </span>

                    <span className="text-[10px] text-muted">
                      After verification
                    </span>
                  </div>
                </div>

                {/* Flow */}
                <div className="mt-5 pt-4 border-t border-border-subtle">
                  <div className="mb-3 text-[10px] uppercase tracking-wider text-muted">
                    Verification flow
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[10px]">
                    <span className="px-2 py-1 rounded-md bg-surface border border-border-subtle text-text-secondary">
                      Email
                    </span>

                    <span className="text-muted">→</span>

                    <span className="px-2 py-1 rounded-md bg-surface border border-border-subtle text-text-secondary">
                      OTP
                    </span>

                    <span className="text-muted">→</span>

                    <span className="px-2 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary">
                      Activated
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                Email verification
              </span>

              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                One-time passcode
              </span>
            </div>
          </div>

          {/* =========================================================
            RIGHT SECTION
        ========================================================== */}

          <div
            className="
            lg:col-span-6
            p-8
            lg:p-12
            flex
            flex-col
            justify-center
            bg-surface
          "
          >
            <div className="max-w-md w-full mx-auto">
              {/* =====================================================
                SUCCESS STATE
            ====================================================== */}

              {isSuccess ? (
                <div className="text-center py-6">
                  {/* Success Icon */}
                  <div
                    className="
                    w-14
                    h-14
                    rounded-2xl
                    bg-success/10
                    border
                    border-success/20
                    flex
                    items-center
                    justify-center
                    mx-auto
                    mb-5
                    text-success
                  "
                  >
                    <CheckCircle2 className="w-7 h-7" />
                  </div>

                  {/* Success Heading */}
                  <h2
                    className="
                    text-2xl
                    font-bold
                    text-text-primary
                    tracking-tight
                  "
                  >
                    Email verified successfully
                  </h2>

                  {/* Success Message */}
                  <p
                    className="
                    text-sm
                    text-muted
                    mt-2
                  "
                  >
                    Your account is now activated. Redirecting you to sign in...
                  </p>

                  {/* Loading Spinner */}
                  <div className="mt-6 flex justify-center">
                    <Loader2
                      className="
                      w-6
                      h-6
                      animate-spin
                      text-primary
                    "
                    />
                  </div>
                </div>
              ) : (
                <div>
                  {/* =================================================
                    PAGE HEADER
                ================================================== */}

                  <div className="mb-6">
                    <h2
                      className="
                      text-2xl
                      font-bold
                      text-text-primary
                      tracking-tight
                    "
                    >
                      Verify your email
                    </h2>

                    <p
                      className="
                      text-sm
                      text-muted
                      mt-1
                    "
                    >
                      We've sent a 6-digit verification code to your email
                      address.
                    </p>
                  </div>

                  {/* =================================================
                    OTP FORM
                ================================================== */}

                  <form onSubmit={onVerifyOtp} className="space-y-4">
                    {/* Email Information */}
                    <div
                      className="
                      flex
                      items-center
                      justify-between
                      pb-1
                      text-xs
                    "
                    >
                      <span className="text-text-secondary">
                        Code sent to{" "}
                        <span
                          className="
                          text-text-primary
                          font-medium
                        "
                        >
                          {getMaskedEmail(userEmail)}
                        </span>
                      </span>

                      {/* Change Email */}
                      <Link
                        to="/v1/auth/signup"
                        className="
                        text-primary
                        hover:text-primary-hover
                        hover:underline
                        flex
                        items-center
                        gap-1
                        font-medium
                        transition
                      "
                      >
                        <Edit3 className="w-3 h-3" />
                        Change email
                      </Link>
                    </div>

                    {/* OTP Inputs */}
                    <div
                      className="
                      flex
                      justify-between
                      gap-2
                    "
                      onPaste={handleOtpPaste}
                    >
                      {otpValues.map((val, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (otpInputRefs.current[idx] = el)}
                          type="text"
                          maxLength={1}
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          aria-label={`Digit ${idx + 1}`}
                          value={val}
                          disabled={isBusy}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className={`
                          w-12
                          h-12
                          text-center
                          text-lg
                          font-bold
                          bg-card
                          border
                          ${
                            otpError
                              ? `
                                border-error/80
                                focus:border-error
                                focus:ring-error
                              `
                              : `
                                border-border
                                focus:border-primary
                                focus:ring-primary
                              `
                          }
                          rounded-xl
                          text-text-primary
                          outline-none
                          focus:ring-1
                          transition
                          disabled:opacity-50
                        `}
                        />
                      ))}
                    </div>

                    {/* OTP Error */}
                    {otpError && (
                      <p
                        className="
                        text-xs
                        text-error
                        text-left
                      "
                      >
                        {otpError}
                      </p>
                    )}

                    {/* Resend Success */}
                    {resendSuccessMsg && !otpError && (
                      <p
                        className="
                        text-xs
                        text-success
                        flex
                        items-center
                        gap-1
                      "
                      >
                        <MailCheck
                          className="
                          w-3.5
                          h-3.5
                          shrink-0
                        "
                        />

                        {resendSuccessMsg}
                      </p>
                    )}

                    {/* =================================================
                      RESEND SECTION
                  ================================================== */}

                    <div
                      className="
                      flex
                      items-center
                      justify-between
                      text-xs
                      text-muted
                      pt-1
                    "
                    >
                      <span>Didn't receive the code?</span>

                      {isCountingDown ? (
                        <span
                          className="
                          text-muted
                          font-mono
                        "
                        >
                          Resend OTP in {countdown}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={isBusy}
                          className="
                          text-primary
                          hover:text-primary-hover
                          hover:underline
                          flex
                          items-center
                          gap-1
                          font-medium
                          disabled:opacity-50
                          transition
                        "
                        >
                          {isResendVerificationOTPLoading ? (
                            <Loader2
                              className="
                              w-3
                              h-3
                              animate-spin
                            "
                            />
                          ) : (
                            <RefreshCw className="w-3 h-3" />
                          )}

                          <span>Resend OTP</span>
                        </button>
                      )}
                    </div>

                    {/* =================================================
                      VERIFY BUTTON
                  ================================================== */}

                    <button
                      type="submit"
                      disabled={
                        isBusy || otpValues.join("").length < OTP_LENGTH
                      }
                      className="
                      w-full
                      mt-2
                      bg-primary
                      hover:bg-primary-hover
                      active:bg-primary-active
                      text-primary-foreground
                      font-semibold
                      py-2.5
                      rounded-xl
                      transition
                      duration-150
                      flex
                      items-center
                      justify-center
                      gap-2
                      text-sm
                      shadow-brand
                      disabled:opacity-50
                      disabled:pointer-events-none
                    "
                    >
                      {isVerifyEmailLoading ? (
                        <>
                          <Loader2
                            className="
                            w-4
                            h-4
                            animate-spin
                          "
                          />

                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <span>Verify Email</span>

                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* =================================================
                    RETURN TO SIGNUP
                ================================================== */}

                  <div
                    className="
                    mt-8
                    pt-6
                    border-t
                    border-border-subtle
                    text-center
                  "
                  >
                    <Link
                      to="/v1/auth/signup"
                      className="
                      inline-flex
                      items-center
                      gap-2
                      text-xs
                      font-medium
                      text-muted
                      hover:text-text-primary
                      transition
                      group
                    "
                    >
                      <ArrowLeft
                        className="
                        w-3.5
                        h-3.5
                        text-muted
                        group-hover:-translate-x-1
                        transition-transform
                      "
                      />

                      <span>Return to Signup</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
