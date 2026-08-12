import { email, z } from "zod";

export const registerSchema = z.object({
    fullname: z
        .string()
        .trim()
        .min(3, "Fullname must be at least 3 characters")
        .max(50, "Fullname cannot exceed 50 characters"),

    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Please provide a valid email"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(15, "Password cannot exceed 15 characters")
        .regex(
            /[A-Z]/,
            "Password must contain at least one uppercase letter"
        )
        .regex(
            /[a-z]/,
            "Password must contain at least one lowercase letter"
        )
        .regex(
            /[0-9]/,
            "Password must contain at least one number"
        )
        .regex(
            /[!@#$%^&*]/,
            "Password must contain at least one special character"
        ),
});


export const verifyEmailOTPSchema = z.object({
    userId: z
        .string()
        .min(1, "User ID is required"),

    otp: z
        .string()
        .regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export const resendVerificationOTPSchema = z.object({
    userId: z
        .string()
        .min(1, "User ID is required"),
});

export const loginPasswordSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Please provide a valid email"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(15, "Password cannot exceed 15 characters"),
});

export const sendLoginOTPSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Please provide a valid email"),
});

export const verifyLoginOTPSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Please provide a valid email"),

    otp: z
        .string()
        .regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Please provide a valid email"),
});

export const verifyResetOTPSchema = z.object({
    userId: z
        .string()
        .min(1, "User ID is required"),

    otp: z
        .string()
        .regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export const resetPasswordSchema = z.object({
    resetToken: z
        .string()
        .min(1, "Reset token is required"),

    newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(15, "Password cannot exceed 15 characters")
        .regex(
            /[A-Z]/,
            "Password must contain at least one uppercase letter"
        )
        .regex(
            /[a-z]/,
            "Password must contain at least one lowercase letter"
        )
        .regex(
            /[0-9]/,
            "Password must contain at least one number"
        )
        .regex(
            /[!@#$%^&*]/,
            "Password must contain at least one special character"
        ),
});