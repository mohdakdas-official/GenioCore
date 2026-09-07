import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Edit3,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  MailCheck,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react";

import useAuth from "../../../hooks/useAuth";
import { emailSchema } from "../../../validation/auth.validation";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const {
    handleForgotPasswordOtp,
    handleVerifyForgotPasswordOtp,
    isForgotPasswordOTPLoading,
    isVerifyForgotPasswordOTPLoading,
  } = useAuth();

  const [step, setStep] = useState("email");
  const [targetEmail, setTargetEmail] = useState("");
  const [targetUserId, setTargetUserId] = useState("");

  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [resendSuccessMsg, setResendSuccessMsg] = useState("");

  const [countdown, setCountdown] = useState(30);
  const [isCountingDown, setIsCountingDown] = useState(false);

  const otpInputRefs = useRef([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(emailSchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
    },
  });

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

  const getMaskedEmail = (email) => {
    if (!email) return "";

    const [user, domain] = email.split("@");

    if (!domain) return email;

    const maskedUser =
      user.length > 2
        ? `${user[0]}***${user[user.length - 1]}`
        : `${user[0]}***`;

    return `${maskedUser}@${domain}`;
  };

  const onEmailSubmit = async (data) => {
    try {
      const response = await handleForgotPasswordOtp({
        email: data.email,
      });

      setTargetEmail(data.email);
      setTargetUserId(response.data.data.userId);
      setStep("otp");
      setCountdown(30);
      setIsCountingDown(true);
      setOtpError("");
      setResendSuccessMsg("");

      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);

      return response;
    } catch (error) {
      // Error handling agar useAuth ke andar centralized hai
      // to yahan kuch karne ki zarurat nahi.
    }
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otpValues];

    newOtp[index] = value.slice(-1);

    setOtpValues(newOtp);

    if (otpError) {
      setOtpError("");
    }

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();

    const pastedData = event.clipboardData.getData("text").trim();

    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");

      setOtpValues(digits);
      otpInputRefs.current[5]?.focus();

      if (otpError) {
        setOtpError("");
      }
    }
  };

  const handleResendOtp = async () => {
    if (isCountingDown || isForgotPasswordOTPLoading) return;

    try {
      setResendSuccessMsg("");
      setOtpError("");

      await handleForgotPasswordOtp({
        email: targetEmail,
      });

      setOtpValues(["", "", "", "", "", ""]);
      setCountdown(30);
      setIsCountingDown(true);
      setResendSuccessMsg("A new verification code has been sent.");

      otpInputRefs.current[0]?.focus();
    } catch (error) {
      // Centralized error handling ho to empty rehne do.
    }
  };

  const onOtpVerify = async (event) => {
    event.preventDefault();

    const enteredOtp = otpValues.join("");

    if (enteredOtp.length !== 6) {
      setOtpError("Please enter the 6-digit verification code.");
      return;
    }

    try {
      setOtpError("");

      const response = await handleVerifyForgotPasswordOtp({
        userId: targetUserId,
        otp: enteredOtp,
      });
      navigate("/v1/auth/reset-password", {
        state: {
          resetToken: response?.data?.data,
        },
      });
    } catch (error) {
      setOtpError(
        error?.response?.data?.message ||
          error?.message ||
          "Invalid or expired verification code.",
      );
    }
  };

  const handleChangeEmail = () => {
    setStep("email");
    setValue("email", targetEmail);

    setOtpValues(["", "", "", "", "", ""]);
    setOtpError("");
    setResendSuccessMsg("");
    setIsCountingDown(false);
  };

  return (
    <div
      className="
        relative flex min-h-screen w-full
        items-center justify-center overflow-hidden
        bg-background p-4
        font-sans text-foreground antialiased
        selection:bg-primary/30 selection:text-primary
        sm:p-6 lg:p-8
      "
    >
      {/* Background Glow */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute -left-40 -top-40
          h-[500px] w-[500px]
          rounded-full bg-primary/10 blur-[130px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute -bottom-40 -right-40
          h-[500px] w-[500px]
          rounded-full bg-info/10 blur-[150px]
        "
      />

      {/* Main Card */}
      <div
        className="
          relative z-10 grid min-h-[640px] w-full
          max-w-5xl grid-cols-1 overflow-hidden
          rounded-2xl border border-border
          bg-card/90 shadow-2xl backdrop-blur-xl
          lg:grid-cols-12
        "
      >
        {/* Left Section */}
        <div
          className="
            relative flex flex-col justify-between
            overflow-hidden border-b border-border
            bg-surface p-8
            lg:col-span-6 lg:border-b-0
            lg:border-r lg:p-12
          "
        >
          {/* Grid */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute inset-0
              bg-[linear-gradient(to_right,var(--border-subtle)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-subtle)_1px,transparent_1px)]
              bg-[size:24px_24px]
              opacity-40
            "
          />

          {/* Brand */}
          <div className="relative z-10">
            <div
              className="
                mb-6 inline-flex items-center gap-2
                rounded-full border border-primary/20
                bg-primary/10 px-3 py-1.5
                font-mono text-xs text-primary
              "
            >
              <Sparkles className="h-3.5 w-3.5" />

              <span>NeuAspire Identity Guard</span>
            </div>

            <h1
              className="
                text-3xl font-bold tracking-tight
                text-text-primary lg:text-4xl
              "
            >
              NeuAspire
            </h1>

            <p
              className="
                mt-2 text-base font-medium
                text-text-secondary
              "
            >
              Secure your account.
            </p>

            <p
              className="
                mt-1 text-sm leading-relaxed
                text-muted
              "
            >
              Reset your password securely and get back to building better
              software.
            </p>
          </div>

          {/* Terminal */}
          <div className="relative z-10 my-8">
            <div
              className="
                relative rounded-xl
                border border-border
                bg-background/95 p-5
                font-mono text-xs
                text-text-secondary
                shadow-2xl
              "
            >
              {/* Window Header */}
              <div
                className="
                  mb-3 flex items-center justify-between
                  border-b border-border-subtle
                  pb-3 text-muted
                "
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="
                      inline-block h-2.5 w-2.5
                      rounded-full bg-error/80
                    "
                  />

                  <span
                    className="
                      inline-block h-2.5 w-2.5
                      rounded-full bg-warning/80
                    "
                  />

                  <span
                    className="
                      inline-block h-2.5 w-2.5
                      rounded-full bg-success/80
                    "
                  />
                </div>

                <div
                  className="
                    flex items-center gap-1
                    text-[11px] text-muted
                  "
                >
                  <Terminal className="h-3.5 w-3.5 text-primary" />

                  <span>otp-challenge.sec</span>
                </div>
              </div>

              {/* Code */}
              <div
                className="
                  space-y-1 leading-relaxed
                  text-muted
                "
              >
                <p>
                  <span className="text-info">const</span> challenge ={" "}
                  <span className="text-primary">await</span>{" "}
                  auth.dispatchOtp();
                </p>

                <p className="text-text-disabled">
                  // Cryptographically isolated token pipeline
                </p>
              </div>

              {/* Security Checklist */}
              <div className="mt-4 space-y-2">
                <div
                  className="
                    flex items-center justify-between
                    rounded-md border
                    border-border-subtle
                    bg-surface/60
                    px-2.5 py-1.5
                  "
                >
                  <span
                    className="
                      flex items-center gap-2
                      text-text-secondary
                    "
                  >
                    <ShieldCheck
                      className="
                        h-3.5 w-3.5
                        text-success
                      "
                    />
                    Secure Request Verified
                  </span>

                  <span
                    className="
                      text-[11px] font-semibold
                      text-success
                    "
                  >
                    Valid
                  </span>
                </div>

                <div
                  className="
                    flex items-center justify-between
                    rounded-md border
                    border-border-subtle
                    bg-surface/60
                    px-2.5 py-1.5
                  "
                >
                  <span
                    className="
                      flex items-center gap-2
                      text-text-secondary
                    "
                  >
                    <LockKeyhole
                      className="
                        h-3.5 w-3.5
                        text-success
                      "
                    />
                    End-to-End Account Lock
                  </span>

                  <span
                    className="
                      text-[11px] font-semibold
                      text-success
                    "
                  >
                    Enforced
                  </span>
                </div>

                <div
                  className="
                    flex items-center justify-between
                    rounded-md border
                    border-border-subtle
                    bg-surface/60
                    px-2.5 py-1.5
                  "
                >
                  <span
                    className="
                      flex items-center gap-2
                      text-text-secondary
                    "
                  >
                    <KeyRound
                      className="
                        h-3.5 w-3.5
                        text-success
                      "
                    />
                    One-Time Passcode Expiry
                  </span>

                  <span
                    className="
                      text-[11px] font-semibold
                      text-success
                    "
                  >
                    10 Mins
                  </span>
                </div>
              </div>

              {/* Status */}
              <div
                className="
                  mt-4 flex items-center justify-between
                  border-t border-border-subtle
                  pt-3
                "
              >
                <div>
                  <span
                    className="
                      text-[10px] uppercase
                      tracking-wider text-muted
                    "
                  >
                    Security Standard
                  </span>

                  <p
                    className="
                      text-lg font-bold
                      tracking-tight
                      text-text-primary
                    "
                  >
                    Zero-Trust
                  </p>
                </div>

                <div
                  className="
                    flex items-center gap-1.5
                    rounded border border-success/30
                    bg-success/10
                    px-2.5 py-1
                    text-[11px] font-semibold
                    text-success
                  "
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Protected
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="
              relative z-10 flex
              items-center justify-between
              text-xs text-muted
            "
          >
            <span>SOC2 Type II Certified</span>
            <span>AI-powered Code Reviews</span>
          </div>
        </div>

        {/* Right Section */}
        <div
          className="
            flex flex-col justify-center
            bg-card p-8
            lg:col-span-6 lg:p-12
          "
        >
          <div className="mx-auto w-full max-w-md">
            {step === "email" ? (
              <div>
                <div className="mb-6">
                  <h2
                    className="
                      text-2xl font-bold
                      tracking-tight
                      text-text-primary
                    "
                  >
                    Forgot your password?
                  </h2>

                  <p className="mt-1 text-sm text-muted">
                    Enter your email address and we'll send you a 6-digit
                    verification code.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit(onEmailSubmit)}
                  className="space-y-4"
                >
                  {/* Email */}
                  <div>
                    <label
                      className="
                        mb-1.5 block text-xs
                        font-medium
                        text-text-secondary
                      "
                    >
                      Work Email
                    </label>

                    <div className="relative">
                      <Mail
                        className="
                          pointer-events-none absolute
                          left-3.5 top-1/2
                          h-4 w-4
                          -translate-y-1/2
                          text-muted
                        "
                      />

                      <input
                        type="email"
                        {...register("email")}
                        placeholder="you@example.com"
                        className={`
                          w-full rounded-xl
                          border bg-surface
                          py-2.5 pl-10 pr-4
                          text-sm
                          text-text-primary
                          outline-none
                          transition-colors
                          placeholder:text-text-disabled
                          focus:ring-1
                          ${
                            errors.email
                              ? "border-error focus:border-error focus:ring-error/30"
                              : "border-border focus:border-primary focus:ring-primary/30"
                          }
                        `}
                      />
                    </div>

                    {errors.email && (
                      <p
                        className="
                          mt-1.5 text-xs
                          text-error
                        "
                      >
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Button */}
                  <button
                    type="submit"
                    disabled={isForgotPasswordOTPLoading}
                    className="
                      mt-2 flex w-full
                      cursor-pointer
                      items-center justify-center
                      gap-2 rounded-xl
                      bg-primary py-2.5
                      text-sm font-semibold
                      text-primary-foreground
                      shadow-brand
                      transition-colors
                      hover:bg-primary-hover
                      active:bg-primary-active
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {isForgotPasswordOTPLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Sending OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>Send OTP</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                <div
                  className="
                    mt-8 border-t
                    border-border-subtle
                    pt-6 text-center
                  "
                >
                  <Link
                    to="/v1/auth/login"
                    className="
                      group inline-flex
                      items-center gap-2
                      text-xs font-medium
                      text-muted
                      transition-colors
                      hover:text-text-primary
                    "
                  >
                    <ArrowLeft
                      className="
                        h-3.5 w-3.5
                        transition-transform
                        group-hover:-translate-x-1
                      "
                    />

                    <span>Back to Sign In</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h2
                    className="
                      text-2xl font-bold
                      tracking-tight
                      text-text-primary
                    "
                  >
                    Verify your email
                  </h2>

                  <p className="mt-1 text-sm text-muted">
                    We've sent a 6-digit verification code to your email
                    address.
                  </p>
                </div>

                <form onSubmit={onOtpVerify} className="space-y-4">
                  <div
                    className="
                      flex items-center justify-between
                      pb-1 text-xs
                    "
                  >
                    <span className="text-text-secondary">
                      Code sent to{" "}
                      <span
                        className="
                          font-medium
                          text-text-primary
                        "
                      >
                        {getMaskedEmail(targetEmail)}
                      </span>
                    </span>

                    <button
                      type="button"
                      onClick={handleChangeEmail}
                      className="
                        flex cursor-pointer
                        items-center gap-1
                        font-medium
                        text-primary
                        transition-colors
                        hover:text-primary-hover
                        hover:underline
                      "
                    >
                      <Edit3 className="h-3 w-3" />
                      Change email
                    </button>
                  </div>

                  {/* OTP */}
                  <div
                    className="
                      flex justify-between gap-2
                    "
                    onPaste={handleOtpPaste}
                  >
                    {otpValues.map((value, index) => (
                      <input
                        key={index}
                        ref={(element) => {
                          otpInputRefs.current[index] = element;
                        }}
                        type="text"
                        maxLength={1}
                        inputMode="numeric"
                        value={value}
                        onChange={(event) =>
                          handleOtpChange(index, event.target.value)
                        }
                        onKeyDown={(event) => handleOtpKeyDown(index, event)}
                        className={`
                          h-12 w-12
                          rounded-xl border
                          bg-surface
                          text-center text-lg
                          font-bold
                          text-text-primary
                          outline-none
                          transition-colors
                          focus:ring-1
                          ${
                            otpError
                              ? "border-error focus:border-error focus:ring-error/30"
                              : "border-border focus:border-primary focus:ring-primary/30"
                          }
                        `}
                      />
                    ))}
                  </div>

                  {otpError && (
                    <p className="text-left text-xs text-error">{otpError}</p>
                  )}

                  {resendSuccessMsg && !otpError && (
                    <p
                      className="
                        flex items-center gap-1
                        text-xs text-success
                      "
                    >
                      <MailCheck className="h-3.5 w-3.5" />

                      {resendSuccessMsg}
                    </p>
                  )}

                  {/* Resend */}
                  <div
                    className="
                      flex items-center justify-between
                      pt-1 text-xs text-muted
                    "
                  >
                    <span>Didn't receive the code?</span>

                    {isCountingDown ? (
                      <span
                        className="
                          font-mono text-muted
                        "
                      >
                        Resend in {countdown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isForgotPasswordOTPLoading}
                        className="
                          flex cursor-pointer
                          items-center gap-1
                          font-medium
                          text-primary
                          hover:underline
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        <RefreshCw className="h-3 w-3" />
                        Resend OTP
                      </button>
                    )}
                  </div>

                  {/* Verify */}
                  <button
                    type="submit"
                    disabled={isVerifyForgotPasswordOTPLoading}
                    className="
                      mt-2 flex w-full
                      cursor-pointer
                      items-center justify-center
                      gap-2 rounded-xl
                      bg-primary py-2.5
                      text-sm font-semibold
                      text-primary-foreground
                      shadow-brand
                      transition-colors
                      hover:bg-primary-hover
                      active:bg-primary-active
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {isVerifyForgotPasswordOTPLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify OTP</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                <div
                  className="
                    mt-8 border-t
                    border-border-subtle
                    pt-6 text-center
                  "
                >
                  <button
                    type="button"
                    onClick={handleChangeEmail}
                    className="
                      group inline-flex
                      cursor-pointer
                      items-center gap-2
                      text-xs font-medium
                      text-muted
                      transition-colors
                      hover:text-text-primary
                    "
                  >
                    <ArrowLeft
                      className="
                        h-3.5 w-3.5
                        transition-transform
                        group-hover:-translate-x-1
                      "
                    />

                    <span>Change email address</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
