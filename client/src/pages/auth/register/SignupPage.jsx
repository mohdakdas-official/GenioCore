import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Mail,
  Lock,
  CheckCircle2,
  ArrowRight,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import { signupSchema } from "../../../validation/auth.validation";

import FormField from "../../../components/auth/register/FormField";
import BrandingPanel from "../../../components/auth/register/BrandingPanel";
import {
  PasswordRequirementItem,
  PasswordStrengthBar,
} from "../../../components/auth/register/PasswordSecurity";

export default function SignupPage() {
  const navigate = useNavigate();
  const { handleRegisterUser, isRegisterUserLoading } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const watchedPassword = watch("password", "");
  const watchedConfirmPassword = watch("confirmPassword", "");

  const criteria = useMemo(
    () => ({
      hasLength: watchedPassword.length >= 8,
      hasLower: /[a-z]/.test(watchedPassword),
      hasUpper: /[A-Z]/.test(watchedPassword),
      hasNumber: /[0-9]/.test(watchedPassword),
      hasSpecial: /[^a-zA-Z0-9]/.test(watchedPassword),
    }),
    [watchedPassword],
  );

  const passedCount = Object.values(criteria).filter(Boolean).length;
  const isAllPasswordCriteriaMet = passedCount === 5;
  const isPasswordsMatching =
    watchedPassword.length > 0 &&
    watchedConfirmPassword.length > 0 &&
    watchedPassword === watchedConfirmPassword;

  const onSubmit = async (data) => {
    try {
      const response = await handleRegisterUser({
        fullname: data.fullName,
        email: data.email,
        password: data.password,
      });

      navigate("/v1/auth/verify-email", {
        state: {
          userId: response.data.userId,
          email: response.data.email,
          isVerified: response.data.isVerified,
        },
      });
    } catch (error) {
      console.error(
        error?.response?.data?.message || error?.message || "Signup failed",
      );
    }
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans antialiased relative overflow-hidden selection:bg-primary/20 selection:text-primary">
      {/* Dynamic Ambient Background Glows */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[130px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-info/10 blur-[150px]"
        aria-hidden="true"
      />

      {/* Main Authentication Card */}
      <div className="relative z-10 w-full max-w-5xl rounded-2xl border border-border bg-card/90 backdrop-blur-xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[700px]">
        {/* Left Branding View */}
        <BrandingPanel />

        {/* Right Form View */}
        <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-center bg-card">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-text-primary tracking-tight">
                Create your account
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                Start your journey with AI-powered code reviews.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                label="Full Name"
                name="fullName"
                placeholder="Enter your full name"
                icon={User}
                register={register}
                error={errors.fullName}
              />

              <FormField
                label="Work Email"
                name="email"
                type="email"
                placeholder="you@example.com"
                icon={Mail}
                register={register}
                error={errors.email}
              />

              <FormField
                label="Password"
                name="password"
                type="password"
                placeholder="Create a strong password"
                icon={Lock}
                register={register}
                error={errors.password}
              />

              {/* Password Checklist & Strength */}
              <div className="p-3 bg-surface/60 border border-border-subtle rounded-xl space-y-2.5">
                <p className="text-[11px] font-medium text-text-secondary">
                  Password requirements
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <PasswordRequirementItem
                    satisfied={criteria.hasLength}
                    label="8+ characters"
                  />
                  <PasswordRequirementItem
                    satisfied={criteria.hasLower}
                    label="One lowercase letter"
                  />
                  <PasswordRequirementItem
                    satisfied={criteria.hasUpper}
                    label="One uppercase letter"
                  />
                  <PasswordRequirementItem
                    satisfied={criteria.hasNumber}
                    label="One number"
                  />
                  <PasswordRequirementItem
                    satisfied={criteria.hasSpecial}
                    label="One special character"
                  />
                </div>
                <PasswordStrengthBar passedCount={passedCount} />
              </div>

              <div className="space-y-1">
                <FormField
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  icon={Lock}
                  register={register}
                  error={errors.confirmPassword}
                  isMatchValid={isPasswordsMatching && !errors.confirmPassword}
                />
                {isPasswordsMatching && !errors.confirmPassword && (
                  <p className="text-xs text-success flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                  </p>
                )}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={
                  isRegisterUserLoading ||
                  !isAllPasswordCriteriaMet ||
                  !isPasswordsMatching
                }
                className="cursor-pointer w-full mt-2 bg-primary hover:bg-primary-hover active:bg-primary-active text-primary-foreground font-semibold py-2.5 rounded-xl transition duration-150 flex items-center justify-center gap-2 text-sm shadow-brand disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {isRegisterUserLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-border-subtle text-center text-xs text-text-secondary">
              Already have an account?{" "}
              <Link
                to="/v1/auth/login"
                className="text-primary font-semibold hover:underline"
              >
                Sign in
              </Link>
            </div>

            <div className="mt-8 text-center">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-xs font-medium text-muted hover:text-text-primary transition group"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-muted group-hover:-translate-x-1 transition-transform" />
                <span>Back to home</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
