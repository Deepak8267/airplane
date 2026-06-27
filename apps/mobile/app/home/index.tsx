import { Link } from "expo-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { TEMPLATE_CATEGORIES } from "@airplane/shared";
import { signOut } from "@/features/auth/auth-service";
import { getPlanUsage } from "@/features/subscriptions/subscription-service";
import { getTemplates } from "@/features/templates/template-service";
import { useSessionStore } from "@/stores/session-store";

export default function HomeScreen() {
  const session = useSessionStore((state) => state.session);
  const localSignOut = useSessionStore((state) => state.signOut);
  const signOutMutation = useMutation({
    mutationFn: signOut,
    onSuccess: localSignOut
  });
  const templatesQuery = useQuery({
    queryKey: ["templates"],
    queryFn: getTemplates
  });
  const planUsageQuery = useQuery({
    queryKey: ["plan-usage"],
    queryFn: getPlanUsage
  });
  const templates = templatesQuery.data ?? [];
  const usage = planUsageQuery.data;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Creator Home</Text>
        <Text style={styles.title}>Choose a starting point.</Text>
        <Text style={styles.account}>{session?.user.email ?? "Anonymous creator"}</Text>
      </View>

      <View style={styles.actions}>
        <Link href={"/experiences" as never} asChild>
          <Pressable style={styles.actionButton}>
            <Text style={styles.actionButtonText}>My experiences</Text>
          </Pressable>
        </Link>
        <Pressable style={styles.actionButton} onPress={() => signOutMutation.mutate()}>
          <Text style={styles.actionButtonText}>Sign out</Text>
        </Pressable>
      </View>

      <View style={styles.planCard}>
        <View style={styles.planHeading}>
          <Text style={styles.planLabel}>{usage?.plan === "pro" ? "Pro plan" : "Free plan"}</Text>
          <Text style={styles.planStatus}>{usage?.status ?? "active"}</Text>
        </View>
        <Text style={styles.planCopy}>
          {usage?.plan === "pro"
            ? "Unlimited experiences are enabled."
            : `${usage?.activeExperienceCount ?? 0}/${usage?.freeExperienceLimit ?? 3} experiences used.`}
        </Text>
        {usage?.plan !== "pro" ? (
          <View style={styles.usageTrack}>
            <View
              style={[
                styles.usageValue,
                { width: `${Math.min(((usage?.activeExperienceCount ?? 0) / (usage?.freeExperienceLimit ?? 3)) * 100, 100)}%` }
              ]}
            />
          </View>
        ) : null}
      </View>

      <FlatList
        data={TEMPLATE_CATEGORIES}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
        renderItem={({ item }) => <Text style={styles.category}>{item}</Text>}
      />

      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{templatesQuery.isLoading ? "Loading templates..." : "No templates found"}</Text>
            <Text style={styles.emptyCopy}>
              {templatesQuery.error instanceof Error ? templatesQuery.error.message : "Run the Supabase seed file if this stays empty."}
            </Text>
          </View>
        }
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Link href={{ pathname: "/templates/[id]", params: { id: item.id } }} asChild>
            <Pressable style={styles.card}>
              <View style={[styles.swatch, { backgroundColor: item.defaultTheme.accent }]} />
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardCopy}>{item.description}</Text>
              </View>
              {item.isPremium ? <Text style={styles.pro}>PRO</Text> : null}
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20 },
  header: { paddingTop: 8, gap: 6 },
  eyebrow: { color: "#2563eb", fontSize: 13, fontWeight: "800", textTransform: "uppercase" },
  title: { color: "#101828", fontSize: 30, lineHeight: 36, fontWeight: "800" },
  account: { color: "#667085", fontWeight: "700" },
  actions: { flexDirection: "row", gap: 10, paddingTop: 16 },
  actionButton: { flex: 1, minHeight: 46, borderRadius: 8, borderWidth: 1, borderColor: "#d0d5dd", backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center", paddingHorizontal: 10 },
  actionButtonText: { color: "#101828", fontWeight: "800" },
  planCard: { gap: 10, marginTop: 14, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: "#dbeafe", backgroundColor: "#eff6ff" },
  planHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  planLabel: { color: "#101828", fontSize: 16, fontWeight: "900", textTransform: "capitalize" },
  planStatus: { overflow: "hidden", borderRadius: 8, backgroundColor: "#ffffff", color: "#175cd3", paddingHorizontal: 9, paddingVertical: 5, fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  planCopy: { color: "#344054", fontWeight: "700" },
  usageTrack: { height: 8, borderRadius: 4, overflow: "hidden", backgroundColor: "#bfdbfe" },
  usageValue: { height: "100%", borderRadius: 4, backgroundColor: "#2563eb" },
  categories: { gap: 8, paddingVertical: 18 },
  category: { overflow: "hidden", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: "#ffffff", color: "#344054", fontWeight: "700", textTransform: "capitalize" },
  list: { gap: 12, paddingBottom: 40 },
  card: { minHeight: 104, flexDirection: "row", alignItems: "center", gap: 14, padding: 16, backgroundColor: "#ffffff", borderRadius: 8, borderWidth: 1, borderColor: "#eaecf0" },
  swatch: { width: 48, height: 48, borderRadius: 8 },
  cardText: { flex: 1, gap: 4 },
  cardTitle: { color: "#101828", fontSize: 17, fontWeight: "800" },
  cardCopy: { color: "#667085", fontSize: 14, lineHeight: 20 },
  pro: { color: "#7c3aed", fontWeight: "900", fontSize: 12 }
  ,
  emptyState: { padding: 16, borderRadius: 8, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#eaecf0", gap: 6 },
  emptyTitle: { color: "#101828", fontSize: 16, fontWeight: "900" },
  emptyCopy: { color: "#667085", lineHeight: 20 }
});
