import mongoose from "mongoose";

const userPreferenceSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        purposes: {
            type: [String],
            enum: [
                "CODE_QUALITY",
                "BUG_DETECTION",
                "LEARNING",
                "PERSONAL_PROJECTS",
                "TEAM_PROJECTS",
                "OTHER",
            ],
            default: [],
        },

        experienceLevel: {
            type: String,
            enum: [
                "BEGINNER",
                "INTERMEDIATE",
                "ADVANCED",
                "PROFESSIONAL",
            ],
            default: null,
        },

        referralSource: {
            type: String,
            enum: [
                "GOOGLE",
                "LINKEDIN",
                "GITHUB",
                "YOUTUBE",
                "FRIEND_COLLEAGUE",
                "COMMUNITY_DISCORD",
                "OTHER",
            ],
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const UserPreference = mongoose.model(
    "UserPreference",
    userPreferenceSchema
);

export default UserPreference;