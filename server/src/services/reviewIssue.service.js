import crypto from "crypto";

import ReviewIssue from "../models/reviewIssue.model.js";

import Review from "../models/review.model.js";

const MAX_REVIEW_ISSUES = 1000;

const normalizeText = (value = "") =>
  String(value).trim().toLowerCase().replace(/\s+/g, " ");

const normalizeFilePath = (value = "") =>
  String(value)
    .trim()
    .replaceAll("\\", "/")
    .replace(/^\.\/+/, "");

const generateIssueFingerprint = (issue) => {
  const payload = [
    issue.category,
    issue.ruleId ?? "",
    normalizeFilePath(issue.location?.filePath),
    issue.location?.lineStart ?? "",
    normalizeText(issue.title),
  ].join("|");

  return crypto.createHash("sha256").update(payload).digest("hex");
};

const calculateIssueCounts = (issues) => {
  const counts = {
    total: issues.length,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };

  for (const issue of issues) {
    switch (issue.severity) {
      case "CRITICAL":
        counts.critical++;
        break;

      case "HIGH":
        counts.high++;
        break;

      case "MEDIUM":
        counts.medium++;
        break;

      case "LOW":
        counts.low++;
        break;

      case "INFO":
        counts.info++;
        break;
    }
  }

  return counts;
};

const persistReviewIssues = async ({
  reviewId,
  projectId,
  ownerId,
  issues = [],
}) => {
  /*
   * Important for BullMQ retries.
   *
   * Agar previous attempt partially issues
   * save karke fail hui thi, retry clean
   * state se start karegi.
   */
  await ReviewIssue.deleteMany({
    reviewId,
    ownerId,
  });

  const uniqueIssues = new Map();

  for (const issue of issues) {
    const fingerprint = generateIssueFingerprint(issue);

    if (!uniqueIssues.has(fingerprint)) {
      uniqueIssues.set(fingerprint, {
        ...issue,
        fingerprint,
      });
    }
  }

  const deduplicatedIssues = [...uniqueIssues.values()].slice(
    0,
    MAX_REVIEW_ISSUES,
  );

  const documents = deduplicatedIssues.map((issue) => ({
    reviewId,
    projectId,
    ownerId,

    category: issue.category,

    severity: issue.severity,

    title: issue.title,

    description: issue.description,

    recommendation: issue.recommendation,

    location: issue.location,

    codeSnippet: issue.codeSnippet ?? null,

    ruleId: issue.ruleId ?? null,

    confidence: issue.confidence ?? null,

    fingerprint: issue.fingerprint,

    status: "OPEN",
  }));

  if (documents.length > 0) {
    await ReviewIssue.insertMany(documents, {
      ordered: true,
    });
  }

  return {
    issueCounts: calculateIssueCounts(deduplicatedIssues),

    persistedCount: documents.length,
  };
};

const clearReviewIssues = async ({ reviewId, ownerId }) => {
  await ReviewIssue.deleteMany({
    reviewId,
    ownerId,
  });
};

const getReviewIssues = async ({
  projectId,
  reviewId,
  ownerId,
  status,
  severity,
  limit = 50,
  cursor,
}) => {
  /*
   * Pehle ensure karo ki review isi user/project ka hai.
   * Unauthorized review ko bhi 404 milega.
   */
  const review = await Review.findOne({
    _id: reviewId,
    projectId,
    ownerId,
  })
    .select("_id")
    .lean();

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  const filter = {
    reviewId,
    projectId,
    ownerId,
  };

  if (status) {
    filter.status = status;
  }

  if (severity) {
    filter.severity = severity;
  }

  if (cursor) {
    filter._id = {
      $lt: cursor,
    };
  }

  const issues = await ReviewIssue.find(filter)
    .sort({
      _id: -1,
    })
    .limit(limit + 1)
    .lean();

  const hasMore = issues.length > limit;

  const results = hasMore ? issues.slice(0, limit) : issues;

  const nextCursor = hasMore
    ? results[results.length - 1]._id.toString()
    : null;

  return {
    issues: results,
    pagination: {
      limit,
      nextCursor,
      hasMore,
    },
  };
};

export { persistReviewIssues, clearReviewIssues, getReviewIssues };
