import { z } from "zod";

export const onboardingSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(5, "Username must be at least 5 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(
      /^[a-z0-9_]+$/,
      "Username can only contain lowercase letters, numbers, and underscores",
    ),

  purposes: z
    .array(
      z.enum([
        "CODE_QUALITY",
        "BUG_DETECTION",
        "LEARNING",
        "PERSONAL_PROJECTS",
        "TEAM_PROJECTS",
        "OTHER",
      ]),
    )
    .min(1, "Please select at least one purpose")
    .max(3, "You can select up to 3 purposes"),

  experienceLevel: z.enum([
    "BEGINNER",
    "INTERMEDIATE",
    "ADVANCED",
    "PROFESSIONAL",
  ]),

  referralSource: z
    .enum([
      "GOOGLE",
      "LINKEDIN",
      "GITHUB",
      "YOUTUBE",
      "FRIEND_COLLEAGUE",
      "COMMUNITY_DISCORD",
      "OTHER",
    ])
    .optional()
    .nullable(),
});
