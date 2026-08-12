import mongoose from 'mongoose'

const otpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    otpHash: {
        type: String,
        required: true,
    },
    purpose: {
        type: String,
        enum: ["VERIFY_EMAIL", "LOGIN", "RESET_PASSWORD"],
        required: true
    },
    attempts: {
        type: Number,
        required: true,
        default: 0,
    },
    expiresAt: {
        type: Date,
        required: true
    }

}, { timestamps: true })

otpSchema.index(
    {
        expiresAt: 1
    },
    {
        expireAfterSeconds: 0
    }
)

otpSchema.index({
    userId: 1, purpose: 1
})

const OTP = mongoose.model("OTP", otpSchema)

export default OTP