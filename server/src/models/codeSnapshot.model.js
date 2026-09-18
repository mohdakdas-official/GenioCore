import mongoose from "mongoose";

const codeSnapshotSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sourceType: {
      type: String,
      enum: ["MANUAL", "GITHUB"],
      required: true,
    },
    sourceReference: {
      commitSha: {
        type: String,
        trim: true,
        default: null,
      },
      branch: {
        type: String,
        trim: true,
        maxlength: 255,
        default: null,
      },
    },
    fileCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalBytes: {
      type: Number,
      min: 0,
      default: 0,
    },
    contentHash: {
      type: String,
      trim: true,
      maxlength: 128,
      default: null,
    },
    storageKey: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null,
    },
    status: {
      type: String,
      enum: ["READY", "PROCESSING", "FAILED"],
      default: "READY",
    },
    schemaVersion: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
);

codeSnapshotSchema.index({
  ownerId: 1,
  projectId: 1,
  createdAt: -1,
});

codeSnapshotSchema.index(
  {
    projectId: 1,
    contentHash: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: "READY",
      contentHash: {
        $type: "string",
      },
    },
  },
);

const CodeSnapshot = mongoose.model("CodeSnapshot", codeSnapshotSchema);

export default CodeSnapshot;
