import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { Experience, Template, TemplateCategory } from "@airplane/shared";
import { BottomNav } from "@/components/bottom-nav";
import { getMyExperiences } from "@/features/experiences/experience-service";
import { getPlanUsage } from "@/features/subscriptions/subscription-service";
import { getTemplates } from "@/features/templates/template-service";

const COLORS = {
  primary: "#FF3D81",
  background: "#FFFFFF",
  text: "#111827",
  secondary: "#6B7280",
  border: "#F3F4F6"
};

const FONT = {
  regular: "Poppins_400Regular",
  medium: "Poppins_500Medium",
  semibold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold"
};

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
              <Ionicons color="#ffffff" name="paper-plane" size={26} />
            </View>
            <View>
              <Text style={styles.logo}>AIRPLANE</Text>
              <Text style={styles.tagline}>Create moments that fly</Text>
            </View>
          </View>
          <View style={styles.topActions}>
            <Link href={"/subscription" as never} asChild>
              <Pressable style={styles.proPill}>
                <Ionicons color="#f59e0b" name="diamond" size={16} />
                <Text style={styles.proText}>{usage?.plan === "pro" ? "Pro" : "Pro"}</Text>
              </Pressable>
            </Link>
            <Pressable accessibilityLabel="Notifications" style={styles.bellButton}>
              <Ionicons color={COLORS.text} name="notifications-outline" size={24} />
              <View style={styles.notificationDot} />
            </Pressable>
          </View>
        </View>

        <View style={styles.searchRow}>
          <Pressable style={styles.searchBox} onPress={() => router.push("/templates" as never)}>
            <Ionicons color="#9CA3AF" name="search-outline" size={20} />
            <TextInput
              editable={false}
              pointerEvents="none"
              placeholder="Search templates, occasions, experiences..."
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
            />
          </Pressable>
          <Pressable accessibilityLabel="Discover templates" style={styles.sparkleButton} onPress={() => router.push("/templates" as never)}>
            <Ionicons color={COLORS.primary} name="sparkles-outline" size={24} />
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRail}>
          {HOME_CATEGORIES.map((category) => (
            <Pressable key={category.label} style={styles.categoryTile} onPress={() => router.push("/templates" as never)}>
              <View style={[styles.categoryIcon, { backgroundColor: category.tone }]}>
                <Ionicons color={COLORS.primary} name={category.icon} size={28} />
              </View>
              <Text adjustsFontSizeToFit minimumFontScale={0.75} numberOfLines={1} style={styles.categoryLabel}>
                {category.label}
              </Text>
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
                  <Ionicons color={COLORS.primary} name="arrow-forward" size={20} />
                </View>
              </Pressable>
            </Link>
          </View>
          <View style={styles.heroArt}>
            <View style={styles.envelopeBack} />
            <View style={styles.envelope}>
              <Text style={styles.envelopeText}>Will you{"\n"}marry me?</Text>
            </View>
            <Ionicons color="#f43f7f" name="heart" size={32} style={styles.heroHeart} />
            <Ionicons color="#fda4c7" name="heart" size={21} style={styles.heroSmallHeart} />
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
              <Text style={styles.premiumText}>Get access to 100+ premium templates.</Text>
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
    <Pressable style={styles.templateCard} onPress={() => router.push("/experiences" as never)}>
      <CardImage accent={experience.theme.accent} background={experience.theme.background} category="love" uri={experience.coverPhotoUrl} />
      <View style={styles.templateInfo}>
        <Text numberOfLines={1} style={styles.templateTitle}>
          {experience.title || "Untitled experience"}
        </Text>
        <Text style={styles.templateMeta}>{experience.isPublished ? "Published" : "Draft"} link</Text>
      </View>
      <Ionicons color={COLORS.secondary} name="ellipsis-vertical" size={18} style={styles.moreIcon} />
    </Pressable>
  );
}

function TrendingCard({ rank, template }: { rank: number; template: Template }) {
  return (
    <Link href={{ pathname: "/templates/[id]", params: { id: template.id } }} asChild>
      <Pressable style={styles.templateCard}>
        <CardImage accent={template.defaultTheme.accent} background={template.defaultTheme.background} category={template.category} uri={template.thumbnailUrl} />
        <Text style={[styles.badge, rank < 2 ? styles.popularBadge : styles.newBadge]}>{rank < 2 ? "Popular" : "New"}</Text>
        <View style={styles.templateInfo}>
          <Text numberOfLines={1} style={styles.templateTitle}>
            {template.name}
          </Text>
          <Text style={styles.templateMeta}>{getUsageLabel(rank)} uses</Text>
        </View>
      </Pressable>
    </Link>
  );
}

function CardImage({
  accent,
  background,
  category,
  uri
}: {
  accent: string;
  background: string;
  category: TemplateCategory | "love";
  uri: string | null;
}) {
  if (uri) {
    return <Image resizeMode="cover" source={{ uri }} style={styles.cardImage} />;
  }

  return <VisualPanel accent={accent} background={background} category={category} />;
}

function VisualPanel({ accent, background, category }: { accent: string; background: string; category: TemplateCategory | "love" }) {
  return (
    <View style={[styles.cardImage, styles.visualPanel, { backgroundColor: background }]}>
      <View style={[styles.visualCircle, { backgroundColor: accent }]} />
      <Ionicons color={accent} name={getTemplateIcon(category)} size={40} />
      <View style={[styles.visualLine, { backgroundColor: accent }]} />
    </View>
  );
}

function LoadingCard({ label }: { label: string }) {
  return (
    <View style={styles.loadingCard}>
      <Ionicons color={COLORS.primary} name="sparkles-outline" size={22} />
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

const softShadow = {
  shadowColor: COLORS.text,
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { gap: 24, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 112 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  brandRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  logoMark: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-10deg" }]
  },
  logo: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 32, lineHeight: 36, letterSpacing: 0 },
  tagline: { color: COLORS.secondary, fontFamily: FONT.medium, fontSize: 15, lineHeight: 20 },
  topActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  proPill: {
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    ...softShadow
  },
  proText: { color: COLORS.primary, fontFamily: FONT.semibold, fontSize: 12 },
  bellButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.background, alignItems: "center", justifyContent: "center" },
  notificationDot: { position: "absolute", right: 8, top: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  searchRow: { flexDirection: "row", gap: 12 },
  searchBox: {
    flex: 1,
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    ...softShadow
  },
  searchInput: { flex: 1, color: COLORS.text, fontFamily: FONT.regular, fontSize: 15, padding: 0 },
  sparkleButton: {
    width: 52,
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#FCE7F3",
    backgroundColor: "#FFF1F7",
    alignItems: "center",
    justifyContent: "center"
  },
  categoryRail: { gap: 12, paddingRight: 4 },
  categoryTile: {
    width: 72,
    height: 72,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 6,
    ...softShadow
  },
  categoryIcon: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  categoryLabel: { color: COLORS.text, fontFamily: FONT.medium, fontSize: 13, lineHeight: 16, textAlign: "center" },
  heroCard: {
    height: 190,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#FBCFE8",
    backgroundColor: "#FFE5EF",
    overflow: "hidden",
    padding: 24,
    flexDirection: "row"
  },
  heroCopy: { flex: 1.05, gap: 7, justifyContent: "center", zIndex: 2 },
  heroTitle: { color: COLORS.text, fontFamily: FONT.regular, fontSize: 21, lineHeight: 27 },
  heroAccent: { color: COLORS.primary, fontFamily: FONT.bold, fontSize: 24, lineHeight: 30 },
  heroBody: { color: COLORS.secondary, fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, maxWidth: 190 },
  heroButton: {
    marginTop: 4,
    height: 46,
    alignSelf: "flex-start",
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingLeft: 20,
    paddingRight: 8
  },
  heroButtonText: { color: "#ffffff", fontFamily: FONT.semibold, fontSize: 15 },
  heroArrow: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center" },
  heroArt: { flex: 1, alignItems: "center", justifyContent: "center" },
  envelopeBack: { position: "absolute", width: 110, height: 78, borderRadius: 19, backgroundColor: "#f78db3", transform: [{ rotate: "-18deg" }] },
  envelope: {
    width: 110,
    height: 78,
    borderRadius: 16,
    backgroundColor: "#FFF7FB",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "10deg" }],
    shadowColor: COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }
  },
  envelopeText: { color: "#9f1239", fontFamily: FONT.semibold, fontSize: 13, lineHeight: 18, fontStyle: "italic", textAlign: "center" },
  heroHeart: { position: "absolute", bottom: 28, left: 6 },
  heroSmallHeart: { position: "absolute", top: 24, left: 5 },
  heroPlane: { position: "absolute", top: 16, right: -2, transform: [{ rotate: "25deg" }] },
  heroDots: { position: "absolute", bottom: 14, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 8 },
  activeHeroDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  heroDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#D1D5DB" },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: -12 },
  sectionTitle: { color: COLORS.text, fontFamily: FONT.semibold, fontSize: 22, lineHeight: 28 },
  seeAll: { color: COLORS.primary, fontFamily: FONT.medium, fontSize: 14 },
  cardRail: { gap: 12, paddingRight: 4 },
  templateCard: {
    width: 160,
    height: 220,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    padding: 12,
    ...softShadow
  },
  cardImage: { width: "100%", height: 120, borderRadius: 16 },
  visualPanel: { alignItems: "center", justifyContent: "center", overflow: "hidden" },
  visualCircle: { position: "absolute", width: 86, height: 86, borderRadius: 43, opacity: 0.14 },
  visualLine: { position: "absolute", bottom: 0, left: 0, right: 0, height: 3, opacity: 0.7 },
  templateInfo: { gap: 4, paddingTop: 12, paddingRight: 18 },
  templateTitle: { color: COLORS.text, fontFamily: FONT.semibold, fontSize: 17, lineHeight: 22 },
  templateMeta: { color: COLORS.secondary, fontFamily: FONT.regular, fontSize: 13, lineHeight: 18 },
  moreIcon: { position: "absolute", right: 12, bottom: 24 },
  badge: {
    position: "absolute",
    left: 20,
    top: 20,
    overflow: "hidden",
    borderRadius: 10,
    color: "#ffffff",
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontFamily: FONT.semibold,
    fontSize: 12
  },
  popularBadge: { backgroundColor: COLORS.primary },
  newBadge: { backgroundColor: "#22C55E" },
  premiumBanner: {
    height: 88,
    borderRadius: 20,
    backgroundColor: "#FFF8E7",
    borderWidth: 1,
    borderColor: "#FFF1C2",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 20
  },
  crownBox: { width: 42, height: 42, borderRadius: 14, backgroundColor: COLORS.background, alignItems: "center", justifyContent: "center" },
  premiumCopy: { flex: 1, gap: 3 },
  premiumTitle: { color: COLORS.text, fontFamily: FONT.semibold, fontSize: 15, lineHeight: 20 },
  premiumText: { color: COLORS.secondary, fontFamily: FONT.regular, fontSize: 12, lineHeight: 17 },
  upgradePill: { height: 42, borderRadius: 14, borderWidth: 1, borderColor: "#FBCFE8", backgroundColor: "#FFF1F7", alignItems: "center", justifyContent: "center", paddingHorizontal: 14 },
  upgradeText: { color: COLORS.primary, fontFamily: FONT.semibold, fontSize: 13 },
  loadingCard: { minHeight: 92, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background, alignItems: "center", justifyContent: "center", gap: 8 },
  loadingText: { color: COLORS.secondary, fontFamily: FONT.medium, fontSize: 13 }
});
