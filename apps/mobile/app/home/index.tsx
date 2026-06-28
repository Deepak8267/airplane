import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { Experience, Template, TemplateCategory } from "@airplane/shared";
import { BottomNav } from "@/components/bottom-nav";
import { getMyExperiences } from "@/features/experiences/experience-service";
import { getPlanUsage } from "@/features/subscriptions/subscription-service";
import { getTemplates } from "@/features/templates/template-service";

type HomeCategory = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tone: string;
};

const HOME_CATEGORIES: HomeCategory[] = [
  { icon: "heart", label: "Love", tone: "#fff0f6" },
  { icon: "gift", label: "Birthday", tone: "#fff7ed" },
  { icon: "people", label: "Friends", tone: "#eef4ff" },
  { icon: "sparkles", label: "Anniversary", tone: "#fff1f7" },
  { icon: "musical-notes", label: "Celebration", tone: "#f0fdf4" },
  { icon: "ellipsis-horizontal", label: "More", tone: "#f8fafc" }
];

export default function HomeScreen() {
  const templatesQuery = useQuery({
    queryKey: ["templates"],
    queryFn: getTemplates
  });
  const experiencesQuery = useQuery({
    queryKey: ["my-experiences"],
    queryFn: getMyExperiences
  });
  const planUsageQuery = useQuery({
    queryKey: ["plan-usage"],
    queryFn: getPlanUsage
  });
  const templates = templatesQuery.data ?? [];
  const experiences = experiencesQuery.data ?? [];
  const usage = planUsageQuery.data;
  const refreshing = templatesQuery.isRefetching || experiencesQuery.isRefetching || planUsageQuery.isRefetching;
  const recentExperiences = experiences.slice(0, 6);
  const trendingTemplates = useMemo(() => {
    const sorted = [...templates].sort((left, right) => Number(right.isPremium) - Number(left.isPremium));
    return sorted.slice(0, 8);
  }, [templates]);

  function refresh() {
    void templatesQuery.refetch();
    void experiencesQuery.refetch();
    void planUsageQuery.refetch();
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={styles.logoMark}>
              <Ionicons color="#ffffff" name="paper-plane" size={24} />
            </View>
            <View>
              <Text style={styles.logo}>AIRPLANE</Text>
              <Text style={styles.tagline}>Create moments that fly</Text>
            </View>
          </View>
          <View style={styles.topActions}>
            <Link href={"/subscription" as never} asChild>
              <Pressable style={styles.proPill}>
                <Ionicons color="#f59e0b" name="diamond" size={17} />
                <Text style={styles.proText}>{usage?.plan === "pro" ? "Pro" : "Pro"}</Text>
              </Pressable>
            </Link>
            <Pressable accessibilityLabel="Notifications" style={styles.bellButton}>
              <Ionicons color="#101828" name="notifications-outline" size={23} />
              <View style={styles.notificationDot} />
            </Pressable>
          </View>
        </View>

        <View style={styles.searchRow}>
          <Pressable style={styles.searchBox} onPress={() => router.push("/templates" as never)}>
            <Ionicons color="#98a2b3" name="search-outline" size={23} />
            <TextInput
              editable={false}
              pointerEvents="none"
              placeholder="Search templates, occasions, experiences..."
              placeholderTextColor="#98a2b3"
              style={styles.searchInput}
            />
          </Pressable>
          <Pressable accessibilityLabel="Discover templates" style={styles.sparkleButton} onPress={() => router.push("/templates" as never)}>
            <Ionicons color="#ec0e68" name="sparkles-outline" size={25} />
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRail}>
          {HOME_CATEGORIES.map((category) => (
            <Pressable key={category.label} style={styles.categoryTile} onPress={() => router.push("/templates" as never)}>
              <View style={[styles.categoryIcon, { backgroundColor: category.tone }]}>
                <Ionicons color="#ec0e68" name={category.icon} size={27} />
              </View>
              <Text style={styles.categoryLabel}>{category.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.heroCard}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>Make every moment</Text>
            <Text style={styles.heroAccent}>unforgettable</Text>
            <Text style={styles.heroBody}>Create beautiful, interactive experiences in minutes.</Text>
            <Link href={"/templates" as never} asChild>
              <Pressable style={styles.heroButton}>
                <Text style={styles.heroButtonText}>Create Now</Text>
                <View style={styles.heroArrow}>
                  <Ionicons color="#ec0e68" name="arrow-forward" size={18} />
                </View>
              </Pressable>
            </Link>
          </View>
          <View style={styles.heroArt}>
            <View style={styles.envelopeBack} />
            <View style={styles.envelope}>
              <Text style={styles.envelopeText}>Will you{"\n"}marry me?</Text>
            </View>
            <Ionicons color="#f43f7f" name="heart" size={34} style={styles.heroHeart} />
            <Ionicons color="#fda4c7" name="heart" size={22} style={styles.heroSmallHeart} />
            <Ionicons color="#ffffff" name="paper-plane" size={24} style={styles.heroPlane} />
          </View>
          <View style={styles.heroDots}>
            <View style={styles.activeHeroDot} />
            <View style={styles.heroDot} />
            <View style={styles.heroDot} />
          </View>
        </View>

        <SectionHeader title="Recently Used" onSeeAll={() => router.push("/experiences" as never)} />
        {experiencesQuery.isLoading ? (
          <LoadingCard label="Loading experiences..." />
        ) : recentExperiences.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardRail}>
            {recentExperiences.map((experience) => <RecentCard key={experience.id} experience={experience} />)}
          </ScrollView>
        ) : (
          <LoadingCard label="Create your first experience to see it here." />
        )}

        <SectionHeader title="Trending Templates" onSeeAll={() => router.push("/templates" as never)} />
        {templatesQuery.isLoading ? (
          <LoadingCard label="Loading templates..." />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardRail}>
            {trendingTemplates.map((template, index) => (
              <TrendingCard key={template.id} rank={index} template={template} />
            ))}
          </ScrollView>
        )}

        <Link href={"/subscription" as never} asChild>
          <Pressable style={styles.premiumBanner}>
            <View style={styles.crownBox}>
              <Ionicons color="#f59e0b" name="diamond" size={28} />
            </View>
            <View style={styles.premiumCopy}>
              <Text style={styles.premiumTitle}>Unlock Premium Templates</Text>
              <Text style={styles.premiumText}>Get access to premium templates, advanced features and more.</Text>
            </View>
            <View style={styles.upgradePill}>
              <Text style={styles.upgradeText}>Upgrade to Pro</Text>
            </View>
          </Pressable>
        </Link>
      </ScrollView>
      <BottomNav active="home" />
    </View>
  );
}

function SectionHeader({ onSeeAll, title }: { onSeeAll: () => void; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable onPress={onSeeAll}>
        <Text style={styles.seeAll}>See All</Text>
      </Pressable>
    </View>
  );
}

function RecentCard({ experience }: { experience: Experience }) {
  return (
    <Pressable style={styles.recentCard} onPress={() => router.push("/experiences" as never)}>
      <VisualPanel accent={experience.theme.accent} background={experience.theme.background} category="love" />
      <View style={styles.templateInfo}>
        <Text numberOfLines={1} style={styles.templateTitle}>{experience.title || "Untitled experience"}</Text>
        <Text style={styles.templateMeta}>{experience.isPublished ? "Published" : "Draft"} link</Text>
      </View>
      <Ionicons color="#667085" name="ellipsis-vertical" size={18} style={styles.moreIcon} />
    </Pressable>
  );
}

function TrendingCard({ rank, template }: { rank: number; template: Template }) {
  return (
    <Link href={{ pathname: "/templates/[id]", params: { id: template.id } }} asChild>
      <Pressable style={styles.trendingCard}>
        <VisualPanel accent={template.defaultTheme.accent} background={template.defaultTheme.background} category={template.category} />
        <Text style={[styles.badge, rank < 2 ? styles.popularBadge : styles.newBadge]}>{rank < 2 ? "Popular" : "New"}</Text>
        <View style={styles.templateInfo}>
          <Text numberOfLines={1} style={styles.templateTitle}>{template.name}</Text>
          <Text style={styles.templateMeta}>{getUsageLabel(rank)} uses</Text>
        </View>
      </Pressable>
    </Link>
  );
}

function VisualPanel({ accent, background, category }: { accent: string; background: string; category: TemplateCategory | "love" }) {
  return (
    <View style={[styles.visualPanel, { backgroundColor: background }]}>
      <View style={[styles.visualCircle, { backgroundColor: accent }]} />
      <Ionicons color={accent} name={getTemplateIcon(category)} size={38} />
      <View style={[styles.visualLine, { backgroundColor: accent }]} />
    </View>
  );
}

function LoadingCard({ label }: { label: string }) {
  return (
    <View style={styles.loadingCard}>
      <Ionicons color="#ec0e68" name="sparkles-outline" size={23} />
      <Text style={styles.loadingText}>{label}</Text>
    </View>
  );
}

function getUsageLabel(index: number) {
  return ["32.1K", "28.6K", "21.3K", "18.7K", "16.4K", "14.2K", "12.8K", "9.9K"][index] ?? "8.4K";
}

function getTemplateIcon(category: TemplateCategory | "love"): keyof typeof Ionicons.glyphMap {
  if (category === "birthday") {
    return "gift";
  }

  if (category === "friends") {
    return "people";
  }

  if (category === "family") {
    return "home";
  }

  if (category === "fun") {
    return "sparkles";
  }

  return "heart";
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fbfbff" },
  content: { gap: 14, padding: 18, paddingBottom: 112 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, paddingTop: 6 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoMark: { width: 46, height: 46, borderRadius: 14, backgroundColor: "#ec0e68", alignItems: "center", justifyContent: "center", transform: [{ rotate: "-10deg" }] },
  logo: { color: "#101828", fontSize: 22, lineHeight: 27, fontWeight: "900", letterSpacing: 0 },
  tagline: { color: "#667085", fontSize: 12, fontWeight: "700" },
  topActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  proPill: { minHeight: 36, borderRadius: 18, borderWidth: 1, borderColor: "#fce7f3", backgroundColor: "#ffffff", flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10 },
  proText: { color: "#ec0e68", fontSize: 14, fontWeight: "900" },
  bellButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center" },
  notificationDot: { position: "absolute", right: 8, top: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: "#ec0e68" },
  searchRow: { flexDirection: "row", gap: 10 },
  searchBox: { flex: 1, height: 54, borderRadius: 17, borderWidth: 1, borderColor: "#e7e8f2", backgroundColor: "#ffffff", flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14 },
  searchInput: { flex: 1, color: "#101828", fontSize: 14 },
  sparkleButton: { width: 54, height: 54, borderRadius: 17, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#fff1f7", alignItems: "center", justifyContent: "center" },
  categoryRail: { gap: 12, paddingRight: 4 },
  categoryTile: { width: 96, height: 102, borderRadius: 18, borderWidth: 1, borderColor: "#e7e8f2", backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center", gap: 8 },
  categoryIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  categoryLabel: { color: "#101828", fontSize: 13, fontWeight: "900" },
  heroCard: { minHeight: 248, borderRadius: 24, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffe4ee", overflow: "hidden", padding: 18, flexDirection: "row" },
  heroCopy: { flex: 1.08, gap: 8, justifyContent: "center", zIndex: 2 },
  heroTitle: { color: "#101828", fontSize: 23, lineHeight: 29, fontWeight: "500" },
  heroAccent: { color: "#d62666", fontSize: 25, lineHeight: 31, fontWeight: "900" },
  heroBody: { color: "#667085", fontSize: 14, lineHeight: 22, maxWidth: 176 },
  heroButton: { marginTop: 6, height: 46, alignSelf: "flex-start", borderRadius: 23, backgroundColor: "#ec0e68", flexDirection: "row", alignItems: "center", gap: 8, paddingLeft: 18, paddingRight: 7 },
  heroButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "900" },
  heroArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center" },
  heroArt: { flex: 1, alignItems: "center", justifyContent: "center" },
  envelopeBack: { position: "absolute", width: 122, height: 92, borderRadius: 22, backgroundColor: "#f78db3", transform: [{ rotate: "-18deg" }] },
  envelope: { width: 122, height: 92, borderRadius: 16, backgroundColor: "#fff7fb", alignItems: "center", justifyContent: "center", transform: [{ rotate: "10deg" }], shadowColor: "#d62666", shadowOpacity: 0.16, shadowRadius: 12, shadowOffset: { width: 0, height: 7 } },
  envelopeText: { color: "#9f1239", fontSize: 14, lineHeight: 20, fontWeight: "700", fontStyle: "italic", textAlign: "center" },
  heroHeart: { position: "absolute", bottom: 48, left: 8 },
  heroSmallHeart: { position: "absolute", top: 38, left: 4 },
  heroPlane: { position: "absolute", top: 24, right: -2, transform: [{ rotate: "25deg" }] },
  heroDots: { position: "absolute", bottom: 11, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 7 },
  activeHeroDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#ec0e68" },
  heroDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#cdd3df" },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  sectionTitle: { color: "#101828", fontSize: 19, lineHeight: 25, fontWeight: "900" },
  seeAll: { color: "#ec0e68", fontSize: 13, fontWeight: "900" },
  cardRail: { gap: 14, paddingRight: 4 },
  recentCard: { width: 178, minHeight: 178, borderRadius: 16, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e7e8f2", overflow: "hidden" },
  trendingCard: { width: 160, minHeight: 210, borderRadius: 16, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e7e8f2", overflow: "hidden" },
  visualPanel: { height: 108, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  visualCircle: { position: "absolute", width: 76, height: 76, borderRadius: 38, opacity: 0.14 },
  visualLine: { position: "absolute", bottom: 0, left: 0, right: 0, height: 3, opacity: 0.7 },
  templateInfo: { gap: 3, padding: 12, paddingRight: 30 },
  templateTitle: { color: "#101828", fontSize: 13, fontWeight: "900" },
  templateMeta: { color: "#667085", fontSize: 12, fontWeight: "700" },
  moreIcon: { position: "absolute", right: 9, bottom: 20 },
  badge: { position: "absolute", left: 10, top: 10, overflow: "hidden", borderRadius: 8, color: "#ffffff", paddingHorizontal: 7, paddingVertical: 4, fontSize: 10, fontWeight: "900" },
  popularBadge: { backgroundColor: "#ec0e68" },
  newBadge: { backgroundColor: "#16a34a" },
  premiumBanner: { minHeight: 98, borderRadius: 20, backgroundColor: "#fff8e7", borderWidth: 1, borderColor: "#fff1c2", flexDirection: "row", alignItems: "center", gap: 12, padding: 15 },
  crownBox: { width: 48, height: 48, borderRadius: 15, backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center" },
  premiumCopy: { flex: 1, gap: 3 },
  premiumTitle: { color: "#101828", fontSize: 15, fontWeight: "900" },
  premiumText: { color: "#667085", fontSize: 12, lineHeight: 18 },
  upgradePill: { minHeight: 40, borderRadius: 20, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#fff1f7", alignItems: "center", justifyContent: "center", paddingHorizontal: 13 },
  upgradeText: { color: "#ec0e68", fontSize: 13, fontWeight: "900" },
  loadingCard: { minHeight: 78, borderRadius: 16, borderWidth: 1, borderColor: "#e7e8f2", backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center", gap: 8 },
  loadingText: { color: "#667085", fontWeight: "800" }
});
