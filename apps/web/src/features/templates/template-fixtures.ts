import type { Template } from "@airplane/shared";

export const templateFixtures: Template[] = [
  {
    id: "date-proposal",
    name: "Date Proposal",
    slug: "date-proposal",
    category: "love",
    description: "A warm, playful invite for a special date.",
    thumbnailUrl: null,
    isPremium: false,
    templateType: "date_proposal",
    defaultTheme: {
      id: "rose",
      name: "Rose",
      background: "#fff7f5",
      foreground: "#2f1b1b",
      accent: "#e85d75",
      muted: "#f7d8dc",
      fontFamily: "serif"
    },
    defaultPages: [
      { pageType: "cover", title: "A little question", content: { body: "I made something for you." }, mediaUrls: [], settings: {} },
      { pageType: "proposal", title: "Will you go on a date with me?", content: { question: "Will you go on a date with me?" }, mediaUrls: [], settings: {} },
      { pageType: "final", title: "Can't wait", content: { finalMessage: "This is going to be lovely." }, mediaUrls: [], settings: {} }
    ],
    isActive: true
  },
  {
    id: "marriage-proposal",
    name: "Marriage Proposal",
    slug: "marriage-proposal",
    category: "love",
    description: "A proposal flow with a moving NO button and full analytics.",
    thumbnailUrl: null,
    isPremium: true,
    templateType: "marriage_proposal",
    defaultTheme: {
      id: "champagne",
      name: "Champagne",
      background: "#fffaf0",
      foreground: "#2b2118",
      accent: "#c9973f",
      muted: "#f0dfb8",
      fontFamily: "serif"
    },
    defaultPages: [
      { pageType: "cover", title: "For us", content: { body: "Every memory brought me here." }, mediaUrls: [], settings: {} },
      { pageType: "memory", title: "My favorite memory", content: { body: "Add the moment that says everything." }, mediaUrls: [], settings: {} },
      { pageType: "proposal", title: "Will You Marry Me?", content: { question: "Will You Marry Me?" }, mediaUrls: [], settings: { moveNoButton: true } },
      { pageType: "final", title: "Forever starts here", content: { finalMessage: "You said yes." }, mediaUrls: [], settings: {} }
    ],
    isActive: true
  }
];
