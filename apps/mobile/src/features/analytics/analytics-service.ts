import { mapExperience } from "@airplane/supabase";
import type { Json } from "@airplane/supabase";
import type { AnalyticsSummary, Experience } from "@airplane/shared";
import { supabase } from "@/lib/supabase";

export type AnalyticsActivity = {
  id: string;
  eventType: string;
  createdAt: string;
  metadata: Record<string, unknown>;
};

export type ExperienceAnalytics = {
  experience: Experience;
  summary: AnalyticsSummary;
  recentActivity: AnalyticsActivity[];
};

export async function getExperienceAnalytics(experienceId: string): Promise<ExperienceAnalytics> {
  const [experienceResult, analyticsResult, eventsResult] = await Promise.all([
    supabase.from("experiences").select("*").eq("id", experienceId).single(),
    supabase.from("analytics").select("*").eq("experience_id", experienceId).maybeSingle(),
    supabase
      .from("events")
      .select("id,event_type,created_at,metadata")
      .eq("experience_id", experienceId)
      .order("created_at", { ascending: false })
      .limit(20)
  ]);

  if (experienceResult.error) {
    throw new Error(experienceResult.error.message);
  }

  if (analyticsResult.error) {
    throw new Error(analyticsResult.error.message);
  }

  if (eventsResult.error) {
    throw new Error(eventsResult.error.message);
  }

  const row = analyticsResult.data;
  const views = row?.views ?? 0;
  const completions = row?.completions ?? 0;

  return {
    experience: mapExperience(experienceResult.data),
    summary: {
      experienceId,
      views,
      uniqueVisitors: row?.unique_visitors ?? 0,
      completions,
      completionRate: views > 0 ? Math.min((completions / views) * 100, 100) : 0,
      averageCompletionTimeSeconds: Number(row?.average_completion_time_seconds ?? 0),
      totalNoAttempts: row?.total_no_attempts ?? 0
    },
    recentActivity: (eventsResult.data ?? []).map((event) => ({
      id: event.id,
      eventType: event.event_type,
      createdAt: event.created_at,
      metadata: toMetadata(event.metadata)
    }))
  };
}

function toMetadata(value: Json): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
