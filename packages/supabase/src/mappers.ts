import type { Experience, ExperiencePage, Subscription, Template, Theme } from "@airplane/shared";
import type { Database } from "./database.types";

type TemplateRow = Database["public"]["Tables"]["templates"]["Row"];
type ExperienceRow = Database["public"]["Tables"]["experiences"]["Row"];
type PageRow = Database["public"]["Tables"]["experience_pages"]["Row"];
type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];

export function mapTemplate(row: TemplateRow): Template {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category as Template["category"],
    description: row.description,
    thumbnailUrl: row.thumbnail_url,
    isPremium: row.is_premium,
    templateType: row.template_type as Template["templateType"],
    defaultTheme: row.default_theme as Theme,
    defaultPages: row.default_pages as Template["defaultPages"],
    isActive: row.is_active
  };
}

export function mapExperience(row: ExperienceRow): Experience {
  return {
    id: row.id,
    userId: row.user_id,
    templateId: row.template_id,
    title: row.title,
    recipientName: row.recipient_name,
    message: row.message,
    theme: row.theme as Theme,
    coverPhotoUrl: row.cover_photo_url,
    slug: row.slug,
    status: row.status as Experience["status"],
    isPublished: row.is_published,
    publishedAt: row.published_at,
    watermarkEnabled: row.watermark_enabled,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapExperiencePage(row: PageRow): ExperiencePage {
  return {
    id: row.id,
    experienceId: row.experience_id,
    pageType: row.page_type as ExperiencePage["pageType"],
    position: row.position,
    title: row.title,
    content: row.content as ExperiencePage["content"],
    mediaUrls: row.media_urls,
    settings: row.settings as Record<string, unknown>,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapSubscription(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    userId: row.user_id,
    plan: row.plan as Subscription["plan"],
    status: row.status as Subscription["status"],
    razorpaySubscriptionId: row.razorpay_subscription_id,
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
