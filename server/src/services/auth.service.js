import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from '../models/user.model.js'
import BlacklistedToken from "../models/blacklisted-token.model.js";
import PasswordResetToken from "../models/password-reset-token.model.js";
import ApiError from '../utils/ApiError.js'
import Session from "../models/session.model.js";
import UserPreference from "../models/user-preference.model.js";
import {
    hashToken,
    generateRandomToken,
} from "../utils/token.js";

import { createOTP, verifyOTP } from './otp.service.js'
import { sendVerificationOTP, sendLoginOTP as sendLoginOTPEmail, sendPasswordResetOTP } from './email.service.js'

export const registerUser = async ({
    fullname,
    email,
    password,
}) => {
    const existingUser = await User.findOne({ email, })
    if (existingUser) {
        if (existingUser.isVerified) {
            throw new ApiError(
                409,
                "User with this email already exists"
            );
        }

        const otp = await createOTP(
            existingUser._id,
            "VERIFY_EMAIL"
        );

        await sendVerificationOTP(
            existingUser.email,
            otp,
            existingUser.fullname
        );

        return {
            data: {
                userId: existingUser._id,
                email: existingUser.email,
                isVerified: false,
            },
            message: "Verification OTP sent successfully",
        };
    }

    const user = await User.create({
        fullname, email, password,
    })

    const otp = await createOTP(
        user._id,
        "VERIFY_EMAIL"
    );

    await sendVerificationOTP(
        user.email,
        otp,
        user.fullname
    )

    return {
        data: {
            userId: user._id,
            email: user.email,
            isVerified: user.isVerified
        },
        message: "User registered successfully. Verification OTP sent to email."
    }
};

export const verifyEmailOTP = async (userId, otp) => {
    const user = await User.findById(userId)

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    if (user.isVerified) {
        throw new ApiError(400, "Email is already verified")
    }

    await verifyOTP(
        user._id,
        otp,
        "VERIFY_EMAIL"
    )

    user.isVerified = true

    await user.save()

    return {
        userId: user._id,
        email: user.email,
        isVerified: user.isVerified
    }
}

export const resendVerificationOTP = async (userId) => {
    const user = await User.findById(userId)

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.isVerified) {
        throw new ApiError(400, "Email is already verified");
    }

    const otp = await createOTP(
        userId,
        "VERIFY_EMAIL"
    )

    await sendVerificationOTP(
        user.email,
        otp,
        user.fullname
    )

    return {
        userId: user._id,
        email: user.email,
        message: "Verification OTP has been resent to your email."
    }
}

export const loginWithPassword = async ({ email, password }) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(401, "Invalid email or password")
    }

    if (!user.isVerified) {
        throw new ApiError(403, "Please verify your email before logging in")
    }

    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password")
    }

    const accessToken = user.generateAccessToken()
    const refreshToken = generateRandomToken(64)

    const refreshTokenHash = hashToken(refreshToken)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await Session.deleteMany({ userId: user._id })

    await Session.create({ userId: user._id, refreshTokenHash, expiresAt })

    user.lastLoginAt = new Date()

    await user.save();

    return {
        user: {
            id: user._id,
            fullname: user.fullname,
            email: user.email,
            username: user.username,
            avatar: user.avatar,
            isVerified: user.isVerified,
            isOnboarded: user.isOnboarded,
        },
        accessToken,
        refreshToken,
    }
}

export const sendLoginOTP = async (email) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(401, "Invalid email")
    }

    if (!user.isVerified) {
        throw new ApiError(
            403,
            "Please verify your email before logging in"
        );
    }

    const otp = await createOTP(user._id, "LOGIN")

    await sendLoginOTPEmail(
        user.email,
        otp,
        user.fullname
    )

    return {
        userId: user._id,
        email: user.email,
        message: "Login OTP send successfully"
    }
}

export const verifyLoginOTP = async ({ email, otp }) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(
            401,
            "Invalid email or OTP"
        );
    }

    if (!user.isVerified) {
        throw new ApiError(
            403,
            "Please verify your email before logging in"
        );
    }

    await verifyOTP(
        user._id,
        otp,
        "LOGIN"
    );

    // Generate access token
    const accessToken =
        user.generateAccessToken();

    // Generate random refresh token
    const refreshToken =
        generateRandomToken(64);

    // Hash refresh token before storing
    const refreshTokenHash =
        hashToken(refreshToken);

    // 7 days
    const expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    // Remove previous session
    await Session.deleteMany({
        userId: user._id,
    });

    // Create new session
    await Session.create({
        userId: user._id,
        refreshTokenHash,
        expiresAt,
    });

    user.lastLoginAt = new Date();

    await user.save();

    return {
        user: {
            id: user._id,
            fullname: user.fullname,
            email: user.email,
            username: user.username,
            avatar: user.avatar,
            isVerified: user.isVerified,
            isOnboarded: user.isOnboarded,
        },
        accessToken,
        refreshToken,
    };
};

export const forgotPassword = async (email) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(401, "Invalid email")
    }

    if (!user.isVerified) {
        throw new ApiError(403, "Please verify your email before resetting your password")
    }

    const otp = await createOTP(user._id, "RESET_PASSWORD")

    await sendPasswordResetOTP(user.email, otp, user.fullname)

    return {
        userId: user._id,
        email: user.email,
        message: "Password reset OTP send successfully"
    }
}

export const verifyResetOTP = async (userId, otp) => {
    const user = await User.findById(userId)

    if (!user) {
        throw new ApiError(401, "User not found")
    }

    if (!user.isVerified) {
        throw new ApiError(403, "Please verify your email before resetting your password")
    }

    await verifyOTP(user._id, otp, "RESET_PASSWORD")

    await PasswordResetToken.deleteMany({ userId: user._id })

    const resetToken = crypto.randomBytes(32).toString("hex")

    const tokenHash = crypto.createHash("sha256").update(resetToken).digest('hex')

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await PasswordResetToken.create({
        userId: user._id,
        tokenHash,
        expiresAt
    })

    return {
        resetToken,
        message: "OTP verified successfully"
    }

}

export const resetPassword = async ({ resetToken, newPassword }) => {
    if (!resetToken) {
        throw new ApiError(400, "Reset token is required")
    }

    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex')

    const resetTokenRecord = await PasswordResetToken.findOne({ tokenHash })

    if (!resetTokenRecord) {
        throw new ApiError(400, "Invalid or expired reset token")
    }

    if (resetTokenRecord.expiresAt < new Date()) {
        await resetTokenRecord.deleteOne();

        throw new ApiError(
            400,
            "Reset token has expired"
        );
    }

    const user = await User.findById(resetTokenRecord.userId)

    if (!user) {
        await resetTokenRecord.deleteOne();

        throw new ApiError(
            404,
            "User not found"
        );
    }

    const isSamePassword = await user.comparePassword(newPassword)
    if (isSamePassword) {
        throw new ApiError(400, "New Password cannot be same as Old Password.")
    }

    user.password = newPassword

    user.refreshToken = null

    await user.save()

    await resetTokenRecord.deleteOne()

    return {
        message: "Password reset successfully"
    }
}

export const refreshToken = async (refreshTokenValue) => {
    if (!refreshTokenValue) {
        throw new ApiError(
            401,
            "Refresh token is required"
        );
    }

    const refreshTokenHash = hashToken(
        refreshTokenValue
    );

    const session = await Session.findOne({
        refreshTokenHash,
    });

    if (!session) {
        throw new ApiError(
            401,
            "Invalid refresh token"
        );
    }

    if (session.revokedAt) {
        throw new ApiError(
            401,
            "Refresh token has been revoked"
        );
    }

    if (session.expiresAt < new Date()) {
        await session.deleteOne();

        throw new ApiError(
            401,
            "Refresh token has expired"
        );
    }

    const user = await User.findById(
        session.userId
    );

    if (!user) {
        await session.deleteOne();

        throw new ApiError(
            401,
            "Invalid refresh token"
        );
    }

    const newAccessToken =
        user.generateAccessToken();

    return {
        accessToken: newAccessToken,
    };
};

export const logoutUser = async ({
    userId,
    refreshTokenValue,
    accessTokenJti,
    accessTokenExp,
}) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Revoke refresh token/session
    if (refreshTokenValue) {
        const refreshTokenHash =
            hashToken(refreshTokenValue);

        await Session.updateOne(
            {
                userId: user._id,
                refreshTokenHash,
                revokedAt: null,
            },
            {
                $set: {
                    revokedAt: new Date(),
                },
            }
        );
    }

    // Revoke access token
    if (accessTokenJti && accessTokenExp) {
        await BlacklistedToken.create({
            jti: accessTokenJti,
            expiresAt: new Date(
                accessTokenExp * 1000
            ),
        });
    }

    return {
        message: "Logged out successfully",
    };
};

export const getCurrentUser = async (userId) => {
    const user = await User.findById(userId).select(
        "-password -refreshToken -__v"
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const preferences = await UserPreference.findOne({
        userId: user._id,
    }).select(
        "-_id -userId -createdAt -updatedAt"
    );

    return {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        isVerified: user.isVerified,
        isOnboarded: user.isOnboarded,

        onboarding: preferences
            ? {
                purposes: preferences.purposes,
                experienceLevel:
                    preferences.experienceLevel,
                referralSource:
                    preferences.referralSource,
            }
            : null,

        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};