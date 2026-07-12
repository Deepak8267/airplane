import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Experience } from "@airplane/shared";
import { getAnalyticsDashboard } from "@/features/analytics/analytics-service";
import type { AnalyticsDashboard } from "@/features/analytics/analytics-service";
import { getMyExperiences } from "@/features/experiences/experience-service";
import { getPlanUsage } from "@/features/subscriptions/subscription-service";
import type { PlanUsage } from "@/features/subscriptions/subscription-service";

const READ_STORAGE_KEY = "airplane:read-notifications";

export type CreatorNotificationType = "plan" | "activity" | "publish" | "draft" | "tip";

export type CreatorNotification = {
  id: string;
  type: CreatorNotificationType;
  title: string;
  body: string;
  createdAt: string;
  actionLabel: string;
  route: string;
  unread: boolean;
};

export type CreatorNotificationCenter = {
  notifications: CreatorNotification[];
  unreadCount: number;
};

export async function getCreatorNotifications(): Promise<CreatorNotificationCenter> {
  const [dashboard, planUsage, experiences, readIds] = await Promise.all([
    getAnalyticsDashboard().catch(() => null),
    getPlanUsage().catch(() => null),
    getMyExperiences().catch(() => []),
    getReadNotificationIds()
  ]);

  const notifications = buildNotifications({
    dashboard,
    experiences,
    planUsage
  })
    .map((notification) => ({
      ...notification,
      unread: !readIds.has(notification.id)
    }))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  return {
    notifications,
    unreadCount: notifications.filter((notification) => notification.unread).length
  };
}

export async function markAllNotificationsRead(notifications: CreatorNotification[]) {
  const existing = await getReadNotificationIds();
  notifications.forEach((notification) => existing.add(notification.id));
  await AsyncStorage.setItem(READ_STORAGE_KEY, JSON.stringify(Array.from(existing)));
}

async function getReadNotificationIds() {
  const raw = await AsyncStorage.getItem(READ_STORAGE_KEY);

  if (!raw) {
    return new Set<string>();
  }

  try {
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : []);
  } catch {
    return new Set<string>();
  }
}

function buildNotifications({
  dashboard,
  experiences,
  planUsage
}: {
  dashboard: AnalyticsDashboard | null;
  experiences: Experience[];
  planUsage: PlanUsage | null;
}): Array<Omit<CreatorNotification, "unread">> {
  const now = new Date().toISOString();
  const notifications: Array<Omit<CreatorNotification, "unread">> = [];
  const latestExperience = experiences[0];
  const latestDraft = experiences.find((experience) => !experience.isPublished && experience.status !== "archived");
  const latestPublished = experiences.find((experience) => experience.isPublished && experience.status === "published");

  if (planUsage?.plan === "free") {
    const used = planUsage.activeExperienceCount;
    const limit = planUsage.freeExperienceLimit;
    notifications.push({
      id: `plan-free-${used}-${limit}`,
      type: "plan",
      title: planUsage.remainingFreeExperiences === 0 ? "Free plan limit reached" : `${planUsage.remainingFreeExperiences} free creation${planUsage.remainingFreeExperiences === 1 ? "" : "s"} left`,
      body: planUsage.remainingFreeExperiences === 0
        ? "Archive an old draft or upgrade when payments are enabled to keep creating."
        : `You have used ${used} of ${limit} free experiences.`,
      createdAt: latestExperience?.updatedAt ?? now,
      actionLabel: "View plan",
      route: "/subscription"
    });
  }

  if (dashboard && dashboard.totals.views > 0) {
    notifications.push({
      id: `analytics-views-${dashboard.totals.views}`,
      type: "activity",
      title: `${formatNumber(dashboard.totals.views)} total view${dashboard.totals.views === 1 ? "" : "s"}`,
      body: `${formatNumber(dashboard.totals.uniqueVisitors)} unique visitor${dashboard.totals.uniqueVisitors === 1 ? "" : "s"} opened your published experiences.`,
      createdAt: latestPublished?.updatedAt ?? now,
      actionLabel: "Open analytics",
      route: "/analytics"
    });
  }

  if (dashboard && dashboard.totals.completions > 0) {
    notifications.push({
      id: `analytics-completions-${dashboard.totals.completions}`,
      type: "activity",
      title: `${formatNumber(dashboard.totals.completions)} completion${dashboard.totals.completions === 1 ? "" : "s"}`,
      body: `Your average completion rate is ${Math.round(dashboard.totals.completionRate)}%.`,
      createdAt: latestPublished?.updatedAt ?? now,
      actionLabel: "See details",
      route: "/analytics"
    });
  }

  if (dashboard && dashboard.totals.totalNoAttempts > 0) {
    notifications.push({
      id: `proposal-no-${dashboard.totals.totalNoAttempts}`,
      type: "activity",
      title: "Proposal interaction detected",
      body: `Recipients tried the moving NO button ${formatNumber(dashboard.totals.totalNoAttempts)} time${dashboard.totals.totalNoAttempts === 1 ? "" : "s"}.`,
      createdAt: latestPublished?.updatedAt ?? now,
      actionLabel: "View analytics",
      route: "/analytics"
    });
  }

  if (latestPublished?.slug) {
    notifications.push({
      id: `published-${latestPublished.id}-${latestPublished.publishedAt ?? latestPublished.updatedAt}`,
      type: "publish",
      title: "Experience is live",
      body: `${latestPublished.title} is published and ready to share.`,
      createdAt: latestPublished.publishedAt ?? latestPublished.updatedAt,
      actionLabel: "My creations",
      route: "/experiences"
    });
  }

  if (latestDraft) {
    notifications.push({
      id: `draft-${latestDraft.id}-${latestDraft.updatedAt}`,
      type: "draft",
      title: "Draft waiting for polish",
      body: `${latestDraft.title} is saved as a draft. Finish it whenever you are ready.`,
      createdAt: latestDraft.updatedAt,
      actionLabel: "Continue",
      route: "/experiences"
    });
  }

  if (notifications.length === 0) {
    notifications.push({
      id: "welcome-tip",
      type: "tip",
      title: "Create your first moment",
      body: "Pick a template, personalize the pages, then publish a link anyone can open.",
      createdAt: now,
      actionLabel: "Browse templates",
      route: "/templates"
    });
  }

  return notifications.slice(0, 8);
}

function formatNumber(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  }

  return String(value);
}
