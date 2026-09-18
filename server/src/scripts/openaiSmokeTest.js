import "dotenv/config";

import mongoose from "mongoose";

import connectDB from "../config/db.js";

import { MODEL_REGISTRY } from "../ai/modelRegistry.js";

import { executeOpenAIReview } from "../ai/providers/openai.provider.js";

import { getSnapshotForReview } from "../services/snapshotLoader.service.js";

import { buildSnapshotChunks } from "../services/chunkBuilder.service.js";

const PROJECT_ID = "6aa2a117ce6824ba458c9146";

const SNAPSHOT_ID = "6aaa41b43b8787ce0fbafd93";

/*
 * Use the same owner ID that owns
 * the project/snapshot.
 *
 * Put your actual MongoDB User ObjectId here.
 */
const OWNER_ID = process.env.OPENAI_SMOKE_OWNER_ID;

const run = async () => {
  if (!OWNER_ID) {
    throw new Error("OPENAI_SMOKE_OWNER_ID is not configured");
  }

  await connectDB();

  const model = MODEL_REGISTRY.find((item) => item.id === "openai-fast");

  if (!model) {
    throw new Error("openai-fast model is not registered");
  }

  if (!model.providerModel) {
    throw new Error("OPENAI_FAST_MODEL is not configured");
  }

  console.log(`Testing OpenAI model: ${model.providerModel}`);

  const snapshot = await getSnapshotForReview({
    ownerId: OWNER_ID,

    projectId: PROJECT_ID,

    snapshotId: SNAPSHOT_ID,
  });

  let firstChunk = null;

  for await (const chunk of buildSnapshotChunks({
    snapshot,
  })) {
    firstChunk = chunk;
    break;
  }

  if (!firstChunk) {
    throw new Error("Snapshot produced no code chunks");
  }

  console.log(
    `Testing chunk ${firstChunk.index} (${firstChunk.totalChars} chars)`,
  );

  const result = await executeOpenAIReview({
    model,

    reviewType: "FULL",

    input: {
      type: "CODE_CHUNK",

      chunkIndex: firstChunk.index,

      files: firstChunk.files,
    },
  });

  console.log("\nOPENAI SMOKE TEST SUCCESS\n");

  console.dir(
    {
      metadata: result.metadata,

      summary: result.output.summary,

      scores: result.output.scores,

      issueCount: result.output.issues?.length ?? 0,

      issues: result.output.issues,
    },
    {
      depth: null,
    },
  );
};

try {
  await run();
} catch (error) {
  console.error("\nOPENAI SMOKE TEST FAILED\n");

  console.error({
    name: error?.name,

    code: error?.code,

    status: error?.status,

    message: error?.message,
  });

  if (error?.cause) {
    console.error("Cause:", error.cause);
  }

  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
