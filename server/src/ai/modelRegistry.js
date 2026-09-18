const MODEL_REGISTRY = [
  {
    id: "openai-fast",
    provider: "OPENAI",

    providerModel: process.env.OPENAI_FAST_MODEL,

    capabilities: ["FULL", "SECURITY", "PERFORMANCE", "MAINTAINABILITY"],

    qualityScore: 85,
    speedScore: 90,
    costScore: 75,

    enabled: process.env.OPENAI_ENABLED,
  },

  {
    id: "anthropic-quality",
    provider: "ANTHROPIC",

    providerModel: process.env.ANTHROPIC_QUALITY_MODEL,

    capabilities: ["FULL", "SECURITY", "PERFORMANCE", "MAINTAINABILITY"],

    qualityScore: 95,
    speedScore: 70,
    costScore: 60,

    enabled: process.env.ANTHROPIC_ENABLED,
  },

  {
    id: "google-fast",
    provider: "GOOGLE",

    providerModel: process.env.GEMINI_FAST_MODEL,

    capabilities: ["FULL", "SECURITY", "PERFORMANCE", "MAINTAINABILITY"],

    qualityScore: 82,
    speedScore: 95,
    costScore: 90,

    enabled: process.env.GEMINI_ENABLED,
  },
];

export { MODEL_REGISTRY };
