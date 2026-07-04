import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNav } from "@/components/bottom-nav";
import { getAnalyticsDashboard } from "@/features/analytics/analytics-service";

const FONT = {
  regular: "Poppins_400Regular",
  medium: "Poppins_500Medium",
  semibold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold"
};

export default function AnalyticsDashboardScreen() {
  const dashboardQuery = useQuery({
    queryKey: ["analytics-dashboard"],
    queryFn: getAnalyticsDashboard
  });
  const dashboard = dashboardQuery.data;

  return (
    <SafeAreaView edges={["top"]} style={styles.shell}>
      <FlatList
        data={dashboard?.items ?? []}
        keyExtractor={(item) => item.experience.id}
        refreshControl={<RefreshControl refreshing={dashboardQuery.isRefetching} onRefresh={() => dashboardQuery.refetch()} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.headerStack}>
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Ionicons color="#ec0e68" name="bar-chart-outline" size={18} />
              </View>
              <Text style={styles.eyebrow}>Analytics dashboard</Text>
              <Text style={styles.title}>Track reactions that matter.</Text>
              <Text style={styles.subtitle}>Views, completions, and proposal interactions across all published experiences.</Text>
            </View>

            <View style={styles.metricGrid}>
              <Metric icon="eye-outline" label="Total views" value={formatNumber(dashboard?.totals.views ?? 0)} />
              <Metric icon="people-outline" label="Visitors" value={formatNumber(dashboard?.totals.uniqueVisitors ?? 0)} />
              <Metric icon="checkmark-circle-outline" label="Completions" value={formatNumber(dashboard?.totals.completions ?? 0)} />
              <Metric icon="trending-up-outline" label="Complete rate" value={formatPercent(dashboard?.totals.completionRate ?? 0)} />
            </View>

            <View style={styles.insightBand}>
              <View style={styles.insightItem}>
                <Text style={styles.insightLabel}>Avg time</Text>
                <Text style={styles.insightValue}>{formatDuration(dashboard?.totals.averageCompletionTimeSeconds ?? 0)}</Text>
              </View>
              <View style={styles.insightDivider} />
              <View style={styles.insightItem}>
                <Text style={styles.insightLabel}>NO attempts</Text>
                <Text style={styles.insightValue}>{formatNumber(dashboard?.totals.totalNoAttempts ?? 0)}</Text>
              </View>
            </View>

            {dashboardQuery.isLoading ? <Text style={styles.stateText}>Loading analytics...</Text> : null}
            {dashboardQuery.error instanceof Error ? <Text style={styles.error}>{dashboardQuery.error.message}</Text> : null}

            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Published experiences</Text>
              <Text style={styles.sectionCount}>{dashboard?.totals.publishedExperiences ?? 0}</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          !dashboardQuery.isLoading ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Ionicons color="#ec0e68" name="bar-chart-outline" size={22} />
              </View>
              <Text style={styles.emptyTitle}>No published analytics yet</Text>
              <Text style={styles.emptyCopy}>Publish an experience and open its link to start collecting analytics.</Text>
              <Pressable style={styles.primaryButton} onPress={() => router.push("/home" as never)}>
                <Ionicons color="#ffffff" name="sparkles-outline" size={15} />
                <Text style={styles.primaryButtonText}>Create experience</Text>
              </Pressable>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.experienceCard}
            onPress={() => router.push({ pathname: "/analytics/[id]", params: { id: item.experience.id } } as never)}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: item.experience.theme.muted }]}>
                <Ionicons color="#ec0e68" name="paper-plane-outline" size={17} />
              </View>
              <View style={styles.cardTitleBlock}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.experience.title}</Text>
                <Text style={styles.cardSubtitle} numberOfLines={1}>{item.experience.recipientName || "No recipient"}</Text>
              </View>
              <Ionicons color="#98a2b3" name="chevron-forward" size={18} />
            </View>
            <View style={styles.cardStats}>
              <SmallStat label="Views" value={formatNumber(item.summary.views)} />
              <SmallStat label="Visitors" value={formatNumber(item.summary.uniqueVisitors)} />
              <SmallStat label="Complete" value={formatPercent(item.summary.completionRate)} />
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.cardFooterText}>Avg time {formatDuration(item.summary.averageCompletionTimeSeconds)}</Text>
              <Text style={styles.cardFooterText}>NO attempts {formatNumber(item.summary.totalNoAttempts)}</Text>
            </View>
          </Pressable>
        )}
      />
      <BottomNav active="analytics" />
    </SafeAreaView>
  );
}

function Metric({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Ionicons color="#ec0e68" name={icon} size={17} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.smallStat}>
      <Text style={styles.smallStatValue}>{value}</Text>
      <Text style={styles.smallStatLabel}>{label}</Text>
    </View>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function formatDuration(seconds: number) {
  if (seconds <= 0) {
    return "0s";
  }

  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: "#ffffff" },
  list: { gap: 12, paddingHorizontal: 14, paddingTop: 4, paddingBottom: 88 },
  headerStack: { gap: 12 },
  header: { gap: 3, paddingTop: 0 },
  headerIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#fbcfe8", alignItems: "center", justifyContent: "center", marginBottom: 2 },
  eyebrow: { color: "#ec0e68", fontFamily: FONT.semibold, fontSize: 10, lineHeight: 13, textTransform: "uppercase" },
  title: { color: "#101828", fontFamily: FONT.bold, fontSize: 22, lineHeight: 25 },
  subtitle: { color: "#667085", fontFamily: FONT.regular, fontSize: 10, lineHeight: 14 },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metricCard: { minWidth: 130, flexBasis: "47%", flexGrow: 1, minHeight: 76, borderRadius: 14, borderWidth: 1, borderColor: "#f3f4f6", backgroundColor: "#ffffff", padding: 10, justifyContent: "space-between" },
  metricValue: { color: "#101828", fontFamily: FONT.bold, fontSize: 17, lineHeight: 21 },
  metricLabel: { color: "#667085", fontFamily: FONT.medium, fontSize: 9, lineHeight: 12, textTransform: "uppercase" },
  insightBand: { minHeight: 56, borderRadius: 14, borderWidth: 1, borderColor: "#f3f4f6", backgroundColor: "#ffffff", flexDirection: "row", alignItems: "center", padding: 10 },
  insightItem: { flex: 1, gap: 2 },
  insightDivider: { width: 1, alignSelf: "stretch", backgroundColor: "#f3f4f6", marginHorizontal: 8 },
  insightLabel: { color: "#667085", fontFamily: FONT.medium, fontSize: 9, lineHeight: 12, textTransform: "uppercase" },
  insightValue: { color: "#101828", fontFamily: FONT.bold, fontSize: 16, lineHeight: 20 },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { color: "#101828", fontFamily: FONT.semibold, fontSize: 16, lineHeight: 21 },
  sectionCount: { overflow: "hidden", borderRadius: 10, backgroundColor: "#fff1f7", color: "#ec0e68", paddingHorizontal: 8, paddingVertical: 4, fontFamily: FONT.semibold, fontSize: 10 },
  experienceCard: { gap: 8, borderRadius: 14, borderWidth: 1, borderColor: "#f3f4f6", backgroundColor: "#ffffff", padding: 10 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: "#fff1f7", alignItems: "center", justifyContent: "center" },
  cardTitleBlock: { flex: 1, gap: 2 },
  cardTitle: { color: "#101828", fontFamily: FONT.semibold, fontSize: 13, lineHeight: 17 },
  cardSubtitle: { color: "#667085", fontFamily: FONT.regular, fontSize: 10, lineHeight: 13 },
  cardStats: { flexDirection: "row", gap: 6 },
  smallStat: { flex: 1, minHeight: 46, borderRadius: 10, backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#eaecf0", padding: 7, justifyContent: "space-between" },
  smallStatValue: { color: "#101828", fontFamily: FONT.bold, fontSize: 13, lineHeight: 16 },
  smallStatLabel: { color: "#667085", fontFamily: FONT.medium, fontSize: 8, lineHeight: 10, textTransform: "uppercase" },
  cardFooter: { flexDirection: "row", gap: 6 },
  cardFooterText: { flex: 1, overflow: "hidden", borderRadius: 10, backgroundColor: "#fff7fb", color: "#667085", paddingHorizontal: 8, paddingVertical: 6, fontFamily: FONT.medium, fontSize: 9 },
  emptyCard: { gap: 8, alignItems: "center", borderRadius: 14, borderWidth: 1, borderColor: "#f3f4f6", backgroundColor: "#ffffff", padding: 14 },
  emptyIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#fff0f6", alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: "#101828", fontFamily: FONT.semibold, fontSize: 14, lineHeight: 18, textAlign: "center" },
  emptyCopy: { color: "#667085", fontFamily: FONT.regular, fontSize: 11, lineHeight: 16, textAlign: "center" },
  primaryButton: { alignSelf: "stretch", height: 38, borderRadius: 13, backgroundColor: "#ec0e68", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 7 },
  primaryButtonText: { color: "#ffffff", fontFamily: FONT.semibold, fontSize: 12 },
  stateText: { color: "#667085", fontFamily: FONT.regular, textAlign: "center" },
  error: { color: "#b42318", fontFamily: FONT.regular, lineHeight: 18 }
});
