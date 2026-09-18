import mongoose from "mongoose";

const scoresSchema = new mongoose.Schema(
  {
    overall: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    security: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    performance: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    maintainability: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    reliability: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
  },
  {
    _id: false,
  },
);

const issueCountSchema = new mongoose.Schema(
  {
    total: {
      type: Number,
      min: 0,
      default: 0,
    },
    critical: {
      type: Number,
      min: 0,
      default: 0,
    },
    high: {
      type: Number,
      min: 0,
      default: 0,
    },
    medium: {
      type: Number,
      min: 0,
      default: 0,
    },
    low: {
      type: Number,
      min: 0,
      default: 0,
    },
    info: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    _id: false,
  },
);

const executionSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ["OPENAI", "ANTHROPIC", "GOOGLE"],
      default: null,
    },
    model: {
      type: String,
      default: null,
    },
    promptVersion: {
      type: String,
      default: null,
    },
    attempts: {
      type: Number,
      min: 0,
      default: 0,
    },
    latencyMs: {
      type: Number,
      min: 0,
      default: null,
    },
    tokenUsage: {
      input: {
        type: Number,
        min: 0,
        default: 0,
      },
      output: {
        type: Number,
        min: 0,
        default: 0,
      },
      total: {
        type: Number,
        min: 0,
        default: 0,
      },
    },
    estimatedCostUsdMicros: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    _id: false,
  },
);

const failureSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      default: null,
    },
    message: {
      type: String,
      maxLength: 500,
      default: null,
    },
    retryable: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  },
);

const progressSchema = new mongoose.Schema(
  {
    totalChunks: {
      type: Number,
      min: 0,
      default: 0,
    },

    completedChunks: {
      type: Number,
      min: 0,
      default: 0,
    },

    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  {
    _id: false,
  },
);

const reviewSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    snapshotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CodeSnapshot",
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["QUEUED", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"],
      required: true,
      default: "QUEUED",
    },
    reviewType: {
      type: String,
      enum: ["FULL", "SECURITY", "PERFORMANCE", "MAINTAINABILITY"],
      default: "FULL",
    },
    routingMode: {
      type: String,
      enum: ["AUTO", "FAST", "BALANCED", "QUALITY", "MANUAL"],
      default: "AUTO",
    },
    requestedProvider: {
      type: String,
      enum: ["OPENAI", "ANTHROPIC", "GOOGLE"],
      default: null,
    },
    requestedModel: {
      type: String,
      default: null,
    },
    summary: {
      type: String,
      maxlength: 10000,
      default: null,
    },
    scores: {
      type: scoresSchema,
      default: () => ({}),
    },
    issueCounts: {
      type: issueCountSchema,
      default: () => ({}),
    },
    execution: {
      type: executionSchema,
      default: () => ({}),
    },
    failure: {
      type: failureSchema,
      default: () => ({}),
    },
    progress: {
      type: progressSchema,
      default: () => ({}),
    },
    schemaVersion: {
      type: Number,
      default: 1,
    },
    queuedAt: {
      type: Date,
      default: Date.now,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    failedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

reviewSchema.index({
  ownerId: 1,
  projectId: 1,
  createdAt: -1,
  _id: -1,
});

reviewSchema.index({
  ownerId: 1,
  status: 1,
  createdAt: -1,
  _id: -1,
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
