export type UserPlan = "free" | "pro";
export type SubscriptionStatus = "active" | "inactive" | "cancelled" | "past_due";
export type ExperienceStatus = "draft" | "published" | "archived";
export type TemplateCategory = "love" | "birthday" | "friends" | "family" | "fun";

export type TemplateType =
  | "date_proposal"
  | "marriage_proposal"
  | "birthday_surprise"
  | "birthday_memory_book"
  | "friendship_quiz"
  | "best_friend_challenge"
  | "family_memories"
  | "mystery_reveal";

export type ExperiencePageType = "cover" | "memory" | "quiz" | "countdown" | "proposal" | "final";

export type EventType =
  | "experience_viewed"
  | "page_viewed"
  | "button_clicked"
  | "quiz_answered"
  | "proposal_no_attempted"
  | "proposal_answered_yes"
  | "proposal_answered_no"
  | "experience_completed";

export type Theme = {
  id: string;
  name: string;
  background: string;
  foreground: string;
  accent: string;
  muted: string;
  fontFamily: "serif" | "sans" | "rounded";
};

export type Template = {
  id: string;
  name: string;
  slug: string;
  category: TemplateCategory;
  description: string;
  thumbnailUrl: string | null;
  isPremium: boolean;
  templateType: TemplateType;
  defaultTheme: Theme;
  defaultPages: ExperiencePageDraft[];
  isActive: boolean;
};

export type Experience = {
  id: string;
  userId: string;
  templateId: string;
  title: string;
  recipientName: string;
  message: string;
  theme: Theme;
  coverPhotoUrl: string | null;
  slug: string | null;
  status: ExperienceStatus;
  isPublished: boolean;
  publishedAt: string | null;
  watermarkEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Subscription = {
  id: string;
  userId: string;
  plan: UserPlan;
  status: SubscriptionStatus;
  razorpaySubscriptionId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ExperiencePageDraft = {
  pageType: ExperiencePageType;
  title: string;
  content: PageContent;
  mediaUrls: string[];
  settings: Record<string, unknown>;
};

export type ExperiencePage = ExperiencePageDraft & {
  id: string;
  experienceId: string;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type PageContent = {
  body?: string;
  question?: string;
  answers?: QuizAnswer[];
  targetDate?: string;
  ctaLabel?: string;
  finalMessage?: string;
};

export type QuizAnswer = {
  id: string;
  label: string;
  isCorrect?: boolean;
};

export type PublicExperiencePayload = {
  experience: Experience;
  pages: ExperiencePage[];
};

export type AnalyticsSummary = {
  experienceId: string;
  views: number;
  uniqueVisitors: number;
  completions: number;
  completionRate: number;
  averageCompletionTimeSeconds: number;
  totalNoAttempts: number;
};

export type TrackEventInput = {
  experienceId: string;
  visitorId: string;
  sessionId: string;
  eventType: EventType;
  pageId?: string;
  metadata?: Record<string, unknown>;
};
