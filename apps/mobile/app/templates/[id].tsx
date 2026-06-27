import { router, useLocalSearchParams } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { createDraftExperience } from "@/features/experiences/experience-service";
import { getPlanUsage } from "@/features/subscriptions/subscription-service";
import { getTemplateById } from "@/features/templates/template-service";
import { useBuilderStore } from "@/stores/builder-store";

export default function TemplateDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const templateQuery = useQuery({
    queryKey: ["template", id],
    queryFn: () => getTemplateById(id),
    enabled: Boolean(id)
  });
  const planUsageQuery = useQuery({
    queryKey: ["plan-usage"],
    queryFn: getPlanUsage
  });
  const startFromExperience = useBuilderStore((state) => state.startFromExperience);
  const createDraftMutation = useMutation({
    mutationFn: createDraftExperience,
    onSuccess: ({ experience, pages }) => {
      void queryClient.invalidateQueries({ queryKey: ["plan-usage"] });
      void queryClient.invalidateQueries({ queryKey: ["my-experiences"] });
      startFromExperience(experience, pages);
      router.push("/builder");
    }
  });

  function start() {
    if (templateQuery.data && planUsageQuery.data?.canCreateExperience !== false) {
      createDraftMutation.mutate(templateQuery.data);
    }
  }

  if (templateQuery.isLoading) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>Loading template...</Text>
      </View>
    );
  }

  if (!templateQuery.data) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>Template unavailable</Text>
        <Text style={styles.copy}>{templateQuery.error instanceof Error ? templateQuery.error.message : "Try another template."}</Text>
      </View>
    );
  }

  const template = templateQuery.data;
  const usage = planUsageQuery.data;
  const premiumLocked = template.isPremium && usage?.plan !== "pro";
  const limitReached = usage?.canCreateExperience === false;
  const disabled = createDraftMutation.isPending || planUsageQuery.isLoading || limitReached || premiumLocked;

  return (
    <View style={[styles.screen, { backgroundColor: template.defaultTheme.background }]}>
      <View style={styles.panel}>
        <Text style={styles.category}>{template.category}</Text>
        <Text style={styles.title}>{template.name}</Text>
        <Text style={styles.copy}>{template.description}</Text>
        <Text style={styles.meta}>{template.defaultPages.length} pages included</Text>
        {usage ? (
          <View style={styles.planNotice}>
            <Text style={styles.planNoticeTitle}>{usage.plan === "pro" ? "Pro plan" : "Free plan"}</Text>
            <Text style={styles.planNoticeCopy}>
              {premiumLocked
                ? "This premium template will unlock when Pro payments are enabled."
                : usage.plan === "pro"
                ? "Unlimited experiences are enabled."
                : limitReached
                  ? "You have used all 3 free experiences. Archive one experience or upgrade when payments are enabled."
                  : `${usage.remainingFreeExperiences} free experience${usage.remainingFreeExperiences === 1 ? "" : "s"} remaining.`}
            </Text>
          </View>
        ) : null}
        {createDraftMutation.error instanceof Error ? <Text style={styles.error}>{createDraftMutation.error.message}</Text> : null}
        <Pressable style={[styles.button, { backgroundColor: template.defaultTheme.accent, opacity: disabled ? 0.7 : 1 }]} onPress={start} disabled={disabled}>
          <Text style={styles.buttonText}>
            {createDraftMutation.isPending
              ? "Creating draft..."
              : premiumLocked
                ? "Pro template"
                : limitReached
                  ? "Free limit reached"
                  : "Use template"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20, justifyContent: "center" },
  panel: { gap: 14, padding: 20, backgroundColor: "#ffffff", borderRadius: 8, borderWidth: 1, borderColor: "#eaecf0" },
  category: { fontSize: 13, color: "#2563eb", fontWeight: "800", textTransform: "uppercase" },
  title: { fontSize: 32, lineHeight: 38, color: "#101828", fontWeight: "900" },
  copy: { fontSize: 16, lineHeight: 23, color: "#475467" },
  meta: { color: "#667085", fontWeight: "700" },
  planNotice: { gap: 5, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#dbeafe", backgroundColor: "#eff6ff" },
  planNoticeTitle: { color: "#101828", fontWeight: "900" },
  planNoticeCopy: { color: "#344054", lineHeight: 20 },
  error: { color: "#b42318", lineHeight: 20 },
  button: { height: 52, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  buttonText: { color: "#ffffff", fontSize: 16, fontWeight: "800" }
});
