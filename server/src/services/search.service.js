import mongoose from "mongoose";

import Project from "../models/project.model.js";
import Review from "../models/review.model.js";
import ReviewIssue from "../models/reviewIssue.model.js";
import { Notification } from "../models/notification.model.js";

const RESULT_LIMIT = 6;

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const searchPlatform = async ({ ownerId, query }) => {
  const normalizedQuery = query.trim();

  const regex = new RegExp(escapeRegex(normalizedQuery), "i");

  const isObjectId = mongoose.Types.ObjectId.isValid(normalizedQuery);

  /*
   * ------------------------------------------------
   * PROJECTS
   * ------------------------------------------------
   */

  const projectConditions = [
    {
      name: regex,
    },
    {
      description: regex,
    },
    {
      "techStack.languages.name": regex,
    },
    {
      "techStack.frameworks.name": regex,
    },
    {
      status: regex,
    },
  ];

  if (isObjectId) {
    projectConditions.push({
      _id: normalizedQuery,
    });
  }

  const projects = await Project.find({
    ownerId,

    $or: projectConditions,
  })
    .select(
      "_id name description sourceType techStack status createdAt updatedAt",
    )
    .sort({
      updatedAt: -1,
    })
    .limit(RESULT_LIMIT)
    .lean();

  const projectIds = projects.map((project) => project._id);

  /*
   * ------------------------------------------------
   * REVIEWS
   * ------------------------------------------------
   */

  const reviewConditions = [
    {
      reviewType: regex,
    },
    {
      status: regex,
    },
    {
      routingMode: regex,
    },
    {
      summary: regex,
    },
    {
      "execution.provider": regex,
    },
    {
      "execution.model": regex,
    },
  ];

  if (projectIds.length > 0) {
    reviewConditions.push({
      projectId: {
        $in: projectIds,
      },
    });
  }

  if (isObjectId) {
    reviewConditions.push({
      _id: normalizedQuery,
    });

    reviewConditions.push({
      projectId: normalizedQuery,
    });
  }

  const reviews = await Review.find({
    ownerId,

    $or: reviewConditions,
  })
    .select(
      "_id projectId reviewType routingMode status summary scores issueCounts execution createdAt startedAt completedAt failedAt",
    )
    .populate({
      path: "projectId",
      select: "_id name",
    })
    .sort({
      createdAt: -1,
    })
    .limit(RESULT_LIMIT)
    .lean();

  const reviewIds = reviews.map((review) => review._id);

  /*
   * ------------------------------------------------
   * REVIEW ISSUES
   * ------------------------------------------------
   */

  const issueConditions = [
    {
      title: regex,
    },
    {
      description: regex,
    },
    {
      recommendation: regex,
    },
    {
      category: regex,
    },
    {
      severity: regex,
    },
    {
      status: regex,
    },
    {
      ruleId: regex,
    },
    {
      "location.filePath": regex,
    },
    {
      "location.symbol": regex,
    },
  ];

  if (projectIds.length > 0) {
    issueConditions.push({
      projectId: {
        $in: projectIds,
      },
    });
  }

  if (reviewIds.length > 0) {
    issueConditions.push({
      reviewId: {
        $in: reviewIds,
      },
    });
  }

  if (isObjectId) {
    issueConditions.push({
      _id: normalizedQuery,
    });

    issueConditions.push({
      reviewId: normalizedQuery,
    });

    issueConditions.push({
      projectId: normalizedQuery,
    });
  }

  const issues = await ReviewIssue.find({
    ownerId,

    $or: issueConditions,
  })
    .select(
      "_id reviewId projectId category severity status title description recommendation location ruleId confidence createdAt",
    )
    .populate({
      path: "projectId",
      select: "_id name",
    })
    .populate({
      path: "reviewId",
      select: "_id status reviewType",
    })
    .sort({
      createdAt: -1,
    })
    .limit(RESULT_LIMIT)
    .lean();

  /*
   * ------------------------------------------------
   * NOTIFICATIONS
   * ------------------------------------------------
   */

  const notificationConditions = [
    {
      title: regex,
    },
    {
      message: regex,
    },
    {
      type: regex,
    },
    {
      severity: regex,
    },
  ];

  if (projectIds.length > 0) {
    notificationConditions.push({
      projectId: {
        $in: projectIds,
      },
    });
  }

  if (reviewIds.length > 0) {
    notificationConditions.push({
      reviewId: {
        $in: reviewIds,
      },
    });
  }

  if (isObjectId) {
    notificationConditions.push({
      _id: normalizedQuery,
    });

    notificationConditions.push({
      reviewId: normalizedQuery,
    });

    notificationConditions.push({
      projectId: normalizedQuery,
    });
  }

  const notifications = await Notification.find({
    ownerId,

    dismissedAt: null,

    $or: notificationConditions,
  })
    .select(
      "_id type title message severity projectId reviewId isRead createdAt",
    )
    .sort({
      createdAt: -1,
    })
    .limit(RESULT_LIMIT)
    .lean();

  return {
    projects,
    reviews,
    issues,
    notifications,
  };
};
