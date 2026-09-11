import { z } from "zod";

const techNameSchema = z
  .string()
  .trim()
  .min(1, "Tech stack item cannot be empty")
  .max(50, "Tech stack item cannot exceed 50 characters");

const createTechListSchema = (label) =>
  z
    .array(techNameSchema)
    .max(20, `Maximum 20 ${label} are allowed`)
    .superRefine((items, ctx) => {
      const seen = new Set();

      items.forEach((item, index) => {
        const normalized = item.toLowerCase();

        if (seen.has(normalized)) {
          ctx.addIssue({
            code: "custom",
            path: [index],
            message: `Duplicate ${label.slice(0, -1)}: ${item}`,
          });
        }

        seen.add(normalized);
      });
    })
    .transform((items) =>
      items.map((name) => ({
        name,
      })),
    );

const techStackSchema = z.strictObject({
  languages: createTechListSchema("languages").optional().default([]),

  frameworks: createTechListSchema("frameworks").optional().default([]),
});

export const createProjectSchema = z.strictObject({
  name: z
    .string()
    .trim()
    .min(2, "Project name must be at least 2 characters")
    .max(100, "Project name cannot exceed 100 characters"),

  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional()
    .default(""),

  techStack: techStackSchema.optional().default({
    languages: [],
    frameworks: [],
  }),
});

export const getProjectsQuerySchema = z.strictObject({
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional().default("ACTIVE"),
  limit: z.coerce
    .number()
    .int("Limit must be an integer")
    .min(1, "Limit must be atleast 1")
    .max(50, "Limit cannot exceed 50")
    .optional()
    .default(20),

  cursor: z
    .string()
    .trim()
    .min(1, "Cursor cannot be empty")
    .max(500, "Invalid cursor")
    .optional(),
});

export const projectIdParamsSchema = z.strictObject({
  projectId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid project ID"),
});

export const updateProjectSchema = z
  .strictObject({
    name: z
      .string()
      .trim()
      .min(2, "Project name must be at least 2 characters")
      .max(100, "Project name cannot exceed 100 characters")
      .optional(),

    description: z
      .string()
      .trim()
      .max(1000, "Description cannot exceed 1000 characters")
      .optional(),

    techStack: z
      .strictObject({
        languages: createTechListSchema("languages").optional(),
        frameworks: createTechListSchema("frameworks").optional(),
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update the project",
  });
