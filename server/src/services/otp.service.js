import crypto from 'crypto';
import OTP from '../models/otp.model.js';
import ApiError from '../utils/ApiError.js';

/**
 * @description Generate a secure 6-digit OTP
 */

export const generateOTP = () => {
    return crypto.randomInt(100000, 1000000).toString()
}

/**
 * @description Hash the OTP using SHA-256
 */

export const hashOTP = (otp) => {
    return crypto.createHash("sha256").update(otp).digest('hex')
}

/**
 * @description Create and save OTP
 */
export const createOTP = async (userId, purpose) => {
    //Delete existing OTP for the same purpose
    await OTP.deleteMany({
        userId, purpose
    })

    // Generate OTP
    const otp = generateOTP()

    // Hash OTP
    const otpHash = hashOTP(otp)

    // Set expiry (5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    await OTP.create({
        userId,
        otpHash,
        purpose,
        expiresAt
    })

    return otp

}

/**
 * @description Verify OTP
 */
export const verifyOTP = async (userId, otp, purpose) => {
    const otpRecord = await OTP.findOne({
        userId,
        purpose,
        expiresAt: { $gt: new Date() },
    })

    if (!otpRecord) {
        throw new ApiError(400, "Invalid or Expired OTP");
    }

    if (otpRecord.expiresAt < new Date()) {
        await otpRecord.deleteOne();
        throw new ApiError(400, "OTP has expired");
    }


    const hashedOTP = hashOTP(otp)

    if (hashedOTP !== otpRecord.otpHash) {
        otpRecord.attempts += 1;

        if (otpRecord.attempts >= Number(process.env.OTP_MAX_ATTEMPTS)) {
            await otpRecord.deleteOne()
            throw new ApiError(429, "You have exceeded the maximum number of attempts allowed for this OTP. Please request a new code.")
        }

        await otpRecord.save()

        throw new ApiError(400, "Invalid OTP")
    }

    await otpRecord.deleteOne()

    return true
}