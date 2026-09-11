import mongoose from "mongoose";

const techStackItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
  },
  {
    _id: false,
  },
);

const repositorySchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ["GITHUB"],
      default: null,
    },

    externalId: {
      type: String,
      default: null,
    },

    owner: {
      type: String,
      trim: true,
      default: null,
    },

    name: {
      type: String,
      trim: true,
      default: null,
    },

    fullName: {
      type: String,
      trim: true,
      default: null,
    },

    url: {
      type: String,
      trim: true,
      default: null,
    },

    defaultBranch: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    _id: false,
  },
);

const projectSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    sourceType: {
      type: String,
      enum: ["MANUAL", "GITHUB"],
      required: true,
      default: "MANUAL",
    },

    repository: {
      type: repositorySchema,
      default: undefined,
    },

    techStack: {
      languages: {
        type: [techStackItemSchema],
        default: [],
      },

      frameworks: {
        type: [techStackItemSchema],
        default: [],
      },
    },

    status: {
      type: String,
      enum: ["ACTIVE", "ARCHIVED"],
      required: true,
      default: "ACTIVE",
    },

    archivedAt: {
      type: Date,
      default: null,
    },
    scheduledDeletionAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Main project listing query:
 *
 * ownerId + status
 * sorted by updatedAt
 */
projectSchema.index({
  ownerId: 1,
  status: 1,
  updatedAt: -1,
  _id: -1,
});

/**
 * Prevent the same GitHub repository from being
 * connected multiple times by the same user.
 *
 * This index only affects GitHub projects.
 */
projectSchema.index(
  {
    ownerId: 1,
    "repository.provider": 1,
    "repository.externalId": 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      sourceType: "GITHUB",
      "repository.externalId": {
        $exists: true,
      },
    },
  },
);

const Project = mongoose.model("Project", projectSchema);

export default Project;
