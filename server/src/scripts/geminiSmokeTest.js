import "dotenv/config";

import mongoose from "mongoose";

import connectDB from "../config/db.js";

import { getSnapshotForReview } from "../services/snapshotLoader.service.js";

import { buildSnapshotChunks } from "../services/chunkBuilder.service.js";

import { selectModel } from "../ai/modelRouter.js";

import { executeReview } from "../ai/aiOrchestrator.js";

const [ownerId, projectId, snapshotId] = process.argv.slice(2);

if (!ownerId || !projectId || !snapshotId) {
  console.error(
    "Usage: node src/scripts/geminiSmokeTest.js <ownerId> <projectId> <snapshotId>",
  );

  process.exit(1);
}

await connectDB();

const selectedModel = selectModel({
  reviewType: "FULL",
  routingMode: "AUTO",
  requestedProvider: null,
  requestedModel: null,
});

console.log("Selected model:", {
  id: selectedModel.id,
  provider: selectedModel.provider,
  providerModel: selectedModel.providerModel,
});

if (selectedModel.provider !== "GOOGLE") {
  throw new Error(
    `Smoke test expected GOOGLE but router selected ${selectedModel.provider}`,
  );
}

const snapshot = await getSnapshotForReview({
  ownerId,
  projectId,
  snapshotId,
});

let firstChunk = null;

for await (const chunk of buildSnapshotChunks({
  snapshot,
})) {
  firstChunk = chunk;
  break;
}

if (!firstChunk) {
  throw new Error("Snapshot produced no source-code chunks");
}

console.log("Testing chunk:", {
  index: firstChunk.index,

  fileParts: firstChunk.files.length,

  chars: firstChunk.totalChars,

  estimatedTokens: firstChunk.estimatedTokens,
});

const result = await executeReview({
  model: selectedModel,

  review: {
    reviewType: "FULL",
  },

  input: {
    type: "CODE_CHUNK",

    chunkIndex: firstChunk.index,

    files: firstChunk.files,
  },
});

console.log("\n===== GEMINI RESULT =====");

console.dir(result, {
  depth: null,
});

console.log("\nGemini smoke test passed.");

await mongoose.disconnect();
