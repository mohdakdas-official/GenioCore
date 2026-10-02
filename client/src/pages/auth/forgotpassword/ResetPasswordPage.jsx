import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  LockKeyhole,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import { resetPasswordSchema } from "../../../validation/auth.validation";
import PageMeta from "../../../components/PageMeta";

function RequirementCheckItem({ satisfied, label }) {
  return (
    <div
      className="
        flex items-center gap-2
        text-xs
        transition-colors duration-150
      "
    >
      {satisfied ? (
        <CheckCircle2
          className="
            h-3.5 w-3.5 shrink-0
            text-success
          "
        />
      ) : (
        <Circle
          className="
            h-3.5 w-3.5 shrink-0
            text-text-disabled
          "
        />
      )}

      <span
        className={
          satisfied ? "font-medium text-text-secondary" : "text-text-disabled"
        }
      >
        {label}
      </span>
    </div>
  );
}

function PasswordStrengthBar({ passedCount }) {
  const getStrengthConfig = () => {
    if (passedCount === 0) {
      return {
        label: "Empty",
        color: "bg-transparent",
        text: "text-text-disabled",
      };
    }

    if (passedCount <= 2) {
      return {
        label: "Weak",
        color: "bg-error",
        text: "text-error",
      };
    }

    if (passedCount <= 4) {
      return {
        label: "Fair",
        color: "bg-warning",
        text: "text-warning",
      };
    }

    return {
      label: "Strong",
      color: "bg-success",
      text: "text-success",
    };
  };

  const strength = getStrengthConfig();

  return (
    <div className="space-y-1 pt-1">
      <div
        className="
          flex items-center justify-between
          text-[11px]
        "
      >
        <span className="text-muted">Security strength</span>

        <span className={`font-semibold ${strength.text}`}>
          {strength.label}
        </span>
      </div>

      <div
        className="
          grid h-1 w-full
          grid-cols-5 gap-1.5
          overflow-hidden
          rounded-full
          bg-surface
        "
      >
        {[1, 2, 3, 4, 5].map((index) => (
          <div
            key={index}
            className={`
              h-full transition-all duration-300
              ${index <= passedCount ? strength.color : "bg-border-subtle"}
            `}
          />
        ))}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleResetPassword, isResetPasswordLoading } = useAuth();
  const resetToken = location.state?.resetToken || "";

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSuccess, setIsSuccess] = useState(false);

  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const watchedPassword = watch("password", "");

  const watchedConfirmPassword = watch("confirmPassword", "");

  const criteria = useMemo(() => {
    return {
      hasLength: watchedPassword.length >= 8,

      hasLower: /[a-z]/.test(watchedPassword),

      hasUpper: /[A-Z]/.test(watchedPassword),

      hasNumber: /[0-9]/.test(watchedPassword),

      hasSpecial: /[^a-zA-Z0-9]/.test(watchedPassword),
    };
  }, [watchedPassword]);

  const passedCount = Object.values(criteria).filter(Boolean).length;

  const isAllPasswordCriteriaMet = passedCount === 5;

  const isPasswordsMatching =
    watchedPassword.length > 0 &&
    watchedConfirmPassword.length > 0 &&
    watchedPassword === watchedConfirmPassword;

  const onSubmit = async (data) => {
    try {
      setApiError("");

      const response = await handleResetPassword({
        resetToken,
        newPassword: data.password,
      });
      setIsSuccess(true);
    } catch (error) {
      setApiError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to reset password. Please try again.",
      );
    }
  };

  return (
    <>
      <PageMeta
        title="Reset Password — GenioCore"
        description="Create a new password and regain access to your GenioCore account."
      />
      <div
        className="
        relative flex min-h-screen w-full
        items-center justify-center
        overflow-hidden
        bg-background p-4
        font-sans text-foreground
        antialiased
        selection:bg-primary/30
        selection:text-primary
        sm:p-6 lg:p-8
      "
      >
        {/* Background Glow */}
        <div
          aria-hidden="true"
          className="
          pointer-events-none
          absolute -left-40 -top-40
          h-[500px] w-[500px]
          rounded-full
          bg-primary/10
          blur-[130px]
        "
        />

        <div
          aria-hidden="true"
          className="
          pointer-events-none
          absolute -bottom-40 -right-40
          h-[500px] w-[500px]
          rounded-full
          bg-info/10
          blur-[150px]
        "
        />

        {/* Card */}
        <div
          className="
          relative z-10 grid
          min-h-[640px] w-full
          max-w-5xl grid-cols-1
          overflow-hidden
          rounded-2xl
          border border-border
          bg-card/90
          shadow-2xl
          backdrop-blur-xl
          lg:grid-cols-12
        "
        >
          {/* Left */}
          <div
            className="
    relative flex flex-col
    justify-between
    overflow-hidden
    border-b border-border
    bg-surface p-8
    lg:col-span-6
    lg:border-b-0
    lg:border-r
    lg:p-12
  "
          >
            {/* Grid */}
            <div
              aria-hidden="true"
              className="
      pointer-events-none
      absolute inset-0
      bg-[linear-gradient(to_right,var(--border-subtle)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-subtle)_1px,transparent_1px)]
      bg-[size:24px_24px]
      opacity-40
    "
            />

            {/* Brand */}
            <div className="relative z-10">
              <div
                className="
        mb-6 inline-flex
        items-center gap-2
        rounded-full
        border border-primary/20
        bg-primary/10
        px-3 py-1.5
        text-xs font-medium
        text-primary
      "
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>GenioCore account recovery</span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-text-primary lg:text-4xl">
                GenioCore
              </h1>

              <p className="mt-2 text-base font-medium text-text-secondary">
                Create a new password.
              </p>

              <p className="mt-1 max-w-lg text-sm leading-relaxed text-muted">
                Complete the recovery process by setting a new password for your
                GenioCore account.
              </p>
            </div>

            {/* Reset Preview */}
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
                {/* Header */}
                <div className="mb-4 flex items-center justify-between border-b border-border-subtle pb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-error/80" />
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-warning/80" />
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-success/80" />
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-muted">
                    <Terminal className="h-3.5 w-3.5 text-primary" />
                    <span>password-reset</span>
                  </div>
                </div>

                {/* Code */}
                <div className="space-y-1 leading-relaxed text-muted">
                  <p>
                    <span className="text-info">const</span> result ={" "}
                    <span className="text-primary">await</span>{" "}
                    resetPassword(token);
                  </p>

                  <p className="text-text-disabled">
                    // recovery token required before password update
                  </p>
                </div>

                {/* Flow */}
                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface/60 px-3 py-2">
                    <span className="flex items-center gap-2 text-text-secondary">
                      <KeyRound className="h-3.5 w-3.5 text-primary" />
                      Recovery Verification
                    </span>

                    <span className="text-[10px] text-muted">Required</span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface/60 px-3 py-2">
                    <span className="flex items-center gap-2 text-text-secondary">
                      <LockKeyhole className="h-3.5 w-3.5 text-primary" />
                      New Password
                    </span>

                    <span className="text-[10px] text-muted">
                      8+ characters
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface/60 px-3 py-2">
                    <span className="flex items-center gap-2 text-text-secondary">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                      Password Confirmation
                    </span>

                    <span className="text-[10px] text-muted">
                      Match required
                    </span>
                  </div>
                </div>

                <div className="mt-5 border-t border-border-subtle pt-4">
                  <div className="mb-3 text-[10px] uppercase tracking-wider text-muted">
                    Reset flow
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[10px]">
                    <span className="rounded-md border border-border-subtle bg-surface px-2 py-1 text-text-secondary">
                      Verify
                    </span>

                    <span className="text-muted">→</span>

                    <span className="rounded-md border border-border-subtle bg-surface px-2 py-1 text-text-secondary">
                      New Password
                    </span>

                    <span className="text-muted">→</span>

                    <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-1 text-primary">
                      Sign In
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                Verified recovery flow
              </span>

              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                Password validation
              </span>
            </div>
          </div>

          {/* Right */}
          <div
            className="
            flex flex-col
            justify-center
            bg-card p-8
            lg:col-span-6
            lg:p-12
          "
          >
            <div className="mx-auto w-full max-w-md">
              {isSuccess ? (
                /* Success */
                <div className="py-4 text-center">
                  <div
                    className="
                    mx-auto mb-5 flex
                    h-14 w-14
                    items-center justify-center
                    rounded-2xl
                    border border-success/20
                    bg-success/10
                    text-success
                  "
                  >
                    <CheckCircle2 className="h-7 w-7" />
                  </div>

                  <h2
                    className="
                    text-2xl font-bold
                    tracking-tight
                    text-text-primary
                  "
                  >
                    Password reset successfully
                  </h2>

                  <p
                    className="
                    mt-2 text-sm
                    leading-relaxed
                    text-muted
                  "
                  >
                    Your password has been updated. You can now sign in with
                    your new credentials.
                  </p>

                  <div className="mt-8">
                    <Link
                      to="/v1/auth/login"
                      className="
                      flex w-full
                      items-center justify-center
                      gap-2 rounded-xl
                      bg-primary py-2.5
                      text-sm font-semibold
                      text-primary-foreground
                      shadow-brand
                      transition-colors
                      hover:bg-primary-hover
                      active:bg-primary-active
                    "
                    >
                      <span>Sign In</span>

                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                /* Form */
                <div>
                  <div className="mb-6">
                    <h2
                      className="
                      text-2xl font-bold
                      tracking-tight
                      text-text-primary
                    "
                    >
                      Reset your password
                    </h2>

                    <p className="mt-1 text-sm text-muted">
                      Create a new password for your GenioCore account.
                    </p>
                  </div>

                  {apiError && (
                    <div
                      className="
                      mb-4 flex items-center
                      gap-2 rounded-xl
                      border border-error/20
                      bg-error/10
                      p-3 text-xs
                      text-error
                    "
                    >
                      <ShieldAlert className="h-4 w-4 shrink-0" />

                      <span>{apiError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Password */}
                    <div>
                      <label
                        className="
                        mb-1.5 block
                        text-xs font-medium
                        text-text-secondary
                      "
                      >
                        New Password
                      </label>

                      <div className="relative">
                        <Lock
                          className="
                          pointer-events-none
                          absolute left-3.5
                          top-1/2
                          h-4 w-4
                          -translate-y-1/2
                          text-muted
                        "
                        />

                        <input
                          type={showPassword ? "text" : "password"}
                          {...register("password")}
                          placeholder="Create a strong password"
                          className={`
                          w-full rounded-xl
                          border bg-surface
                          py-2.5 pl-10 pr-10
                          text-sm
                          text-text-primary
                          outline-none
                          transition-colors
                          placeholder:text-text-disabled
                          focus:ring-1
                          ${
                            errors.password
                              ? "border-error focus:border-error focus:ring-error/30"
                              : "border-border focus:border-primary focus:ring-primary/30"
                          }
                        `}
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="
                          absolute right-3.5
                          top-1/2
                          -translate-y-1/2
                          cursor-pointer
                          text-muted
                          transition-colors
                          hover:text-text-primary
                        "
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {errors.password && (
                        <p
                          className="
                          mt-1.5 text-xs
                          text-error
                        "
                        >
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    {/* Requirements */}
                    <div
                      className="
                      space-y-2.5
                      rounded-xl
                      border
                      border-border-subtle
                      bg-surface/80 p-3
                    "
                    >
                      <p
                        className="
                        text-[11px]
                        font-medium
                        text-muted
                      "
                      >
                        Password requirements
                      </p>

                      <div
                        className="
                        grid grid-cols-1
                        gap-2
                        sm:grid-cols-2
                      "
                      >
                        <RequirementCheckItem
                          satisfied={criteria.hasLength}
                          label="8+ characters"
                        />

                        <RequirementCheckItem
                          satisfied={criteria.hasLower}
                          label="One lowercase letter"
                        />

                        <RequirementCheckItem
                          satisfied={criteria.hasUpper}
                          label="One uppercase letter"
                        />

                        <RequirementCheckItem
                          satisfied={criteria.hasNumber}
                          label="One number"
                        />

                        <RequirementCheckItem
                          satisfied={criteria.hasSpecial}
                          label="One special character"
                        />
                      </div>

                      <PasswordStrengthBar passedCount={passedCount} />
                    </div>

                    {/* Confirm */}
                    <div>
                      <label
                        className="
                        mb-1.5 block
                        text-xs font-medium
                        text-text-secondary
                      "
                      >
                        Confirm Password
                      </label>

                      <div className="relative">
                        <Lock
                          className="
                          pointer-events-none
                          absolute left-3.5
                          top-1/2
                          h-4 w-4
                          -translate-y-1/2
                          text-muted
                        "
                        />

                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          {...register("confirmPassword")}
                          placeholder="Confirm your new password"
                          className={`
                          w-full rounded-xl
                          border bg-surface
                          py-2.5 pl-10 pr-10
                          text-sm
                          text-text-primary
                          outline-none
                          transition-colors
                          placeholder:text-text-disabled
                          focus:ring-1
                          ${
                            errors.confirmPassword
                              ? "border-error focus:border-error focus:ring-error/30"
                              : isPasswordsMatching
                                ? "border-success/60 focus:border-success focus:ring-success/30"
                                : "border-border focus:border-primary focus:ring-primary/30"
                          }
                        `}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword((prev) => !prev)
                          }
                          className="
                          absolute right-3.5
                          top-1/2
                          -translate-y-1/2
                          cursor-pointer
                          text-muted
                          transition-colors
                          hover:text-text-primary
                        "
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {errors.confirmPassword && (
                        <p
                          className="
                          mt-1.5 text-xs
                          text-error
                        "
                        >
                          {errors.confirmPassword.message}
                        </p>
                      )}

                      {isPasswordsMatching && !errors.confirmPassword && (
                        <p
                          className="
                            mt-1.5 flex
                            items-center gap-1
                            text-xs
                            text-success
                          "
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Passwords match
                        </p>
                      )}
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={
                        isResetPasswordLoading ||
                        !isAllPasswordCriteriaMet ||
                        !isPasswordsMatching
                      }
                      className="
                      mt-2 flex w-full
                      cursor-pointer
                      items-center
                      justify-center
                      gap-2 rounded-xl
                      bg-primary
                      py-2.5
                      text-sm font-semibold
                      text-primary-foreground
                      shadow-brand
                      transition-colors
                      hover:bg-primary-hover
                      active:bg-primary-active
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                      disabled:shadow-none
                    "
                    >
                      {isResetPasswordLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />

                          <span>Resetting password...</span>
                        </>
                      ) : (
                        <>
                          <span>Reset Password</span>

                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
