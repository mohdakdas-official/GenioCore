import { z } from "zod";

export const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Project name must be at least 3 characters")
    .max(50, "Project name must not exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9-_]+$/,
      "Name can only contain letters, numbers, dashes, and underscores",
    ),

  description: z
    .string()
    .trim()
    .max(200, "Description must not exceed 200 characters")
    .optional(),
});
