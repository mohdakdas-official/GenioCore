import { z } from "zod";

export const globalSearchSchema = z
  .object({
    q: z
      .string()
      .trim()
      .min(2, "Search query must contain at least 2 characters.")
      .max(100, "Search query cannot exceed 100 characters."),
  })
  .strict();
