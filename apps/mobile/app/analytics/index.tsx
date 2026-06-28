import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { BottomNav } from "@/components/bottom-nav";
import { getAnalyticsDashboard } from "@/features/analytics/analytics-service";

export default function AnalyticsDashboardScreen() {
  const dashboardQuery = useQuery({
    queryKey: ["analytics-dashboard"],
    queryFn: getAnalyticsDashboard
  });
  const dashboard = dashboardQuery.data;

  return (
    <View style={styles.shell}>
      <FlatList
        data={dashboard?.items ?? []}
        keyExtractor={(item) => item.experience.id}
        refreshControl={<RefreshControl refreshing={dashboardQuery.isRefetching} onRefresh={() => dashboardQuery.refetch()} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.headerStack}>
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Ionicons color="#ec0e68" name="bar-chart-outline" size={24} />
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
                <Ionicons color="#ec0e68" name="bar-chart-outline" size={28} />
              </View>
              <Text style={styles.emptyTitle}>No published analytics yet</Text>
              <Text style={styles.emptyCopy}>Publish an experience and open its link to start collecting analytics.</Text>
              <Pressable style={styles.primaryButton} onPress={() => router.push("/home" as never)}>
                <Ionicons color="#ffffff" name="sparkles-outline" size={18} />
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
                <Ionicons color="#ec0e68" name="paper-plane-outline" size={21} />
              </View>
              <View style={styles.cardTitleBlock}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.experience.title}</Text>
                <Text style={styles.cardSubtitle} numberOfLines={1}>{item.experience.recipientName || "No recipient"}</Text>
              </View>
              <Ionicons color="#98a2b3" name="chevron-forward" size={21} />
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
    </View>
  );
}

function Metric({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Ionicons color="#ec0e68" name={icon} size={22} />
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
  shell: { flex: 1, backgroundColor: "#fff7fb" },
  list: { gap: 12, padding: 20, paddingBottom: 110 },
  headerStack: { gap: 16 },
  header: { gap: 7, paddingTop: 8 },
  headerIcon: { width: 54, height: 54, borderRadius: 8, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#fbcfe8", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  eyebrow: { color: "#ec0e68", fontSize: 13, fontWeight: "900", textTransform: "uppercase" },
  title: { color: "#101828", fontSize: 32, lineHeight: 38, fontWeight: "900" },
  subtitle: { color: "#667085", fontSize: 15, lineHeight: 22 },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metricCard: { minWidth: 145, flexBasis: "47%", flexGrow: 1, minHeight: 122, borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", padding: 14, justifyContent: "space-between" },
  metricValue: { color: "#101828", fontSize: 25, fontWeight: "900" },
  metricLabel: { color: "#667085", fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  insightBand: { minHeight: 76, borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", flexDirection: "row", alignItems: "center", padding: 14 },
  insightItem: { flex: 1, gap: 4 },
  insightDivider: { width: 1, alignSelf: "stretch", backgroundColor: "#fce7f3", marginHorizontal: 12 },
  insightLabel: { color: "#667085", fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  insightValue: { color: "#101828", fontSize: 22, fontWeight: "900" },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { color: "#101828", fontSize: 18, fontWeight: "900" },
  sectionCount: { overflow: "hidden", borderRadius: 8, backgroundColor: "#fff1f7", color: "#ec0e68", paddingHorizontal: 9, paddingVertical: 5, fontSize: 12, fontWeight: "900" },
  experienceCard: { gap: 12, borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", padding: 14 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardIcon: { width: 40, height: 40, borderRadius: 8, backgroundColor: "#fff1f7", alignItems: "center", justifyContent: "center" },
  cardTitleBlock: { flex: 1, gap: 2 },
  cardTitle: { color: "#101828", fontSize: 16, fontWeight: "900" },
  cardSubtitle: { color: "#667085", fontSize: 13, fontWeight: "700" },
  cardStats: { flexDirection: "row", gap: 8 },
  smallStat: { flex: 1, minHeight: 62, borderRadius: 8, backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#eaecf0", padding: 9, justifyContent: "space-between" },
  smallStatValue: { color: "#101828", fontSize: 18, fontWeight: "900" },
  smallStatLabel: { color: "#667085", fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  cardFooter: { flexDirection: "row", gap: 8 },
  cardFooterText: { flex: 1, overflow: "hidden", borderRadius: 8, backgroundColor: "#fff7fb", color: "#667085", paddingHorizontal: 10, paddingVertical: 8, fontSize: 12, fontWeight: "900" },
  emptyCard: { gap: 10, alignItems: "center", borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", padding: 18 },
  emptyIcon: { width: 58, height: 58, borderRadius: 8, backgroundColor: "#fff0f6", alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: "#101828", fontSize: 18, fontWeight: "900", textAlign: "center" },
  emptyCopy: { color: "#667085", textAlign: "center", lineHeight: 21 },
  primaryButton: { alignSelf: "stretch", height: 48, borderRadius: 8, backgroundColor: "#ec0e68", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  primaryButtonText: { color: "#ffffff", fontWeight: "900" },
  stateText: { color: "#667085", textAlign: "center" },
  error: { color: "#b42318", lineHeight: 20 }
});
