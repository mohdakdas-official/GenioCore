import mongoose from "mongoose";

const blacklistedTokenSchema = new mongoose.Schema(
    {
        jti: {
            type: String,
            required: true,
            unique: true,
        },

        expiresAt: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

blacklistedTokenSchema.index(
    {
        expiresAt: 1,
    },
    {
        expireAfterSeconds: 0,
    }
);

const BlacklistedToken = mongoose.model(
    "BlacklistedToken",
    blacklistedTokenSchema
);

export default BlacklistedToken;