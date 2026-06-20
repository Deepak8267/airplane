import type { TemplateCategory, TemplateType, Theme } from "./types";

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  "love",
  "birthday",
  "friends",
  "family",
  "fun"
];

export const MVP_TEMPLATE_TYPES: TemplateType[] = [
  "date_proposal",
  "marriage_proposal",
  "birthday_surprise",
  "birthday_memory_book",
  "friendship_quiz",
  "best_friend_challenge",
  "family_memories",
  "mystery_reveal"
];

export const FREE_PLAN_EXPERIENCE_LIMIT = 3;
export const PUBLIC_EXPERIENCE_PATH = "/e";

export const EXPERIENCE_THEMES: Theme[] = [
  {
    id: "rose",
    name: "Rose",
    background: "#fff7f5",
    foreground: "#2f1b1b",
    accent: "#e85d75",
    muted: "#f7d8dc",
    fontFamily: "serif"
  },
  {
    id: "champagne",
    name: "Champagne",
    background: "#fffaf0",
    foreground: "#2b2118",
    accent: "#c9973f",
    muted: "#f0dfb8",
    fontFamily: "serif"
  },
  {
    id: "mint",
    name: "Mint",
    background: "#f4fff8",
    foreground: "#10231b",
    accent: "#10b981",
    muted: "#bbf7d0",
    fontFamily: "rounded"
  },
  {
    id: "midnight",
    name: "Midnight",
    background: "#17181f",
    foreground: "#f8fafc",
    accent: "#f5b942",
    muted: "#30323d",
    fontFamily: "sans"
  },
  {
    id: "confetti",
    name: "Confetti",
    background: "#fffdf7",
    foreground: "#1d2939",
    accent: "#7f56d9",
    muted: "#f4ebff",
    fontFamily: "rounded"
  },
  {
    id: "lagoon",
    name: "Lagoon",
    background: "#effbff",
    foreground: "#123047",
    accent: "#0e7490",
    muted: "#cceff7",
    fontFamily: "sans"
  }
];
