import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { TEMPLATE_CATEGORIES } from "@airplane/shared";
import { BottomNav } from "@/components/bottom-nav";
import { useSignOut } from "@/features/auth/use-sign-out";
import { getPlanUsage } from "@/features/subscriptions/subscription-service";
import { getTemplates } from "@/features/templates/template-service";
import { useSessionStore } from "@/stores/session-store";

export default function HomeScreen() {
  const session = useSessionStore((state) => state.session);
  const signOutMutation = useSignOut();
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
  const refreshing = templatesQuery.isRefetching || planUsageQuery.isRefetching;
  const remaining = usage?.plan === "pro" ? "Unlimited" : `${usage?.remainingFreeExperiences ?? 3}`;

  function refresh() {
    void templatesQuery.refetch();
    void planUsageQuery.refetch();
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <View style={styles.topBar}>
              <View style={styles.brandBlock}>
                <Text style={styles.logo}>AIRPLANE</Text>
                <Text style={styles.account} numberOfLines={1}>{session?.user.email ?? "Anonymous creator"}</Text>
              </View>
              <Pressable
                accessibilityLabel="Sign out"
                disabled={signOutMutation.isPending}
                onPress={() => signOutMutation.mutate()}
                style={[styles.iconButton, signOutMutation.isPending ? styles.pendingButton : null]}
              >
                <Ionicons color="#101828" name="log-out-outline" size={21} />
              </Pressable>
            </View>

            <View style={styles.hero}>
              <Text style={styles.eyebrow}>Creator Home</Text>
              <Text style={styles.title}>Create a link they will remember.</Text>
              <Text style={styles.subtitle}>Pick a template, personalize the story, and publish a web experience in minutes.</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Used</Text>
                <Text style={styles.statValue}>{usage?.activeExperienceCount ?? 0}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Remaining</Text>
                <Text style={styles.statValue}>{remaining}</Text>
              </View>
            </View>

            <View style={styles.planCard}>
              <View style={styles.planHeading}>
                <View style={styles.planTitleRow}>
                  <Ionicons color="#ec0e68" name={usage?.plan === "pro" ? "sparkles-outline" : "paper-plane-outline"} size={19} />
                  <Text style={styles.planLabel}>{usage?.plan === "pro" ? "Pro plan" : "Free plan"}</Text>
                </View>
                <Text style={styles.planStatus}>{usage?.status ?? "active"}</Text>
              </View>
              <Text style={styles.planCopy}>
                {planUsageQuery.isLoading
                  ? "Checking your plan..."
                  : usage?.plan === "pro"
                  ? "Unlimited experiences are enabled."
                  : `${usage?.activeExperienceCount ?? 0}/${usage?.freeExperienceLimit ?? 3} experiences used.`}
              </Text>
              {planUsageQuery.error instanceof Error ? <Text style={styles.planError}>{planUsageQuery.error.message}</Text> : null}
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

            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Templates</Text>
              <Link href={"/experiences" as never} asChild>
                <Pressable style={styles.libraryLink}>
                  <Ionicons color="#175cd3" name="albums-outline" size={17} />
                  <Text style={styles.libraryLinkText}>Library</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        }
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
              {item.isPremium ? <Text style={styles.pro}>LOCKED</Text> : null}
            </Pressable>
          </Link>
        )}
      />
      <BottomNav active="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f6f7fb" },
  headerContent: { gap: 14 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 8 },
  brandBlock: { flex: 1, gap: 3 },
  logo: { color: "#ec0e68", fontSize: 14, fontWeight: "900", letterSpacing: 0 },
  eyebrow: { color: "#ec0e68", fontSize: 13, fontWeight: "800", textTransform: "uppercase" },
  title: { color: "#101828", fontSize: 34, lineHeight: 40, fontWeight: "900" },
  subtitle: { color: "#475467", fontSize: 16, lineHeight: 23 },
  account: { color: "#667085", fontWeight: "700" },
  hero: { gap: 7, paddingTop: 8 },
  iconButton: { width: 44, height: 44, borderRadius: 8, borderWidth: 1, borderColor: "#d0d5dd", backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center" },
  pendingButton: { opacity: 0.65 },
  statsRow: { flexDirection: "row", gap: 10 },
  statBox: { flex: 1, minHeight: 86, borderRadius: 8, borderWidth: 1, borderColor: "#eaecf0", backgroundColor: "#ffffff", padding: 14, justifyContent: "space-between" },
  statLabel: { color: "#667085", fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  statValue: { color: "#101828", fontSize: 26, fontWeight: "900" },
  planCard: { gap: 10, marginTop: 14, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#fff1f7" },
  planHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  planTitleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  planLabel: { color: "#101828", fontSize: 16, fontWeight: "900", textTransform: "capitalize" },
  planStatus: { overflow: "hidden", borderRadius: 8, backgroundColor: "#ffffff", color: "#ec0e68", paddingHorizontal: 9, paddingVertical: 5, fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  planCopy: { color: "#344054", fontWeight: "700" },
  planError: { color: "#b42318", lineHeight: 19 },
  usageTrack: { height: 8, borderRadius: 4, overflow: "hidden", backgroundColor: "#fbcfe8" },
  usageValue: { height: "100%", borderRadius: 4, backgroundColor: "#ec0e68" },
  categories: { gap: 8, paddingVertical: 18 },
  category: { overflow: "hidden", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: "#ffffff", color: "#344054", fontWeight: "700", textTransform: "capitalize" },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingBottom: 2 },
  sectionTitle: { color: "#101828", fontSize: 20, fontWeight: "900" },
  libraryLink: { minHeight: 36, borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#fff1f7", flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10 },
  libraryLinkText: { color: "#ec0e68", fontSize: 13, fontWeight: "900" },
  list: { gap: 12, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 110 },
  card: { minHeight: 104, flexDirection: "row", alignItems: "center", gap: 14, padding: 16, backgroundColor: "#ffffff", borderRadius: 8, borderWidth: 1, borderColor: "#eaecf0" },
  swatch: { width: 48, height: 48, borderRadius: 8 },
  cardText: { flex: 1, gap: 4 },
  cardTitle: { color: "#101828", fontSize: 17, fontWeight: "800" },
  cardCopy: { color: "#667085", fontSize: 14, lineHeight: 20 },
  pro: { color: "#ec0e68", fontWeight: "900", fontSize: 12 }
  ,
  emptyState: { padding: 16, borderRadius: 8, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#eaecf0", gap: 6 },
  emptyTitle: { color: "#101828", fontSize: 16, fontWeight: "900" },
  emptyCopy: { color: "#667085", lineHeight: 20 }
});
