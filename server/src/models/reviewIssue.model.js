import mongoose from "mongoose";
import {
  REVIEW_ISSUE_CATEGORIES,
  REVIEW_ISSUE_SEVERITIES,
} from "../constants/review.constants.js";

const reviewIssueSchema = new mongoose.Schema(
  {
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
      required: true,
      index: true,
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    category: {
      type: String,
      enum: REVIEW_ISSUE_CATEGORIES,
      required: true,
    },

    severity: {
      type: String,
      enum: REVIEW_ISSUE_SEVERITIES,
      required: true,
    },

    status: {
      type: String,
      enum: ["OPEN", "RESOLVED", "DISMISSED"],
      default: "OPEN",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    recommendation: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      filePath: {
        type: String,
        required: true,
        trim: true,
      },

      lineStart: {
        type: Number,
        default: null,
        min: 1,
      },

      lineEnd: {
        type: Number,
        default: null,
        min: 1,
      },

      symbol: {
        type: String,
        default: null,
        trim: true,
      },
    },

    codeSnippet: {
      type: String,
      default: null,
    },

    ruleId: {
      type: String,
      default: null,
      trim: true,
    },

    fingerprint: {
      type: String,
      required: true,
      trim: true,
    },

    confidence: {
      type: Number,
      default: null,
      min: 0,
      max: 1,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    dismissedAt: {
      type: Date,
      default: null,
    },

    schemaVersion: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
  },
);

reviewIssueSchema.index({
  reviewId: 1,
  status: 1,
  severity: 1,
});

reviewIssueSchema.index({
  projectId: 1,
  fingerprint: 1,
});

reviewIssueSchema.index(
  {
    reviewId: 1,
    fingerprint: 1,
  },
  {
    unique: true,
  },
);

const ReviewIssue =
  mongoose.models.ReviewIssue ||
  mongoose.model("ReviewIssue", reviewIssueSchema);

export default ReviewIssue;
