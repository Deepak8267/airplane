import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Template, TemplateCategory } from "@airplane/shared";
import { BottomNav } from "@/components/bottom-nav";
import { getTemplates } from "@/features/templates/template-service";
import { useAppTheme } from "@/stores/app-theme-store";
import { useSessionStore } from "@/stores/session-store";

const FONT = {
  regular: "Poppins_400Regular",
  medium: "Poppins_500Medium",
  semibold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold"
};

type HomeFilter = "all" | "proposal" | "memory" | "surprise" | "anniversary";

type DisplayTemplate = {
  id: string;
  name: string;
  category: HomeFilter;
  routeId: string;
  theme: {
    background: string;
    foreground: string;
    accent: string;
    muted: string;
  };
};

const FILTERS: Array<{ id: HomeFilter; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { id: "all", label: "All", icon: "leaf-outline" },
  { id: "proposal", label: "Proposal", icon: "heart-outline" },
  { id: "memory", label: "Memory", icon: "image-outline" },
  { id: "surprise", label: "Surprise", icon: "gift-outline" },
  { id: "anniversary", label: "Anniversary", icon: "calendar-outline" }
];

const FALLBACK_TEMPLATES: DisplayTemplate[] = [
  { id: "fallback-proposal", name: "Will You Marry Me?", category: "proposal", routeId: "marriage-proposal", theme: { background: "#F8EFE3", foreground: "#2F3A2F", accent: "#B87A68", muted: "#E9D8C5" } },
  { id: "fallback-trip", name: "Our First Trip Together", category: "memory", routeId: "date-proposal", theme: { background: "#DDE8D5", foreground: "#FFFFFF", accent: "#6F8A61", muted: "#C8D7BC" } },
  { id: "fallback-birthday", name: "Birthday Surprise", category: "surprise", routeId: "birthday-surprise", theme: { background: "#E8E2D2", foreground: "#FFFFFF", accent: "#8B7557", muted: "#D9CBB4" } },
  { id: "fallback-reasons", name: "Reasons I Love You", category: "memory", routeId: "birthday-memory-book", theme: { background: "#F3EAD9", foreground: "#2F3A2F", accent: "#6F8A61", muted: "#E4D7BF" } },
  { id: "fallback-anniversary", name: "Anniversary Journey", category: "anniversary", routeId: "anniversary-story", theme: { background: "#F6E6D6", foreground: "#2F3A2F", accent: "#BE7D4F", muted: "#EBD1B8" } },
  { id: "fallback-girlfriend", name: "Be My Girlfriend?", category: "proposal", routeId: "date-proposal", theme: { background: "#F8E7DD", foreground: "#2F3A2F", accent: "#D96B6B", muted: "#EBCDC4" } }
];

export default function HomeScreen() {
  const appTheme = useAppTheme();
  const session = useSessionStore((state) => state.session);
  const { width } = useWindowDimensions();
  const [filter, setFilter] = useState<HomeFilter>("all");
  const templatesQuery = useQuery({
    queryKey: ["templates"],
    queryFn: getTemplates
  });
  const isCompact = width < 360;
  const horizontalPadding = isCompact ? 12 : 14;
  const columnCount = width >= 360 ? 3 : 2;
  const gridGap = 10;
  const cardWidth = Math.floor((width - horizontalPadding * 2 - gridGap * (columnCount - 1)) / columnCount);
  const cardHeight = columnCount === 3 ? Math.max(150, Math.min(cardWidth * 1.58, 165)) : Math.max(180, Math.min(cardWidth * 1.35, 200));
  const creatorName = getCreatorName(session?.user.user_metadata?.full_name, session?.user.email);
  const templates = useMemo(() => {
    const source = templatesQuery.data?.length ? templatesQuery.data.map(mapTemplateForHome) : FALLBACK_TEMPLATES;
    return source.filter((template) => filter === "all" || template.category === filter).slice(0, 9);
  }, [filter, templatesQuery.data]);

  return (
    <SafeAreaView edges={["top"]} style={[styles.screen, { backgroundColor: appTheme.background }]}>
      <FlatList
        data={templates}
        key={columnCount}
        keyExtractor={(item) => item.id}
        numColumns={columnCount}
        columnWrapperStyle={columnCount > 1 ? { gap: gridGap } : undefined}
        refreshControl={<RefreshControl refreshing={templatesQuery.isRefetching} onRefresh={() => templatesQuery.refetch()} />}
        contentContainerStyle={[styles.content, { paddingHorizontal: horizontalPadding }]}
        ListHeaderComponent={
          <View style={styles.headerStack}>
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <View style={styles.greetingRow}>
                  <Text numberOfLines={1} style={[styles.greeting, { color: appTheme.text }, isCompact ? styles.greetingCompact : null]}>
                    Good morning, {creatorName}
                  </Text>
                  <Ionicons color={appTheme.primary} name="leaf-outline" size={17} />
                </View>
                <Text style={[styles.subtitle, { color: appTheme.secondaryText }, isCompact ? styles.subtitleCompact : null]}>What will you create today?</Text>
              </View>
              <View style={styles.headerActions}>
                <Pressable accessibilityLabel="Notifications" style={[styles.iconButton, { backgroundColor: appTheme.surface }]}>
                  <Ionicons color={appTheme.text} name="notifications-outline" size={20} />
                  <View style={[styles.iconDot, { backgroundColor: appTheme.primary }]} />
                </Pressable>
                <Pressable accessibilityLabel="Profile" style={[styles.avatar, { backgroundColor: appTheme.accent }]} onPress={() => router.push("/profile" as never)}>
                  <Text style={styles.avatarText}>{creatorName.charAt(0).toUpperCase()}</Text>
                </Pressable>
              </View>
            </View>

            <Pressable style={[styles.searchBar, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]} onPress={() => router.push("/templates" as never)}>
              <Ionicons color={appTheme.mutedText} name="search-outline" size={20} />
              <TextInput
                editable={false}
                pointerEvents="none"
                placeholder="Search templates..."
                placeholderTextColor={appTheme.mutedText}
                style={[styles.searchInput, { color: appTheme.text }, isCompact ? styles.searchInputCompact : null]}
              />
              <Ionicons color={appTheme.secondaryText} name="options-outline" size={20} />
            </Pressable>

            <FlatList
              data={FILTERS}
              horizontal
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRail}
              renderItem={({ item }) => <CategoryChip active={item.id === filter} icon={item.icon} label={item.label} onPress={() => setFilter(item.id)} />}
            />

            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: appTheme.text }, isCompact ? styles.sectionTitleCompact : null]}>Popular Templates</Text>
              <Pressable style={styles.seeAllButton} onPress={() => router.push("/templates" as never)}>
                <Text style={[styles.seeAll, { color: appTheme.primary }]}>See All</Text>
                <Ionicons color={appTheme.primary} name="chevron-forward" size={16} />
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={[styles.emptyCard, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]}>
            <Ionicons color={appTheme.primary} name="leaf-outline" size={22} />
            <Text style={[styles.emptyText, { color: appTheme.secondaryText }]}>{templatesQuery.isLoading ? "Loading templates..." : "No templates found."}</Text>
          </View>
        }
        renderItem={({ item }) => <TemplateCard height={cardHeight} template={item} width={cardWidth} />}
      />
      <BottomNav active="home" variant="main" />
    </SafeAreaView>
  );
}

function CategoryChip({ active, icon, label, onPress }: { active: boolean; icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  const appTheme = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.chip, { backgroundColor: active ? appTheme.primary : appTheme.surface, borderColor: active ? appTheme.primary : appTheme.border }]}
      onPress={onPress}
    >
      <Ionicons color={active ? "#FFFFFF" : appTheme.secondaryText} name={icon} size={14} />
      <Text style={[styles.chipText, { color: active ? "#FFFFFF" : appTheme.secondaryText }]}>{label}</Text>
    </Pressable>
  );
}

function TemplateCard({ height, template, width }: { height: number; template: DisplayTemplate; width: number }) {
  const appTheme = useAppTheme();
  const isDarkCard = template.theme.foreground === "#FFFFFF";

  return (
    <Link href={{ pathname: "/templates/[id]", params: { id: template.routeId } }} asChild>
      <Pressable style={[styles.templateCard, { width, height, backgroundColor: template.theme.background, borderColor: appTheme.border }]}>
        <DreamyArt accent={template.theme.accent} muted={template.theme.muted} />
        <View style={[styles.cardOverlay, isDarkCard ? styles.cardOverlayDark : null]} />
        <View style={styles.cardContent}>
          <Text numberOfLines={2} style={[styles.cardTitle, { color: template.theme.foreground }]}>{template.name}</Text>
          <View style={[styles.cardPill, { backgroundColor: isDarkCard ? "rgba(255,255,255,0.76)" : appTheme.surfaceAlt, borderColor: isDarkCard ? "rgba(255,255,255,0.5)" : appTheme.border }]}>
            <Text numberOfLines={1} style={[styles.cardPillText, { color: isDarkCard ? appTheme.text : template.theme.accent }]}>{formatCategory(template.category)}</Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

function DreamyArt({ accent, muted }: { accent: string; muted: string }) {
  return (
    <View style={styles.artLayer} pointerEvents="none">
      <LinearGradient colors={[muted, "rgba(255,255,255,0.2)"]} style={styles.artSky} />
      <View style={[styles.sun, { backgroundColor: accent }]} />
      <View style={[styles.hillBack, { backgroundColor: muted }]} />
      <View style={[styles.hillFront, { backgroundColor: accent }]} />
      <View style={styles.path} />
      <View style={[styles.flowerDot, styles.flowerOne, { backgroundColor: accent }]} />
      <View style={[styles.flowerDot, styles.flowerTwo, { backgroundColor: accent }]} />
      <View style={[styles.flowerDot, styles.flowerThree, { backgroundColor: muted }]} />
    </View>
  );
}

function mapTemplateForHome(template: Template): DisplayTemplate {
  return {
    id: template.id,
    name: template.name,
    category: getHomeCategory(template),
    routeId: template.id,
    theme: {
      background: template.defaultTheme.background,
      foreground: template.defaultTheme.foreground,
      accent: template.defaultTheme.accent,
      muted: template.defaultTheme.muted
    }
  };
}

function getHomeCategory(template: Template): HomeFilter {
  const value = `${template.name} ${template.description} ${template.category} ${template.templateType}`.toLowerCase();

  if (value.includes("anniversary")) {
    return "anniversary";
  }

  if (value.includes("birthday") || value.includes("surprise")) {
    return "surprise";
  }

  if (value.includes("memory") || value.includes("friend") || value.includes("family")) {
    return "memory";
  }

  return "proposal";
}

function getCreatorName(fullName?: unknown, email?: string) {
  if (typeof fullName === "string" && fullName.trim()) {
    return fullName.trim().split(/\s+/)[0] ?? "Aradhya";
  }

  if (email) {
    return email.split("@")[0]?.split(/[._-]/)[0] ?? "Aradhya";
  }

  return "Aradhya";
}

function formatCategory(category: HomeFilter) {
  return category === "all" ? "All" : category.charAt(0).toUpperCase() + category.slice(1);
}

const softShadow = {
  shadowColor: "#111827",
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { gap: 10, paddingTop: 6, paddingBottom: 92 },
  headerStack: { gap: 12, marginBottom: 10 },
  header: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  headerCopy: { flex: 1, minWidth: 0, gap: 3 },
  greetingRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  greeting: { fontFamily: FONT.bold, fontSize: 16, lineHeight: 20 },
  greetingCompact: { fontSize: 15, lineHeight: 19 },
  subtitle: { fontFamily: FONT.medium, fontSize: 11, lineHeight: 14 },
  subtitleCompact: { fontSize: 10 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconButton: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", ...softShadow },
  iconDot: { position: "absolute", right: 8, top: 7, width: 8, height: 8, borderRadius: 4 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#FFFFFF", fontFamily: FONT.bold, fontSize: 15, lineHeight: 19 },
  searchBar: { height: 44, borderRadius: 16, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, ...softShadow },
  searchInput: { flex: 1, fontFamily: FONT.regular, fontSize: 13, padding: 0 },
  searchInputCompact: { fontSize: 12 },
  chipRail: { gap: 8, paddingRight: 4 },
  chip: { height: 30, borderRadius: 999, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, ...softShadow },
  chipText: { fontFamily: FONT.medium, fontSize: 11, lineHeight: 14 },
  sectionHeader: { minHeight: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2 },
  sectionTitle: { fontFamily: FONT.bold, fontSize: 16, lineHeight: 20 },
  sectionTitleCompact: { fontSize: 15 },
  seeAllButton: { flexDirection: "row", alignItems: "center", gap: 2 },
  seeAll: { fontFamily: FONT.medium, fontSize: 12, lineHeight: 16 },
  templateCard: { marginBottom: 12, borderRadius: 16, borderWidth: 1, overflow: "hidden", ...softShadow },
  artLayer: { ...StyleSheet.absoluteFillObject, overflow: "hidden" },
  artSky: { ...StyleSheet.absoluteFillObject },
  sun: { position: "absolute", right: 16, top: 18, width: 32, height: 32, borderRadius: 16, opacity: 0.28 },
  hillBack: { position: "absolute", left: -34, right: 24, bottom: 20, height: 84, borderTopLeftRadius: 120, borderTopRightRadius: 150, opacity: 0.42, transform: [{ rotate: "-8deg" }] },
  hillFront: { position: "absolute", left: 20, right: -44, bottom: -24, height: 104, borderTopLeftRadius: 130, borderTopRightRadius: 120, opacity: 0.54, transform: [{ rotate: "8deg" }] },
  path: { position: "absolute", left: "42%", bottom: -8, width: 28, height: 118, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.38)", transform: [{ rotate: "9deg" }] },
  flowerDot: { position: "absolute", width: 5, height: 5, borderRadius: 2.5, opacity: 0.75 },
  flowerOne: { left: 16, bottom: 22 },
  flowerTwo: { right: 24, bottom: 36 },
  flowerThree: { left: 36, bottom: 48 },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(255,255,255,0.16)" },
  cardOverlayDark: { backgroundColor: "rgba(21,33,24,0.24)" },
  cardContent: { flex: 1, alignItems: "center", justifyContent: "center", padding: 8, gap: 9 },
  cardTitle: { fontFamily: FONT.bold, fontSize: 12, lineHeight: 16, textAlign: "center" },
  cardPill: { minHeight: 24, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 9 },
  cardPillText: { fontFamily: FONT.medium, fontSize: 9, lineHeight: 12 },
  emptyCard: { minHeight: 84, borderRadius: 16, borderWidth: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  emptyText: { fontFamily: FONT.medium, fontSize: 12 }
});
