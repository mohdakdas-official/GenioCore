import "dotenv/config";

import { Worker, UnrecoverableError } from "bullmq";

import connectDB from "../config/db.js";

import Review from "../models/review.model.js";

import { REVIEW_QUEUE_NAME } from "../constants/queue.constants.js";

import { createWorkerRedisConnection } from "../config/redis.js";

import { selectModel } from "../ai/modelRouter.js";

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

    const selectedModel = selectModel({
      reviewType: review.reviewType,

      routingMode: review.routingMode,

      requestedProvider: review.requestedProvider,

      requestedModel: review.requestedModel,
    });

    /*
     * Store NeuAspire's selected logical model.
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
          "execution.provider": selectedModel.provider,

          "execution.model": selectedModel.id,

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

        const result = await executeReview({
          model: selectedModel,

          review,

          input: {
            type: "CODE_CHUNK",

            chunkIndex: chunk.index,

            files: chunk.files,
          },
        });

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

        if (unrecoverableProviderErrors.has(error?.code)) {
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

    const actualModelsUsed = [
      ...new Set(
        chunkResults.map((result) => result.metadata?.model).filter(Boolean),
      ),
    ];

    const metadata = {
      provider: selectedModel.provider,

      /*
       * If one provider model handled every chunk,
       * store that model.
       *
       * Otherwise store MULTIPLE.
       */

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

  /*
   * BullMQ will retry automatically
   * while attempts remain.
   *
   * Don't mark Review FAILED yet.
   */

  if (!isUnrecoverable && job.attemptsMade < maxAttempts) {
    console.warn(
      `Review job ${job.id} attempt ${job.attemptsMade}/${maxAttempts} failed. Retrying...`,
    );

    return;
  }

  /*
   * ------------------------------------------------
   * PERMANENT FAILURE
   * ------------------------------------------------
   */

  await Review.updateOne(
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
  );

  console.error(`Review job ${job.id} permanently failed:`, error.message);
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

console.log("NeuAspire review worker started");
