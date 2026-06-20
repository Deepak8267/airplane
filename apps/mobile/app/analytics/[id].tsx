import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { getExperienceAnalytics } from "@/features/analytics/analytics-service";

export default function AnalyticsScreen() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const experienceId = Array.isArray(params.id) ? params.id[0] : params.id;
  const analyticsQuery = useQuery({
    queryKey: ["experience-analytics", experienceId],
    queryFn: () => {
      if (!experienceId) {
        throw new Error("Experience not found.");
      }

      return getExperienceAnalytics(experienceId);
    },
    enabled: Boolean(experienceId)
  });
  const data = analyticsQuery.data;

  return (
    <>
      <Stack.Screen options={{ title: "Analytics" }} />
      <ScrollView
        contentContainerStyle={styles.screen}
        refreshControl={<RefreshControl refreshing={analyticsQuery.isRefetching} onRefresh={() => analyticsQuery.refetch()} />}
      >
        {analyticsQuery.isLoading ? <Text style={styles.stateText}>Loading analytics...</Text> : null}
        {analyticsQuery.error instanceof Error ? <Text style={styles.error}>{analyticsQuery.error.message}</Text> : null}

        {data ? (
          <>
            <View style={styles.header}>
              <Text style={styles.eyebrow}>Performance</Text>
              <Text style={styles.title}>{data.experience.title}</Text>
              <Text style={styles.recipient}>{data.experience.recipientName || "No recipient"}</Text>
            </View>

            <View style={styles.metricGrid}>
              <Metric icon="eye-outline" label="Views" value={formatNumber(data.summary.views)} />
              <Metric icon="people-outline" label="Visitors" value={formatNumber(data.summary.uniqueVisitors)} />
              <Metric icon="checkmark-circle-outline" label="Completions" value={formatNumber(data.summary.completions)} />
              <Metric icon="time-outline" label="Average time" value={formatDuration(data.summary.averageCompletionTimeSeconds)} />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeading}>
                <Text style={styles.sectionTitle}>Completion rate</Text>
                <Text style={styles.rate}>{Math.round(data.summary.completionRate)}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressValue, { width: `${data.summary.completionRate}%` }]} />
              </View>
            </View>

            <View style={styles.noAttemptsBand}>
              <View style={styles.noAttemptsIcon}>
                <Ionicons color="#b54708" name="move-outline" size={22} />
              </View>
              <View style={styles.noAttemptsCopy}>
                <Text style={styles.noAttemptsLabel}>Proposal NO attempts</Text>
                <Text style={styles.noAttemptsValue}>{formatNumber(data.summary.totalNoAttempts)}</Text>
              </View>
            </View>

            <View style={styles.activitySection}>
              <Text style={styles.sectionTitle}>Recent activity</Text>
              {data.recentActivity.length === 0 ? (
                <Text style={styles.emptyActivity}>No recipient activity yet.</Text>
              ) : (
                data.recentActivity.map((activity) => (
                  <View key={activity.id} style={styles.activityRow}>
                    <View style={styles.activityDot} />
                    <View style={styles.activityCopy}>
                      <Text style={styles.activityTitle}>{formatEvent(activity.eventType)}</Text>
                      <Text style={styles.activityTime}>{formatDate(activity.createdAt)}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        ) : null}
      </ScrollView>
    </>
  );
}

function Metric({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Ionicons color="#2563eb" name={icon} size={22} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

function formatDuration(seconds: number) {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function formatEvent(eventType: string) {
  const labels: Record<string, string> = {
    experience_viewed: "Experience viewed",
    page_viewed: "Page viewed",
    button_clicked: "Button clicked",
    quiz_answered: "Quiz answered",
    proposal_no_attempted: "Proposal NO attempted",
    proposal_answered_yes: "Proposal answered YES",
    proposal_answered_no: "Proposal answered NO",
    experience_completed: "Experience completed"
  };

  return labels[eventType] ?? eventType.replaceAll("_", " ");
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, padding: 20, gap: 20 },
  stateText: { color: "#667085", textAlign: "center", paddingTop: 40 },
  error: { color: "#b42318", lineHeight: 20, paddingTop: 20 },
  header: { gap: 5 },
  eyebrow: { color: "#2563eb", fontSize: 13, fontWeight: "900", textTransform: "uppercase" },
  title: { color: "#101828", fontSize: 30, lineHeight: 36, fontWeight: "900" },
  recipient: { color: "#667085", fontSize: 15, fontWeight: "700" },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metric: { minWidth: 145, flexBasis: "47%", flexGrow: 1, minHeight: 132, borderRadius: 8, borderWidth: 1, borderColor: "#eaecf0", backgroundColor: "#ffffff", padding: 15, justifyContent: "space-between" },
  metricValue: { color: "#101828", fontSize: 27, fontWeight: "900" },
  metricLabel: { color: "#667085", fontSize: 13, fontWeight: "800" },
  section: { gap: 12 },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { color: "#101828", fontSize: 18, fontWeight: "900" },
  rate: { color: "#067647", fontSize: 20, fontWeight: "900" },
  progressTrack: { height: 10, borderRadius: 5, overflow: "hidden", backgroundColor: "#d1fadf" },
  progressValue: { height: "100%", borderRadius: 5, backgroundColor: "#12b76a" },
  noAttemptsBand: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 8, backgroundColor: "#fffaeb", borderWidth: 1, borderColor: "#fedf89", padding: 15 },
  noAttemptsIcon: { width: 42, height: 42, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: "#fef0c7" },
  noAttemptsCopy: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  noAttemptsLabel: { color: "#7a2e0e", fontWeight: "800" },
  noAttemptsValue: { color: "#7a2e0e", fontSize: 24, fontWeight: "900" },
  activitySection: { gap: 4 },
  emptyActivity: { color: "#667085", paddingVertical: 18 },
  activityRow: { minHeight: 60, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: "#eaecf0" },
  activityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#2563eb" },
  activityCopy: { flex: 1, gap: 2 },
  activityTitle: { color: "#101828", fontWeight: "800" },
  activityTime: { color: "#667085", fontSize: 12 }
});
