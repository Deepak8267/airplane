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

export type AnalyticsInsights = {
  completionRate: number;
  averageNoAttemptsPerView: number;
  averageNoAttemptsPerProposalAnswer: number;
  proposalYesAnswers: number;
  proposalNoAnswers: number;
  quizAnswers: number;
  buttonClicks: number;
};

export type ExperienceAnalytics = {
  experience: Experience;
  summary: AnalyticsSummary;
  insights: AnalyticsInsights;
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
      .limit(100)
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
  const events = (eventsResult.data ?? []).map((event) => ({
    id: event.id,
    eventType: event.event_type,
    createdAt: event.created_at,
    metadata: toMetadata(event.metadata)
  }));
  const proposalYesAnswers = events.filter((event) => event.eventType === "proposal_answered_yes").length;
  const proposalNoAnswers = events.filter((event) => event.eventType === "proposal_answered_no").length;
  const proposalAnswers = proposalYesAnswers + proposalNoAnswers;
  const totalNoAttempts = row?.total_no_attempts ?? events.filter((event) => event.eventType === "proposal_no_attempted").length;

  return {
    experience: mapExperience(experienceResult.data),
    summary: {
      experienceId,
      views,
      uniqueVisitors: row?.unique_visitors ?? 0,
      completions,
      completionRate: getRate(completions, views),
      averageCompletionTimeSeconds: Number(row?.average_completion_time_seconds ?? 0),
      totalNoAttempts
    },
    insights: {
      completionRate: getRate(completions, views),
      averageNoAttemptsPerView: views > 0 ? totalNoAttempts / views : 0,
      averageNoAttemptsPerProposalAnswer: proposalAnswers > 0 ? totalNoAttempts / proposalAnswers : 0,
      proposalYesAnswers,
      proposalNoAnswers,
      quizAnswers: events.filter((event) => event.eventType === "quiz_answered").length,
      buttonClicks: events.filter((event) => event.eventType === "button_clicked").length
    },
    recentActivity: events.slice(0, 25)
  };
}

function toMetadata(value: Json): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function getRate(numerator: number, denominator: number) {
  if (denominator <= 0) {
    return 0;
  }

  return Math.max(0, Math.min((numerator / denominator) * 100, 100));
}
