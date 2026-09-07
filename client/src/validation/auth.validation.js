import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address"),

  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, { message: "Full name must be at least 2 characters." }),
    email: z
      .string()
      .trim()
      .min(1, { message: "Email address is required." })
      .email({ message: "Please enter a valid email address." }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .regex(/[a-z]/, { message: "Requires at least one lowercase letter." })
      .regex(/[A-Z]/, { message: "Requires at least one uppercase letter." })
      .regex(/[0-9]/, { message: "Requires at least one number." })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Requires at least one special character.",
      }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password." }),
  })
  .superRefine((data, ctx) => {
    if (
      data.password &&
      data.confirmPassword &&
      data.password !== data.confirmPassword
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      });
    }
  });

export const verifyEmailOTPSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "Please enter a valid 6-digit OTP"),
});

export const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email address is required." })
    .email({ message: "Please enter a valid email address." }),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, {
        message: "Password must be at least 8 characters.",
      })
      .regex(/[a-z]/, {
        message: "Requires at least one lowercase letter.",
      })
      .regex(/[A-Z]/, {
        message: "Requires at least one uppercase letter.",
      })
      .regex(/[0-9]/, {
        message: "Requires at least one number.",
      })
      .regex(/[^a-zA-Z0-9]/, {
        message: "Requires at least one special character.",
      }),

    confirmPassword: z.string().min(1, {
      message: "Please confirm your new password.",
    }),
  })
  .superRefine((data, ctx) => {
    if (
      data.password &&
      data.confirmPassword &&
      data.password !== data.confirmPassword
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      });
    }
  });
