import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["REVIEW_COMPLETED", "REVIEW_FAILED", "SECURITY_ALERT"],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    severity: {
      type: String,
      enum: ["NORMAL", "HIGH", "CRITICAL"],
      default: "NORMAL",
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },

    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },

    dismissedAt: {
      type: Date,
      default: null,
      index: true,
    },

    /**
     * Prevent duplicate notifications
     * if worker/job executes again.
     */
    dedupeKey: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index(
  {
    ownerId: 1,
    dedupeKey: 1,
  },
  {
    unique: true,
  },
);

notificationSchema.index({
  ownerId: 1,
  dismissedAt: 1,
  createdAt: -1,
});

export const Notification = mongoose.model("Notification", notificationSchema);
