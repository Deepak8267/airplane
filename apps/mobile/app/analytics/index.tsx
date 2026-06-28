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
              <Ionicons color="#ec0e68" name="bar-chart-outline" size={28} />
              <Text style={styles.emptyTitle}>No published analytics yet</Text>
              <Text style={styles.emptyCopy}>Publish an experience and open its link to start collecting analytics.</Text>
              <Pressable style={styles.primaryButton} onPress={() => router.push("/home" as never)}>
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
              <View style={styles.cardIcon}>
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

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: "#f6f7fb" },
  list: { gap: 12, padding: 20, paddingBottom: 110 },
  headerStack: { gap: 16 },
  header: { gap: 7, paddingTop: 8 },
  eyebrow: { color: "#ec0e68", fontSize: 13, fontWeight: "900", textTransform: "uppercase" },
  title: { color: "#101828", fontSize: 32, lineHeight: 38, fontWeight: "900" },
  subtitle: { color: "#667085", fontSize: 15, lineHeight: 22 },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metricCard: { minWidth: 145, flexBasis: "47%", flexGrow: 1, minHeight: 122, borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", padding: 14, justifyContent: "space-between" },
  metricValue: { color: "#101828", fontSize: 25, fontWeight: "900" },
  metricLabel: { color: "#667085", fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { color: "#101828", fontSize: 18, fontWeight: "900" },
  sectionCount: { overflow: "hidden", borderRadius: 8, backgroundColor: "#fff1f7", color: "#ec0e68", paddingHorizontal: 9, paddingVertical: 5, fontSize: 12, fontWeight: "900" },
  experienceCard: { gap: 12, borderRadius: 8, borderWidth: 1, borderColor: "#eaecf0", backgroundColor: "#ffffff", padding: 14 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardIcon: { width: 40, height: 40, borderRadius: 8, backgroundColor: "#fff1f7", alignItems: "center", justifyContent: "center" },
  cardTitleBlock: { flex: 1, gap: 2 },
  cardTitle: { color: "#101828", fontSize: 16, fontWeight: "900" },
  cardSubtitle: { color: "#667085", fontSize: 13, fontWeight: "700" },
  cardStats: { flexDirection: "row", gap: 8 },
  smallStat: { flex: 1, minHeight: 62, borderRadius: 8, backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#eaecf0", padding: 9, justifyContent: "space-between" },
  smallStatValue: { color: "#101828", fontSize: 18, fontWeight: "900" },
  smallStatLabel: { color: "#667085", fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  emptyCard: { gap: 10, alignItems: "center", borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", padding: 18 },
  emptyTitle: { color: "#101828", fontSize: 18, fontWeight: "900", textAlign: "center" },
  emptyCopy: { color: "#667085", textAlign: "center", lineHeight: 21 },
  primaryButton: { alignSelf: "stretch", height: 48, borderRadius: 8, backgroundColor: "#ec0e68", alignItems: "center", justifyContent: "center" },
  primaryButtonText: { color: "#ffffff", fontWeight: "900" },
  stateText: { color: "#667085", textAlign: "center" },
  error: { color: "#b42318", lineHeight: 20 }
});
