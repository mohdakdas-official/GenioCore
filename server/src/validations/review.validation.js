import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

export const createReviewSchema = z
  .strictObject({
    snapshotId: objectIdSchema,

    reviewType: z
      .enum(["FULL", "SECURITY", "PERFORMANCE", "MAINTAINABILITY"])
      .optional()
      .default("FULL"),

    routingMode: z
      .enum(["AUTO", "FAST", "BALANCED", "QUALITY", "MANUAL"])
      .optional()
      .default("AUTO"),

    requestedProvider: z.enum(["OPENAI", "ANTHROPIC", "GOOGLE"]).optional(),

    requestedModel: z.string().trim().min(1).max(150).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.routingMode === "MANUAL") {
      if (!data.requestedProvider) {
        ctx.addIssue({
          code: "custom",
          path: ["requestedProvider"],
          message: "Provider is required when routing mode is MANUAL",
        });
      }

      if (!data.requestedModel) {
        ctx.addIssue({
          code: "custom",
          path: ["requestedModel"],
          message: "Model is required when routing mode is MANUAL",
        });
      }
    } else {
      if (
        data.requestedProvider !== undefined ||
        data.requestedModel !== undefined
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["routingMode"],
          message: "Provider and model can only be selected in MANUAL mode",
        });
      }
    }
  });

export const reviewParamsSchema = z.strictObject({
  projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid project ID"),

  reviewId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid review ID"),
});

export const reviewIssuesQuerySchema = z.strictObject({
  status: z.enum(["OPEN", "RESOLVED", "DISMISSED"]).optional(),

  severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"]).optional(),

  limit: z.coerce.number().int().min(1).max(100).default(50),

  cursor: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid cursor")
    .optional(),
});

export const getReviewsQuerySchema = z.strictObject({
  status: z
    .enum(["QUEUED", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"])
    .optional(),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  cursor: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid cursor")
    .optional(),
});

export const projectReviewsQuerySchema = z.strictObject({
  status: z
    .enum(["QUEUED", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"])
    .optional(),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  cursor: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid cursor")
    .optional(),
});
