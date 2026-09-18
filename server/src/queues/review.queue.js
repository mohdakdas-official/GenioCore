import { Queue } from "bullmq";

import { createQueueRedisConnection } from "../config/redis.js";

import { REVIEW_QUEUE_NAME } from "../constants/queue.constants.js";

const connection = createQueueRedisConnection();

const reviewQueue = new Queue(REVIEW_QUEUE_NAME, {
  connection,

  defaultJobOptions: {
    attempts: 3,

    backoff: {
      type: "exponential",
      delay: 2000,
      jitter: 0.2,
    },

    removeOnComplete: {
      age: 3600,
      count: 1000,
    },

    removeOnFail: {
      age: 7 * 24 * 3600,
      count: 5000,
    },
  },
});

const enqueueReview = async ({ reviewId, ownerId, projectId, snapshotId }) => {
  return reviewQueue.add(
    "process-review",
    {
      reviewId,
      ownerId,
      projectId,
      snapshotId,
    },
    {
      /*
       * One BullMQ job for one Review.
       *
       * Prevents us from accidentally enqueueing
       * the same review twice while the job exists.
       */
      jobId: reviewId.toString(),
    },
  );
};

const enqueueReviewRetry = async ({ reviewId, ownerId }) => {
  return reviewQueue.add(
    "process-review",

    {
      reviewId,
      ownerId,
    },

    {
      /*
       * Old failed BullMQ job may still exist
       * with jobId = reviewId.
       *
       * Therefore manual retry gets a new
       * BullMQ job ID while keeping the same
       * database Review ID.
       */
      jobId: `${reviewId}-retry-${Date.now()}`,

      attempts: 3,

      backoff: {
        type: "exponential",
        delay: 2000,
      },

      removeOnComplete: {
        age: 3600,
        count: 1000,
      },

      removeOnFail: {
        age: 24 * 3600,
        count: 5000,
      },
    },
  );
};

export { REVIEW_QUEUE_NAME, reviewQueue, enqueueReview, enqueueReviewRetry };
