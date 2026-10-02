import mongoose from "mongoose";

const reviewChunkSchema = new mongoose.Schema(
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
      index: true,
    },

    chunkIndex: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["PROCESSING", "COMPLETED", "FAILED"],
      required: true,
    },

    /*
     * Already passed through reviewOutputSchema
     * before being persisted.
     */
    output: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    metadata: {
      provider: {
        type: String,
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

      inputTokens: {
        type: Number,
        default: 0,
      },

      outputTokens: {
        type: Number,
        default: 0,
      },

      latencyMs: {
        type: Number,
        default: 0,
      },

      estimatedCostUsdMicros: {
        type: Number,
        default: 0,
      },
    },

    failure: {
      code: {
        type: String,
        default: null,
      },

      message: {
        type: String,
        default: null,
      },
    },
  },

  {
    timestamps: true,
  },
);

reviewChunkSchema.index(
  {
    reviewId: 1,
    chunkIndex: 1,
  },
  {
    unique: true,
  },
);

const ReviewChunk =
  mongoose.models.ReviewChunk ||
  mongoose.model("ReviewChunk", reviewChunkSchema);

export default ReviewChunk;
