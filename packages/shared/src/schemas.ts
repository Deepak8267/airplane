import { z } from "zod";

export const themeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  background: z.string().min(1),
  foreground: z.string().min(1),
  accent: z.string().min(1),
  muted: z.string().min(1),
  fontFamily: z.enum(["serif", "sans", "rounded"])
});

export const experienceUpsertSchema = z.object({
  title: z.string().min(1).max(120),
  recipientName: z.string().min(1).max(80),
  message: z.string().max(1200),
  theme: themeSchema,
  coverPhotoUrl: z.string().url().nullable()
});

export const trackEventSchema = z.object({
  experienceId: z.string().uuid(),
  visitorId: z.string().min(8).max(128),
  sessionId: z.string().min(8).max(128),
  eventType: z.enum([
    "experience_viewed",
    "page_viewed",
    "button_clicked",
    "quiz_answered",
    "proposal_no_attempted",
    "proposal_answered_yes",
    "proposal_answered_no",
    "experience_completed"
  ]),
  pageId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional()
});
