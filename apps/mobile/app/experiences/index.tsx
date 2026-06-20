import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { getMyExperiences } from "@/features/experiences/experience-service";

export default function ExperiencesScreen() {
  const experiencesQuery = useQuery({
    queryKey: ["my-experiences"],
    queryFn: getMyExperiences
  });
  const experiences = experiencesQuery.data ?? [];

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Library</Text>
        <Text style={styles.title}>My experiences</Text>
      </View>

      <FlatList
        data={experiences}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{experiencesQuery.isLoading ? "Loading experiences..." : "No experiences yet"}</Text>
            <Text style={styles.emptyCopy}>
              {experiencesQuery.error instanceof Error ? experiencesQuery.error.message : "Create one from a template to see it here."}
            </Text>
            <Link href="/home" asChild>
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Choose template</Text>
              </Pressable>
            </Link>
          </View>
        }
        renderItem={({ item }) => {
          const link = item.slug ? `${process.env.EXPO_PUBLIC_WEB_URL ?? "https://airplane.app"}/e/${item.slug}` : null;

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={[styles.status, item.isPublished ? styles.published : styles.draft]}>
                  {item.isPublished ? "published" : "draft"}
                </Text>
              </View>
              <Text style={styles.recipient}>{item.recipientName || "No recipient yet"}</Text>
              <Text style={styles.message} numberOfLines={2}>
                {item.message || "No message yet"}
              </Text>
              {item.isPublished ? (
                <View style={styles.cardActions}>
                  <Pressable
                    style={styles.secondaryButton}
                    onPress={() => router.push({ pathname: "/analytics/[id]", params: { id: item.id } } as never)}
                  >
                    <Ionicons color="#101828" name="bar-chart-outline" size={19} />
                    <Text style={styles.secondaryButtonText}>Analytics</Text>
                  </Pressable>
                  {link ? (
                    <Pressable style={styles.iconButton} accessibilityLabel="Copy experience link" onPress={() => Clipboard.setStringAsync(link)}>
                      <Ionicons color="#101828" name="copy-outline" size={20} />
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20 },
  header: { paddingTop: 8, gap: 6 },
  eyebrow: { color: "#2563eb", fontSize: 13, fontWeight: "800", textTransform: "uppercase" },
  title: { color: "#101828", fontSize: 30, lineHeight: 36, fontWeight: "900" },
  list: { gap: 12, paddingTop: 18, paddingBottom: 40 },
  card: { gap: 10, padding: 16, backgroundColor: "#ffffff", borderRadius: 8, borderWidth: 1, borderColor: "#eaecf0" },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardTitle: { flex: 1, color: "#101828", fontSize: 18, fontWeight: "900" },
  status: { overflow: "hidden", borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5, fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  published: { color: "#067647", backgroundColor: "#dcfae6" },
  draft: { color: "#b54708", backgroundColor: "#fef0c7" },
  recipient: { color: "#344054", fontWeight: "800" },
  message: { color: "#667085", lineHeight: 20 },
  cardActions: { flexDirection: "row", gap: 8 },
  secondaryButton: { flex: 1, height: 44, borderRadius: 8, borderWidth: 1, borderColor: "#d0d5dd", flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center" },
  secondaryButtonText: { color: "#101828", fontWeight: "900" },
  iconButton: { width: 44, height: 44, borderRadius: 8, borderWidth: 1, borderColor: "#d0d5dd", alignItems: "center", justifyContent: "center" },
  emptyState: { padding: 16, borderRadius: 8, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#eaecf0", gap: 10 },
  emptyTitle: { color: "#101828", fontSize: 17, fontWeight: "900" },
  emptyCopy: { color: "#667085", lineHeight: 20 },
  primaryButton: { height: 48, borderRadius: 8, backgroundColor: "#101828", alignItems: "center", justifyContent: "center" },
  primaryButtonText: { color: "#ffffff", fontWeight: "900" }
});
