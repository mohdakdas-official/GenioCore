import { getProvider } from "./providerRegistry.js";

import { reviewOutputSchema } from "../validations/reviewOutput.validation.js";

const executeReview = async ({ model, review, input }) => {
  const provider = getProvider(model.provider);

  const result = await provider.executeReview({
    model,
    reviewType: review.reviewType,

    input,
  });

  if (!result || !result.output || !result.metadata) {
    throw new Error("AI provider returned an invalid response");
  }

  /*
   * Provider output cannot enter our DB
   * without passing NeuAspire's schema.
   */
  const parsedOutput = reviewOutputSchema.safeParse(result.output);

  if (!parsedOutput.success) {
    console.error("AI OUTPUT VALIDATION FAILED:");

    console.dir(parsedOutput.error.issues, {
      depth: null,
    });

    console.error("RAW AI OUTPUT:");

    console.dir(result.output, {
      depth: null,
    });

    const error = new Error("AI output validation failed");

    error.code = "AI_OUTPUT_INVALID";

    error.details = parsedOutput.error.issues;

    throw error;
  }

  return {
    output: parsedOutput.data,

    metadata: result.metadata,
  };
};

export { executeReview };
