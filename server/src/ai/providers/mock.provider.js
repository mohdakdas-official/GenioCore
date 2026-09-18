const executeMockReview = async ({ model, reviewType, input }) => {
  const startedAt = Date.now();

  await new Promise((resolve) => setTimeout(resolve, 200));

  const fileCount = input?.files?.length ?? 0;

  const firstFile = input?.files?.[0];

  const issues =
    input?.chunkIndex === 0 && firstFile
      ? [
          {
            category: "SECURITY",

            severity: "HIGH",

            title: "Mock security issue",

            description:
              "This is a temporary mock issue used to test ReviewIssue persistence.",

            recommendation:
              "Replace this mock finding when the real AI provider is connected.",

            location: {
              filePath: firstFile.path,

              lineStart: firstFile.lineStart ?? 1,

              lineEnd: firstFile.lineStart ?? 1,

              symbol: null,
            },

            codeSnippet: null,

            ruleId: "MOCK_SECURITY_001",

            confidence: 0.95,
          },
        ]
      : [];

  return {
    output: {
      summary: `Mock analysis completed for chunk ${input?.chunkIndex ?? 0} containing ${fileCount} file parts.`,

      scores: {
        overall: 82,
        security: 78,
        performance: 85,
        maintainability: 80,
        reliability: 84,
      },

      issues,
    },

    metadata: {
      provider: model.provider,

      model: model.id,

      inputTokens: 0,
      outputTokens: 0,

      latencyMs: Date.now() - startedAt,

      estimatedCostUsdMicros: 0,

      promptVersion: "mock-review-v1",
    },
  };
};

export { executeMockReview };
