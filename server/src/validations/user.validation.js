import { z } from "zod";

export const updateProfileSchema = z
  .object({
    fullname: z
      .string()
      .trim()
      .min(3, "Full name must be at least 3 characters.")
      .max(50, "Full name must be at most 50 characters.")
      .optional(),

    username: z
      .string()
      .trim()
      .min(5, "Username must be at least 5 characters.")
      .max(30, "Username must be at most 30 characters.")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can contain only letters, numbers, and underscores.",
      )
      .optional(),

    experienceLevel: z
      .enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "PROFESSIONAL"])
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one profile field is required.",
  });

export const usernameAvailabilitySchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(5, "Username must be at least 5 characters.")
      .max(30, "Username must be at most 30 characters.")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can contain only letters, numbers, and underscores.",
      ),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),

    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters."),

    confirmPassword: z.string().min(1, "Confirm password is required."),
  })
  .strict()
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password do not match.",
    path: ["confirmPassword"],
  });
