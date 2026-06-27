import { mapSubscription } from "@airplane/supabase";
import type { Subscription, UserPlan } from "@airplane/shared";
import { supabase } from "@/lib/supabase";

export const FREE_EXPERIENCE_LIMIT = 3;

export type PlanUsage = {
  plan: UserPlan;
  status: Subscription["status"];
  activeExperienceCount: number;
  freeExperienceLimit: number;
  canCreateExperience: boolean;
  remainingFreeExperiences: number;
};

export async function getPlanUsage(): Promise<PlanUsage> {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;

  if (!userId) {
    return freeUsage(0);
  }

  const [subscriptionResult, experiencesResult] = await Promise.all([
    supabase.from("subscriptions").select("*").eq("user_id", userId).maybeSingle(),
    supabase
      .from("experiences")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .neq("status", "archived")
  ]);

  if (subscriptionResult.error) {
    throw new Error(subscriptionResult.error.message);
  }

  if (experiencesResult.error) {
    throw new Error(experiencesResult.error.message);
  }

  const subscription = subscriptionResult.data ? mapSubscription(subscriptionResult.data) : null;
  const plan = subscription?.plan ?? "free";
  const status = subscription?.status ?? "active";
  const activeExperienceCount = experiencesResult.count ?? 0;
  const canCreateExperience = plan === "pro" || activeExperienceCount < FREE_EXPERIENCE_LIMIT;

  return {
    plan,
    status,
    activeExperienceCount,
    freeExperienceLimit: FREE_EXPERIENCE_LIMIT,
    canCreateExperience,
    remainingFreeExperiences: Math.max(FREE_EXPERIENCE_LIMIT - activeExperienceCount, 0)
  };
}

function freeUsage(activeExperienceCount: number): PlanUsage {
  return {
    plan: "free",
    status: "active",
    activeExperienceCount,
    freeExperienceLimit: FREE_EXPERIENCE_LIMIT,
    canCreateExperience: activeExperienceCount < FREE_EXPERIENCE_LIMIT,
    remainingFreeExperiences: Math.max(FREE_EXPERIENCE_LIMIT - activeExperienceCount, 0)
  };
}
