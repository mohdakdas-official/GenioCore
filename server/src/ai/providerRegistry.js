import { executeMockReview } from "./providers/mock.provider.js";

import { executeGoogleReview } from "./providers/google.provider.js";

import { executeOpenAIReview } from "./providers/openai.provider.js";
import { executeAnthropicReview } from "./providers/anthropic.provider.js";

const PROVIDERS = {
  GOOGLE: {
    executeReview: executeGoogleReview,
  },

  OPENAI: {
    executeReview: executeOpenAIReview,
  },

  ANTHROPIC: {
    executeReview: executeAnthropicReview,
  },
};

const getProvider = (providerName) => {
  const provider = PROVIDERS[providerName];

  if (!provider) {
    throw new Error(`Unsupported AI provider: ${providerName}`);
  }

  return provider;
};

export { getProvider };
