export const TOTAL_STEPS = 4;

/**
 * Predefined avatars are currently disabled.
 * User avatars are handled separately through the profile/avatar flow.
 */
export const AVATAR_OPTIONS = [];

/**
 * Backend expects these exact enum values.
 */
export const PURPOSE_OPTIONS = [
  {
    value: "CODE_QUALITY",
    label: "Code Quality",
    description: "Write cleaner and more maintainable code.",
  },
  {
    value: "BUG_DETECTION",
    label: "Bug Detection",
    description: "Find bugs and potential issues before they reach production.",
  },
  {
    value: "LEARNING",
    label: "Learning",
    description: "Understand mistakes and improve your coding skills.",
  },
  {
    value: "PERSONAL_PROJECTS",
    label: "Personal Projects",
    description: "Build and improve your own projects.",
  },
  {
    value: "TEAM_PROJECTS",
    label: "Team Projects",
    description: "Improve collaboration and code quality in team projects.",
  },
  {
    value: "OTHER",
    label: "Other",
    description: "Something else you want to achieve with GenioCore.",
  },
];

export const EXPERIENCE_OPTIONS = [
  {
    value: "BEGINNER",
    label: "Beginner",
    description: "I'm still getting comfortable with programming.",
  },
  {
    value: "INTERMEDIATE",
    label: "Intermediate",
    description: "I can build projects and understand common concepts.",
  },
  {
    value: "ADVANCED",
    label: "Advanced",
    description: "I'm comfortable with complex systems and architecture.",
  },
  {
    value: "PROFESSIONAL",
    label: "Professional",
    description: "I regularly work on production-level software.",
  },
];

export const REFERRAL_OPTIONS = [
  {
    value: "GOOGLE",
    label: "Google",
  },
  {
    value: "LINKEDIN",
    label: "LinkedIn",
  },
  {
    value: "GITHUB",
    label: "GitHub",
  },
  {
    value: "YOUTUBE",
    label: "YouTube",
  },
  {
    value: "FRIEND_COLLEAGUE",
    label: "Friend / Colleague",
  },
  {
    value: "COMMUNITY_DISCORD",
    label: "Discord Community",
  },
  {
    value: "OTHER",
    label: "Other",
  },
];
