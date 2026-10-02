import "dotenv/config";

import { Worker, UnrecoverableError } from "bullmq";

import connectDB from "../config/db.js";

import Review from "../models/review.model.js";

import { createNotification } from "../services/notification.service.js";

import { REVIEW_QUEUE_NAME } from "../constants/queue.constants.js";

import { createWorkerRedisConnection } from "../config/redis.js";

import { selectModelCandidates } from "../ai/modelRouter.js";

import { executeReview } from "../ai/aiOrchestrator.js";

import { getSnapshotForReview } from "../services/snapshotLoader.service.js";

import { buildSnapshotChunks } from "../services/chunkBuilder.service.js";

import { aggregateChunkResults } from "../services/reviewAggregation.service.js";

import { persistReviewIssues } from "../services/reviewIssue.service.js";

import ReviewChunk from "../models/reviewChunk.model.js";

const connection = createWorkerRedisConnection();

await connectDB();

/*
 * ------------------------------------------------
 * REVIEW PROGRESS
 * ------------------------------------------------
 */

const updateReviewProgress = async ({
  reviewId,
  ownerId,
  completedChunks,
  totalChunks,
}) => {
  const percentage =
    totalChunks > 0
      ? Math.min(100, Math.round((completedChunks / totalChunks) * 100))
      : 0;

  await Review.updateOne(
    {
      _id: reviewId,
      ownerId,
      status: "PROCESSING",
    },
    {
      $set: {
        "progress.totalChunks": totalChunks,
        "progress.completedChunks": completedChunks,
        "progress.percentage": percentage,
      },
    },
  );
};

/*
 * ------------------------------------------------
 * REVIEW WORKER
 * ------------------------------------------------
 */

const worker = new Worker(
  REVIEW_QUEUE_NAME,

  async (job) => {
    const { reviewId, ownerId } = job.data;

    /*
     * ------------------------------------------------
     * MOVE REVIEW TO PROCESSING
     * ------------------------------------------------
     *
     * PROCESSING is also allowed because BullMQ
     * may retry a previous failed job attempt.
     */

    const review = await Review.findOneAndUpdate(
      {
        _id: reviewId,
        ownerId,

        status: {
          $in: ["QUEUED", "PROCESSING"],
        },
      },

      {
        $set: {
          status: "PROCESSING",

          /*
           * Preserve startedAt inside BullMQ retries.
           *
           * A manually retried review may already
           * have startedAt reset by the retry service.
           */
          ...(job.attemptsMade === 0
            ? {
                startedAt: new Date(),
              }
            : {}),

          failure: {
            code: null,
            message: null,
            retryable: false,
          },
        },
      },

      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!review) {
      throw new Error(`Review ${reviewId} is not available for processing`);
    }

    /*
     * ------------------------------------------------
     * MODEL ROUTING
     * ------------------------------------------------
     */

    const modelCandidates = selectModelCandidates({
      reviewType: review.reviewType,
      routingMode: review.routingMode,
      requestedProvider: review.requestedProvider,
      requestedModel: review.requestedModel,
    });

    const preferredModel = modelCandidates[0];

    console.log(
      "AI routing candidates:",
      modelCandidates.map(
        (model) =>
          `${model.provider}/${model.id} (${model.routingScore ?? "MANUAL"})`,
      ),
    );

    /*
     * Store GenioCore's selected logical model.
     *
     * At completion execution.model will be replaced
     * with the actual provider model(s) used.
     */

    await Review.updateOne(
      {
        _id: reviewId,
        ownerId,
        status: "PROCESSING",
      },

      {
        $set: {
          "execution.provider": preferredModel.provider,

          "execution.model": preferredModel.id,

          "execution.attempts": job.attemptsMade + 1,
        },
      },
    );

    /*
     * ------------------------------------------------
     * LOAD SNAPSHOT
     * ------------------------------------------------
     */

    const snapshot = await getSnapshotForReview({
      ownerId,

      projectId: review.projectId,

      snapshotId: review.snapshotId,
    });

    /*
     * ------------------------------------------------
     * DETERMINE TOTAL CHUNKS
     * ------------------------------------------------
     *
     * This makes one lightweight pass over the
     * sanitized snapshot.
     *
     * No AI request happens during this pass.
     */

    let totalChunks = 0;

    for await (const _chunk of buildSnapshotChunks({
      snapshot,
    })) {
      totalChunks++;
    }

    /*
     * Initialize progress before actual processing.
     */

    await Review.updateOne(
      {
        _id: reviewId,
        ownerId,
        status: "PROCESSING",
      },

      {
        $set: {
          "progress.totalChunks": totalChunks,
          "progress.completedChunks": 0,
          "progress.percentage": 0,
        },
      },
    );

    /*
     * ------------------------------------------------
     * PROCESS CODE CHUNKS
     * ------------------------------------------------
     */

    const chunkResults = [];

    let processedChunks = 0;

    for await (const chunk of buildSnapshotChunks({
      snapshot,
    })) {
      /*
       * ------------------------------------------------
       * RESUME FROM CHECKPOINT
       * ------------------------------------------------
       */

      const existingChunk = await ReviewChunk.findOne({
        reviewId,
        ownerId,
        chunkIndex: chunk.index,
        status: "COMPLETED",
      }).lean();

      if (existingChunk) {
        console.log(
          `Review ${reviewId} chunk ${chunk.index} already completed. Reusing checkpoint.`,
        );

        chunkResults.push({
          output: existingChunk.output,

          metadata: existingChunk.metadata,

          chunkChars: chunk.totalChars,
        });

        processedChunks++;

        /*
         * BullMQ internal progress.
         */

        await job.updateProgress({
          processedChunks,
          totalChunks,
        });

        /*
         * Persist progress to Review so frontend
         * does not need direct BullMQ access.
         */

        await updateReviewProgress({
          reviewId,
          ownerId,
          completedChunks: processedChunks,
          totalChunks,
        });

        continue;
      }

      /*
       * ------------------------------------------------
       * PROCESS NEW / FAILED CHUNK
       * ------------------------------------------------
       */

      console.log(
        `Processing review ${reviewId} chunk ${chunk.index} (${chunk.totalChars} chars)`,
      );

      /*
       * Mark checkpoint as PROCESSING.
       */

      await ReviewChunk.findOneAndUpdate(
        {
          reviewId,
          chunkIndex: chunk.index,
        },

        {
          $set: {
            projectId: review.projectId,

            snapshotId: review.snapshotId,

            ownerId,

            status: "PROCESSING",

            failure: {
              code: null,
              message: null,
            },
          },
        },

        {
          upsert: true,
          returnDocument: "after",
          setDefaultsOnInsert: true,
        },
      );

      try {
        /*
         * Execute AI review for this chunk.
         */

        let result = null;
        let lastError = null;
        let retryableError = null;

        for (const candidateModel of modelCandidates) {
          try {
            console.log(
              `Trying ${candidateModel.provider}/${candidateModel.id} for review ${reviewId} chunk ${chunk.index}`,
            );

            result = await executeReview({
              model: candidateModel,

              review,

              input: {
                type: "CODE_CHUNK",
                chunkIndex: chunk.index,
                files: chunk.files,
              },
            });

            console.log(
              `Provider succeeded: ${result.metadata.provider}/${result.metadata.model}`,
            );

            break;
          } catch (error) {
            lastError = error;

            /*
             * Keep a recoverable failure around.
             *
             * If every provider fails but at least one failed because of
             * a temporary/network/provider condition, BullMQ may retry later.
             */
            if (error?.retryable !== false) {
              retryableError = error;
            }

            console.warn(
              `Provider ${candidateModel.provider}/${candidateModel.id} failed`,
              {
                code: error?.code ?? "UNKNOWN",
                message: error?.message,
                retryable: error?.retryable,
              },
            );
          }
        }

        if (!result) {
          /*
           * Prefer a retryable error if one occurred.
           *
           * Otherwise all failures were effectively permanent
           * (quota/config/etc.).
           */
          const finalError = retryableError ?? lastError;

          if (!finalError) {
            const error = new Error("All AI providers failed");
            error.code = "ALL_AI_PROVIDERS_FAILED";
            throw error;
          }

          throw finalError;
        }

        /*
         * ------------------------------------------------
         * SAVE SUCCESSFUL CHECKPOINT
         * ------------------------------------------------
         *
         * Persist immediately so successful AI work
         * survives process crashes / BullMQ retries.
         */

        await ReviewChunk.updateOne(
          {
            reviewId,
            ownerId,
            chunkIndex: chunk.index,
          },

          {
            $set: {
              status: "COMPLETED",

              output: result.output,

              metadata: result.metadata,

              failure: {
                code: null,
                message: null,
              },
            },
          },
        );

        chunkResults.push({
          ...result,

          chunkChars: chunk.totalChars,
        });

        console.log(
          `Chunk ${chunk.index} completed using ${result.metadata.provider}/${result.metadata.model}`,
        );
      } catch (error) {
        /*
         * ------------------------------------------------
         * SAVE FAILED CHECKPOINT
         * ------------------------------------------------
         */

        await ReviewChunk.updateOne(
          {
            reviewId,
            ownerId,
            chunkIndex: chunk.index,
          },

          {
            $set: {
              status: "FAILED",

              failure: {
                code: error.code ?? "CHUNK_PROCESSING_FAILED",

                message: error.message,
              },
            },
          },
        );

        /*
         * Daily provider quota will not recover
         * during an immediate BullMQ retry.
         *
         * Stop retrying this queue job.
         */

        const unrecoverableProviderErrors = new Set([
          "GOOGLE_DAILY_QUOTA_EXHAUSTED",
          "OPENAI_QUOTA_EXHAUSTED",
          "ANTHROPIC_QUOTA_EXHAUSTED",
        ]);

        if (error?.retryable === false) {
          throw new UnrecoverableError(error.message);
        }

        throw error;
      }

      /*
       * ------------------------------------------------
       * CHUNK SUCCESS → UPDATE PROGRESS
       * ------------------------------------------------
       */

      processedChunks++;

      /*
       * BullMQ internal progress.
       */

      await job.updateProgress({
        processedChunks,
        totalChunks,
      });

      /*
       * Persistent progress for API/frontend.
       */

      await updateReviewProgress({
        reviewId,
        ownerId,
        completedChunks: processedChunks,
        totalChunks,
      });
    }

    /*
     * ------------------------------------------------
     * AGGREGATE CHUNK RESULTS
     * ------------------------------------------------
     */

    const aggregated = aggregateChunkResults(chunkResults);

    const output = aggregated.output;

    /*
     * ------------------------------------------------
     * ACTUAL MODELS USED
     * ------------------------------------------------
     *
     * Different chunks may have been processed by
     * different fallback models.
     */

    const actualProvidersUsed = [
      ...new Set(
        chunkResults.map((result) => result.metadata?.provider).filter(Boolean),
      ),
    ];

    const actualModelsUsed = [
      ...new Set(
        chunkResults.map((result) => result.metadata?.model).filter(Boolean),
      ),
    ];

    const metadata = {
      provider:
        actualProvidersUsed.length === 1 ? actualProvidersUsed[0] : "MULTIPLE",

      model: actualModelsUsed.length === 1 ? actualModelsUsed[0] : "MULTIPLE",

      promptVersion: chunkResults[0]?.metadata?.promptVersion ?? null,

      inputTokens: aggregated.metadata.inputTokens,

      outputTokens: aggregated.metadata.outputTokens,

      latencyMs: aggregated.metadata.latencyMs,

      estimatedCostUsdMicros: aggregated.metadata.estimatedCostUsdMicros,
    };

    /*
     * ------------------------------------------------
     * PERSIST REVIEW ISSUES
     * ------------------------------------------------
     */

    const { issueCounts } = await persistReviewIssues({
      reviewId,

      projectId: review.projectId,

      ownerId,

      issues: output.issues ?? [],
    });

    /*
     * ------------------------------------------------
     * COMPLETE REVIEW
     * ------------------------------------------------
     */

    const completedReview = await Review.findOneAndUpdate(
      {
        _id: reviewId,
        ownerId,
        status: "PROCESSING",
      },

      {
        $set: {
          status: "COMPLETED",

          summary: output.summary,

          scores: output.scores,

          issueCounts,

          /*
           * Final progress must always be 100%.
           */

          "progress.totalChunks": totalChunks,

          "progress.completedChunks": totalChunks,

          "progress.percentage": 100,

          /*
           * Final execution metadata.
           */

          "execution.provider": metadata.provider,

          "execution.model": metadata.model,

          "execution.promptVersion": metadata.promptVersion,

          "execution.latencyMs": metadata.latencyMs,

          "execution.tokenUsage.input": metadata.inputTokens ?? 0,

          "execution.tokenUsage.output": metadata.outputTokens ?? 0,

          "execution.tokenUsage.total":
            (metadata.inputTokens ?? 0) + (metadata.outputTokens ?? 0),

          "execution.estimatedCostUsdMicros":
            metadata.estimatedCostUsdMicros ?? 0,

          completedAt: new Date(),

          failedAt: null,

          failure: {
            code: null,
            message: null,
            retryable: false,
          },
        },
      },

      {
        returnDocument: "after",

        runValidators: true,
      },
    );

    if (!completedReview) {
      throw new Error(`Review ${reviewId} could not be completed`);
    }

    await createNotification({
      ownerId: completedReview.ownerId,

      type: "REVIEW_COMPLETED",

      title: "Code Review Completed",

      message:
        typeof completedReview.scores?.overall === "number"
          ? `Review completed with an overall score of ${completedReview.scores.overall}/100.`
          : "Code review completed successfully.",

      severity: "NORMAL",

      projectId: completedReview.projectId,

      reviewId: completedReview._id,

      dedupeKey: `${completedReview._id}:COMPLETED`,
    });

    const critical = completedReview.issueCounts?.critical ?? 0;

    const high = completedReview.issueCounts?.high ?? 0;

    if (critical > 0 || high > 0) {
      await createNotification({
        ownerId: completedReview.ownerId,

        type: "SECURITY_ALERT",

        title:
          critical > 0
            ? "Critical Security Findings Detected"
            : "High Severity Findings Detected",

        message: `Review detected ${critical} critical and ${high} high severity finding${
          critical + high === 1 ? "" : "s"
        }.`,

        severity: critical > 0 ? "CRITICAL" : "HIGH",

        projectId: completedReview.projectId,

        reviewId: completedReview._id,

        dedupeKey: `${completedReview._id}:SECURITY`,
      });
    }

    return {
      reviewId,

      status: "COMPLETED",

      provider: metadata.provider,

      model: metadata.model,

      progress: {
        totalChunks,

        completedChunks: totalChunks,

        percentage: 100,
      },
    };
  },

  {
    connection,

    /*
     * Keep concurrency conservative initially.
     *
     * Later this may depend on:
     * provider rate limits,
     * worker capacity,
     * cost controls,
     * review size.
     */

    concurrency: 2,
  },
);

/*
 * ------------------------------------------------
 * JOB COMPLETED
 * ------------------------------------------------
 */

worker.on("completed", (job, result) => {
  console.log(
    `Review job ${job.id} completed using ${result?.provider}/${result?.model}`,
  );
});

/*
 * ------------------------------------------------
 * JOB FAILED
 * ------------------------------------------------
 */

worker.on("failed", async (job, error) => {
  if (!job) {
    return;
  }

  const maxAttempts = job.opts.attempts ?? 1;

  const isUnrecoverable =
    error instanceof UnrecoverableError || error?.name === "UnrecoverableError";

  /**
   * BullMQ will retry while
   * attempts remain.
   */
  if (!isUnrecoverable && job.attemptsMade < maxAttempts) {
    console.warn(
      `Review job ${job.id} attempt ${job.attemptsMade}/${maxAttempts} failed. Retrying...`,
    );

    return;
  }

  /**
   * Permanent failure
   */
  try {
    const failedReview = await Review.findOneAndUpdate(
      {
        _id: job.data.reviewId,

        ownerId: job.data.ownerId,

        status: {
          $in: ["QUEUED", "PROCESSING"],
        },
      },

      {
        $set: {
          status: "FAILED",

          failedAt: new Date(),

          failure: {
            code: isUnrecoverable
              ? "AI_QUOTA_EXHAUSTED"
              : "REVIEW_PROCESSING_FAILED",

            message: isUnrecoverable
              ? "AI provider quota exhausted"
              : "Review processing failed",

            retryable: !isUnrecoverable,
          },
        },
      },

      {
        returnDocument: "after",

        runValidators: true,
      },
    );

    if (!failedReview) {
      console.warn(
        `Failed review ${job.data.reviewId} was not found or was already finalized.`,
      );

      return;
    }

    /**
     * Real persisted notification
     */
    await createNotification({
      ownerId: failedReview.ownerId,

      type: "REVIEW_FAILED",

      title: "Code Review Failed",

      message:
        failedReview.failure?.message ||
        "The code review could not be completed.",

      severity: "HIGH",

      projectId: failedReview.projectId,

      reviewId: failedReview._id,

      dedupeKey: `${failedReview._id}:FAILED:${job.attemptsMade}`,
    });

    console.error(`Review job ${job.id} permanently failed:`, error.message);
  } catch (notificationError) {
    console.error(
      `Failed to persist failure state/notification for review ${job.data.reviewId}:`,
      notificationError,
    );
  }
});
/*
 * ------------------------------------------------
 * WORKER ERROR
 * ------------------------------------------------
 */

worker.on("error", (error) => {
  console.error("Review worker error:", error);
});

/*
 * ------------------------------------------------
 * GRACEFUL SHUTDOWN
 * ------------------------------------------------
 */

const shutdown = async (signal) => {
  console.log(`${signal} received. Closing review worker...`);

  await worker.close();

  await connection.quit();

  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("SIGINT", () => shutdown("SIGINT"));

console.log("GenioCore review worker started");
