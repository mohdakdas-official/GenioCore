const roundScore = (value) => Math.round(value);

const aggregateChunkResults = (chunkResults) => {
  if (chunkResults.length === 0) {
    throw new Error("No chunk results were produced");
  }

  let totalWeight = 0;

  const weightedScores = {
    overall: 0,
    security: 0,
    performance: 0,
    maintainability: 0,
    reliability: 0,
  };

  const issues = [];

  let inputTokens = 0;
  let outputTokens = 0;
  let latencyMs = 0;
  let estimatedCostUsdMicros = 0;

  for (const result of chunkResults) {
    const weight = Math.max(result.chunkChars ?? 1, 1);

    totalWeight += weight;

    for (const key of Object.keys(weightedScores)) {
      weightedScores[key] += result.output.scores[key] * weight;
    }

    issues.push(...(result.output.issues ?? []));

    inputTokens += result.metadata.inputTokens ?? 0;

    outputTokens += result.metadata.outputTokens ?? 0;

    latencyMs += result.metadata.latencyMs ?? 0;

    estimatedCostUsdMicros += result.metadata.estimatedCostUsdMicros ?? 0;
  }

  const scores = {};

  for (const [key, value] of Object.entries(weightedScores)) {
    scores[key] = roundScore(value / totalWeight);
  }

  return {
    output: {
      /*
       * Temporary summary.
       *
       * Later final synthesis model call
       * isse proper project-level summary
       * generate karega.
       */
      summary: `Analyzed ${chunkResults.length} code chunks successfully.`,

      scores,

      issues,
    },

    metadata: {
      inputTokens,
      outputTokens,

      /*
       * Sequential processing ke current
       * implementation mein sum meaningful hai.
       */
      latencyMs,

      estimatedCostUsdMicros,
    },
  };
};

export { aggregateChunkResults };
