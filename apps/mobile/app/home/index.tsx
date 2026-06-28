import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
  const { width } = useWindowDimensions();
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
  const isNarrow = width < 370;
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
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, isNarrow ? styles.contentNarrow : null]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={styles.logoMark}>
              <Ionicons color="#ffffff" name="paper-plane" size={21} />
            </View>
            <View style={styles.brandCopy}>
              <Text adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1} style={[styles.logo, isNarrow ? styles.logoNarrow : null]}>
                AIRPLANE
              </Text>
              <Text numberOfLines={1} style={styles.tagline}>
                Create moments that fly
              </Text>
            </View>
          </View>
          <View style={styles.topActions}>
            <Link href={"/subscription" as never} asChild>
              <Pressable style={styles.proPill}>
                <Ionicons color="#f59e0b" name="diamond" size={14} />
                <Text style={styles.proText}>{usage?.plan === "pro" ? "Pro" : "Pro"}</Text>
              </Pressable>
            </Link>
            <Pressable accessibilityLabel="Notifications" style={styles.bellButton}>
              <Ionicons color={COLORS.text} name="notifications-outline" size={20} />
              <View style={styles.notificationDot} />
            </Pressable>
          </View>
        </View>

        <View style={styles.searchRow}>
          <Pressable style={styles.searchBox} onPress={() => router.push("/templates" as never)}>
            <Ionicons color="#9CA3AF" name="search-outline" size={17} />
            <TextInput
              editable={false}
              pointerEvents="none"
              placeholder="Search templates, occasions, experiences..."
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
            />
          </Pressable>
          <Pressable accessibilityLabel="Discover templates" style={styles.sparkleButton} onPress={() => router.push("/templates" as never)}>
            <Ionicons color={COLORS.primary} name="sparkles-outline" size={20} />
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRail}>
          {HOME_CATEGORIES.map((category) => (
            <Pressable key={category.label} style={[styles.categoryTile, isNarrow ? styles.categoryTileNarrow : null]} onPress={() => router.push("/templates" as never)}>
              <View style={[styles.categoryIcon, { backgroundColor: category.tone }]}>
                <Ionicons color={COLORS.primary} name={category.icon} size={21} />
              </View>
              <Text adjustsFontSizeToFit minimumFontScale={0.75} numberOfLines={1} style={styles.categoryLabel}>
                {category.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={[styles.heroCard, isNarrow ? styles.heroCardNarrow : null]}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>Make every moment</Text>
            <Text style={styles.heroAccent}>unforgettable</Text>
            <Text style={styles.heroBody}>Create beautiful, interactive experiences in minutes.</Text>
            <Link href={"/templates" as never} asChild>
              <Pressable style={styles.heroButton}>
                <Text style={styles.heroButtonText}>Create Now</Text>
                <View style={styles.heroArrow}>
                  <Ionicons color={COLORS.primary} name="arrow-forward" size={16} />
                </View>
              </Pressable>
            </Link>
          </View>
          <View style={[styles.heroArt, isNarrow ? styles.heroArtNarrow : null]}>
            <View style={[styles.envelopeBack, isNarrow ? styles.envelopeBackNarrow : null]} />
            <View style={[styles.envelope, isNarrow ? styles.envelopeNarrow : null]}>
              <Text style={styles.envelopeText}>Will you{"\n"}marry me?</Text>
            </View>
            <Ionicons color="#f43f7f" name="heart" size={24} style={styles.heroHeart} />
            <Ionicons color="#fda4c7" name="heart" size={16} style={styles.heroSmallHeart} />
            <Ionicons color="#ffffff" name="paper-plane" size={18} style={styles.heroPlane} />
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
            {recentExperiences.map((experience) => <RecentCard compact={isNarrow} experience={experience} key={experience.id} />)}
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
              <TrendingCard compact={isNarrow} key={template.id} rank={index} template={template} />
            ))}
          </ScrollView>
        )}

        <Link href={"/subscription" as never} asChild>
          <Pressable style={styles.premiumBanner}>
            <View style={styles.crownBox}>
              <Ionicons color="#f59e0b" name="diamond" size={22} />
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
    </SafeAreaView>
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

function RecentCard({ compact, experience }: { compact: boolean; experience: Experience }) {
  return (
    <Pressable style={[styles.templateCard, compact ? styles.templateCardNarrow : null]} onPress={() => router.push("/experiences" as never)}>
      <CardImage accent={experience.theme.accent} background={experience.theme.background} category="love" compact={compact} uri={experience.coverPhotoUrl} />
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

function TrendingCard({ compact, rank, template }: { compact: boolean; rank: number; template: Template }) {
  return (
    <Link href={{ pathname: "/templates/[id]", params: { id: template.id } }} asChild>
      <Pressable style={[styles.templateCard, compact ? styles.templateCardNarrow : null]}>
        <CardImage accent={template.defaultTheme.accent} background={template.defaultTheme.background} category={template.category} compact={compact} uri={template.thumbnailUrl} />
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
  compact,
  uri
}: {
  accent: string;
  background: string;
  category: TemplateCategory | "love";
  compact: boolean;
  uri: string | null;
}) {
  if (uri) {
    return <Image resizeMode="cover" source={{ uri }} style={[styles.cardImage, compact ? styles.cardImageNarrow : null]} />;
  }

  return <VisualPanel accent={accent} background={background} category={category} compact={compact} />;
}

function VisualPanel({ accent, background, category, compact }: { accent: string; background: string; category: TemplateCategory | "love"; compact: boolean }) {
  return (
    <View style={[styles.cardImage, compact ? styles.cardImageNarrow : null, styles.visualPanel, { backgroundColor: background }]}>
      <View style={[styles.visualCircle, { backgroundColor: accent }]} />
      <Ionicons color={accent} name={getTemplateIcon(category)} size={32} />
      <View style={[styles.visualLine, { backgroundColor: accent }]} />
    </View>
  );
}

function LoadingCard({ label }: { label: string }) {
  return (
    <View style={styles.loadingCard}>
      <Ionicons color={COLORS.primary} name="sparkles-outline" size={18} />
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
  content: { gap: 12, paddingHorizontal: 14, paddingTop: 4, paddingBottom: 88 },
  contentNarrow: { paddingHorizontal: 12 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  brandRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  brandCopy: { flex: 1, minWidth: 0 },
  logoMark: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-10deg" }]
  },
  logo: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 22, lineHeight: 25, letterSpacing: 0 },
  logoNarrow: { fontSize: 20, lineHeight: 23 },
  tagline: { color: COLORS.secondary, fontFamily: FONT.medium, fontSize: 10, lineHeight: 13 },
  topActions: { flexShrink: 0, flexDirection: "row", alignItems: "center", gap: 6 },
  proPill: {
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    ...softShadow
  },
  proText: { color: COLORS.primary, fontFamily: FONT.semibold, fontSize: 10 },
  bellButton: { width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.background, alignItems: "center", justifyContent: "center" },
  notificationDot: { position: "absolute", right: 8, top: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  searchRow: { flexDirection: "row", gap: 8 },
  searchBox: {
    flex: 1,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    ...softShadow
  },
  searchInput: { flex: 1, color: COLORS.text, fontFamily: FONT.regular, fontSize: 12, padding: 0 },
  sparkleButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FCE7F3",
    backgroundColor: "#FFF1F7",
    alignItems: "center",
    justifyContent: "center"
  },
  categoryRail: { gap: 8, paddingRight: 4 },
  categoryTile: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: 5,
    ...softShadow
  },
  categoryTileNarrow: { width: 52, height: 54 },
  categoryIcon: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  categoryLabel: { color: COLORS.text, fontFamily: FONT.medium, fontSize: 9, lineHeight: 11, textAlign: "center" },
  heroCard: {
    height: 150,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#FBCFE8",
    backgroundColor: "#FFE5EF",
    overflow: "hidden",
    paddingHorizontal: 15,
    paddingVertical: 14,
    flexDirection: "row"
  },
  heroCardNarrow: { height: 142, paddingHorizontal: 13, paddingVertical: 12 },
  heroCopy: { flex: 1.18, gap: 4, justifyContent: "center", zIndex: 2 },
  heroTitle: { color: COLORS.text, fontFamily: FONT.regular, fontSize: 16, lineHeight: 20 },
  heroAccent: { color: COLORS.primary, fontFamily: FONT.bold, fontSize: 19, lineHeight: 23 },
  heroBody: { color: COLORS.secondary, fontFamily: FONT.regular, fontSize: 10, lineHeight: 15, maxWidth: 148 },
  heroButton: {
    marginTop: 4,
    height: 34,
    alignSelf: "flex-start",
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 7,
    paddingLeft: 13,
    paddingRight: 5
  },
  heroButtonText: { color: "#ffffff", fontFamily: FONT.semibold, fontSize: 11 },
  heroArrow: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center" },
  heroArt: { flex: 0.92, alignItems: "center", justifyContent: "center", minWidth: 92 },
  heroArtNarrow: { flex: 0.82, minWidth: 78 },
  envelopeBack: { position: "absolute", width: 86, height: 62, borderRadius: 15, backgroundColor: "#f78db3", transform: [{ rotate: "-18deg" }] },
  envelopeBackNarrow: { width: 76, height: 56 },
  envelope: {
    width: 86,
    height: 62,
    borderRadius: 12,
    backgroundColor: "#FFF7FB",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "10deg" }],
    shadowColor: COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }
  },
  envelopeNarrow: { width: 76, height: 56 },
  envelopeText: { color: "#9f1239", fontFamily: FONT.semibold, fontSize: 9, lineHeight: 13, fontStyle: "italic", textAlign: "center" },
  heroHeart: { position: "absolute", bottom: 17, left: 4 },
  heroSmallHeart: { position: "absolute", top: 14, left: 4 },
  heroPlane: { position: "absolute", top: 9, right: -2, transform: [{ rotate: "25deg" }] },
  heroDots: { position: "absolute", bottom: 8, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 5 },
  activeHeroDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary },
  heroDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#D1D5DB" },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: -6 },
  sectionTitle: { color: COLORS.text, fontFamily: FONT.semibold, fontSize: 16, lineHeight: 21 },
  seeAll: { color: COLORS.primary, fontFamily: FONT.medium, fontSize: 11 },
  cardRail: { gap: 8, paddingRight: 4 },
  templateCard: {
    width: 122,
    height: 162,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    padding: 8,
    ...softShadow
  },
  templateCardNarrow: { width: 112, height: 154 },
  cardImage: { width: "100%", height: 82, borderRadius: 11 },
  cardImageNarrow: { height: 76 },
  visualPanel: { alignItems: "center", justifyContent: "center", overflow: "hidden" },
  visualCircle: { position: "absolute", width: 86, height: 86, borderRadius: 43, opacity: 0.14 },
  visualLine: { position: "absolute", bottom: 0, left: 0, right: 0, height: 3, opacity: 0.7 },
  templateInfo: { gap: 2, paddingTop: 7, paddingRight: 14 },
  templateTitle: { color: COLORS.text, fontFamily: FONT.semibold, fontSize: 12, lineHeight: 16 },
  templateMeta: { color: COLORS.secondary, fontFamily: FONT.regular, fontSize: 10, lineHeight: 13 },
  moreIcon: { position: "absolute", right: 8, bottom: 17 },
  badge: {
    position: "absolute",
    left: 12,
    top: 12,
    overflow: "hidden",
    borderRadius: 10,
    color: "#ffffff",
    paddingHorizontal: 6,
    paddingVertical: 4,
    fontFamily: FONT.semibold,
    fontSize: 9
  },
  popularBadge: { backgroundColor: COLORS.primary },
  newBadge: { backgroundColor: "#22C55E" },
  premiumBanner: {
    height: 64,
    borderRadius: 14,
    backgroundColor: "#FFF8E7",
    borderWidth: 1,
    borderColor: "#FFF1C2",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12
  },
  crownBox: { width: 30, height: 30, borderRadius: 10, backgroundColor: COLORS.background, alignItems: "center", justifyContent: "center" },
  premiumCopy: { flex: 1, gap: 3 },
  premiumTitle: { color: COLORS.text, fontFamily: FONT.semibold, fontSize: 11, lineHeight: 15 },
  premiumText: { color: COLORS.secondary, fontFamily: FONT.regular, fontSize: 9, lineHeight: 12 },
  upgradePill: { height: 28, borderRadius: 10, borderWidth: 1, borderColor: "#FBCFE8", backgroundColor: "#FFF1F7", alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  upgradeText: { color: COLORS.primary, fontFamily: FONT.semibold, fontSize: 10 },
  loadingCard: { minHeight: 66, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background, alignItems: "center", justifyContent: "center", gap: 6 },
  loadingText: { color: COLORS.secondary, fontFamily: FONT.medium, fontSize: 11 }
});
