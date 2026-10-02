import { z } from "zod";
import { REVIEW_ISSUE_CATEGORIES, REVIEW_ISSUE_SEVERITIES } from "../constants/review.constants.js";

const scoreSchema = z.number().int().min(0).max(100);

const issueSchema = z.strictObject({
  category: z.enum(REVIEW_ISSUE_CATEGORIES),
  severity: z.enum(REVIEW_ISSUE_SEVERITIES),
  title: z.string().trim().min(3).max(300),
  description: z.string().trim().min(1).max(5000),
  recommendation: z
    .string()
    .trim()
    .max(5000)
    .nullable()
    .optional()
    .default(null),
  location: z
    .strictObject({
      filePath: z.string().trim().max(1000).nullable().optional().default(null),
      lineStart: z.number().int().min(1).nullable().optional().default(null),
      lineEnd: z.number().int().min(1).nullable().optional().default(null),
      symbol: z.string().trim().max(300).nullable().optional().default(null),
    })
    .nullable()
    .optional()
    .default(null),
  codeSnippet: z.string().max(8000).nullable().optional().default(null),
  ruleId: z.string().trim().max(100).nullable().optional().default(null),
  confidence: z.number().min(0).max(1).nullable().optional().default(null),
});

export const reviewOutputSchema = z.strictObject({
  summary: z.string().trim().min(1).max(10000),
  scores: z.strictObject({
    overall: scoreSchema,
    security: scoreSchema,
    performance: scoreSchema,
    maintainability: scoreSchema,
    reliability: scoreSchema,
  }),
  issues: z.array(issueSchema).max(500),
});
