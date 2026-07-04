import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ExperiencePageType, Template, TemplateCategory } from "@airplane/shared";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createDraftExperience } from "@/features/experiences/experience-service";
import { getPlanUsage } from "@/features/subscriptions/subscription-service";
import { getTemplateById } from "@/features/templates/template-service";
import { useBuilderStore } from "@/stores/builder-store";

const FEATURE_COPY = ["Web link included", "Editable pages", "Analytics ready"];

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
      <SafeAreaView edges={["top"]} style={styles.centerScreen}>
        <View style={styles.loadingIcon}>
          <Ionicons color="#ec0e68" name="hourglass-outline" size={28} />
        </View>
        <Text style={styles.loadingTitle}>Loading template...</Text>
      </SafeAreaView>
    );
  }

  if (!templateQuery.data) {
    return (
      <SafeAreaView edges={["top"]} style={styles.centerScreen}>
        <View style={styles.loadingIcon}>
          <Ionicons color="#ec0e68" name="alert-circle-outline" size={28} />
        </View>
        <Text style={styles.loadingTitle}>Template unavailable</Text>
        <Text style={styles.emptyCopy}>{templateQuery.error instanceof Error ? templateQuery.error.message : "Try another template."}</Text>
      </SafeAreaView>
    );
  }

  const template = templateQuery.data;
  const usage = planUsageQuery.data;
  const premiumLocked = template.isPremium && usage?.plan !== "pro";
  const limitReached = usage?.canCreateExperience === false;
  const disabled = createDraftMutation.isPending || planUsageQuery.isLoading || limitReached || premiumLocked;

  return (
    <SafeAreaView edges={["top"]} style={[styles.screen, { backgroundColor: template.defaultTheme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable accessibilityLabel="Go back" style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons color="#101828" name="chevron-back" size={22} />
          </Pressable>
          {template.isPremium ? <Text style={styles.premiumBadge}>Premium</Text> : null}
        </View>

        <View style={styles.hero}>
          <View style={[styles.heroIcon, { backgroundColor: template.defaultTheme.muted }]}>
            <Ionicons color={template.defaultTheme.accent} name={getTemplateIcon(template.category)} size={44} />
          </View>
          <Text style={[styles.category, { color: template.defaultTheme.accent }]}>{template.category}</Text>
          <Text style={[styles.title, { color: template.defaultTheme.foreground }]}>{template.name}</Text>
          <Text style={styles.copy}>{template.description}</Text>
        </View>

        <View style={styles.featureGrid}>
          {FEATURE_COPY.map((feature) => (
            <View key={feature} style={styles.featureCard}>
              <Ionicons color={template.defaultTheme.accent} name="checkmark-circle-outline" size={20} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Included flow</Text>
            <Text style={styles.sectionMeta}>{template.defaultPages.length} pages</Text>
          </View>
          <View style={styles.timeline}>
            {template.defaultPages.map((page, index) => (
              <View key={`${page.pageType}-${index}`} style={styles.pageRow}>
                <View style={[styles.pageIcon, { backgroundColor: template.defaultTheme.muted }]}>
                  <Ionicons color={template.defaultTheme.accent} name={getPageIcon(page.pageType)} size={19} />
                </View>
                <View style={styles.pageCopy}>
                  <Text style={styles.pageType}>{page.pageType}</Text>
                  <Text style={styles.pageTitle}>{page.title}</Text>
                </View>
                <Text style={styles.pageIndex}>{index + 1}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theme</Text>
          <View style={styles.themeRow}>
            <View style={[styles.themeSwatch, { backgroundColor: template.defaultTheme.background }]} />
            <View style={[styles.themeSwatch, { backgroundColor: template.defaultTheme.muted }]} />
            <View style={[styles.themeSwatch, { backgroundColor: template.defaultTheme.accent }]} />
            <Text style={styles.themeName}>{template.defaultTheme.name}</Text>
          </View>
        </View>

        {usage ? (
          <View style={styles.planNotice}>
            <View style={styles.planIcon}>
              <Ionicons color="#ec0e68" name={usage.plan === "pro" ? "diamond-outline" : "card-outline"} size={20} />
            </View>
            <View style={styles.planCopy}>
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
          </View>
        ) : null}

        {createDraftMutation.error instanceof Error ? <Text style={styles.error}>{createDraftMutation.error.message}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={[styles.button, { opacity: disabled ? 0.7 : 1 }]} onPress={start} disabled={disabled}>
          <Ionicons color="#ffffff" name={createDraftMutation.isPending ? "hourglass-outline" : "rocket-outline"} size={20} />
          <Text style={styles.buttonText}>
            {createDraftMutation.isPending
              ? "Creating draft..."
              : premiumLocked
                ? "Pro template"
                : limitReached
                  ? "Free limit reached"
                  : "Use this template"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function getTemplateIcon(category: TemplateCategory): keyof typeof Ionicons.glyphMap {
  if (category === "birthday") {
    return "gift-outline";
  }

  if (category === "friends") {
    return "people-outline";
  }

  if (category === "family") {
    return "home-outline";
  }

  if (category === "fun") {
    return "sparkles-outline";
  }

  return "heart-outline";
}

function getPageIcon(pageType: ExperiencePageType): keyof typeof Ionicons.glyphMap {
  if (pageType === "cover") {
    return "sparkles-outline";
  }

  if (pageType === "memory") {
    return "image-outline";
  }

  if (pageType === "quiz") {
    return "help-circle-outline";
  }

  if (pageType === "countdown") {
    return "timer-outline";
  }

  if (pageType === "proposal") {
    return "heart-outline";
  }

  return "checkmark-circle-outline";
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centerScreen: { flex: 1, padding: 24, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: "#fff7fb" },
  loadingIcon: { width: 58, height: 58, borderRadius: 8, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#fbcfe8", alignItems: "center", justifyContent: "center" },
  loadingTitle: { color: "#101828", fontSize: 24, lineHeight: 30, fontWeight: "900", textAlign: "center" },
  emptyCopy: { color: "#667085", lineHeight: 21, textAlign: "center" },
  content: { gap: 14, padding: 20, paddingBottom: 116 },
  topBar: { paddingTop: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconButton: { width: 42, height: 42, borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center" },
  premiumBadge: { overflow: "hidden", borderRadius: 8, backgroundColor: "#ec0e68", color: "#ffffff", paddingHorizontal: 10, paddingVertical: 7, fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  hero: { gap: 10, borderRadius: 8, borderWidth: 1, borderColor: "#ffffff", backgroundColor: "rgba(255,255,255,0.78)", padding: 18 },
  heroIcon: { width: 92, height: 92, borderRadius: 8, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  category: { fontSize: 13, fontWeight: "900", textTransform: "uppercase" },
  title: { fontSize: 34, lineHeight: 40, fontWeight: "900" },
  copy: { fontSize: 16, lineHeight: 24, color: "#475467" },
  featureGrid: { flexDirection: "row", gap: 8 },
  featureCard: { flex: 1, minHeight: 78, borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", padding: 10, gap: 7, justifyContent: "center" },
  featureText: { color: "#101828", fontSize: 12, lineHeight: 16, fontWeight: "900" },
  section: { gap: 12, borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", padding: 14 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  sectionTitle: { color: "#101828", fontSize: 18, fontWeight: "900" },
  sectionMeta: { color: "#667085", fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  timeline: { gap: 10 },
  pageRow: { minHeight: 62, flexDirection: "row", alignItems: "center", gap: 11, borderRadius: 8, backgroundColor: "#fff7fb", padding: 10 },
  pageIcon: { width: 42, height: 42, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  pageCopy: { flex: 1, minWidth: 0, gap: 2 },
  pageType: { color: "#667085", fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  pageTitle: { color: "#101828", fontSize: 15, lineHeight: 19, fontWeight: "900" },
  pageIndex: { color: "#98a2b3", fontSize: 16, fontWeight: "900" },
  themeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  themeSwatch: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: "#d0d5dd" },
  themeName: { color: "#101828", fontWeight: "900" },
  planNotice: { flexDirection: "row", gap: 11, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff" },
  planIcon: { width: 40, height: 40, borderRadius: 8, backgroundColor: "#fff0f6", alignItems: "center", justifyContent: "center" },
  planCopy: { flex: 1, minWidth: 0, gap: 4 },
  planNoticeTitle: { color: "#101828", fontWeight: "900" },
  planNoticeCopy: { color: "#344054", lineHeight: 20 },
  error: { color: "#b42318", lineHeight: 20 },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 20, paddingTop: 12, backgroundColor: "rgba(255,247,251,0.94)", borderTopWidth: 1, borderTopColor: "#fbcfe8" },
  button: { height: 54, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: "#ec0e68", flexDirection: "row", gap: 8 },
  buttonText: { color: "#ffffff", fontSize: 16, fontWeight: "900" }
});
