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
};

const FILTERS: Array<{ id: HomeFilter; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { id: "all", label: "All", icon: "leaf-outline" },
  { id: "proposal", label: "Proposal", icon: "heart-outline" },
  { id: "memory", label: "Memory", icon: "image-outline" },
  { id: "surprise", label: "Surprise", icon: "gift-outline" },
  { id: "anniversary", label: "Anniversary", icon: "calendar-outline" }
];

const FALLBACK_TEMPLATES: DisplayTemplate[] = [
  { id: "fallback-proposal", name: "Will You Marry Me?", category: "proposal", routeId: "marriage-proposal" },
  { id: "fallback-trip", name: "Our First Trip Together", category: "memory", routeId: "date-proposal" },
  { id: "fallback-birthday", name: "Birthday Surprise", category: "surprise", routeId: "birthday-surprise" },
  { id: "fallback-reasons", name: "Reasons I Love You", category: "memory", routeId: "birthday-memory-book" },
  { id: "fallback-anniversary", name: "Anniversary Journey", category: "anniversary", routeId: "anniversary-story" },
  { id: "fallback-girlfriend", name: "Be My Girlfriend?", category: "proposal", routeId: "date-proposal" }
];

export default function HomeScreen() {
  const appTheme = useAppTheme();
  const session = useSessionStore((state) => state.session);
  const { width } = useWindowDimensions();
  const [filter, setFilter] = useState<HomeFilter>("all");
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const templatesQuery = useQuery({
    queryKey: ["templates"],
    queryFn: getTemplates
  });
  const availableWidth = measuredWidth || width;
  const isCompact = availableWidth < 380;
  const horizontalPadding = isCompact ? 12 : 16;
  const contentWidth = Math.max(0, availableWidth - horizontalPadding * 2);
  const columnCount = 2;
  const gridGap = 12;
  const cardWidth = Math.floor((contentWidth - gridGap * (columnCount - 1)) / columnCount);
  const cardHeight = Math.max(150, Math.min(165, Math.round(cardWidth * 0.9)));
  const creator = getCreator(session?.user.user_metadata?.full_name, session?.user.email);
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
        columnWrapperStyle={columnCount > 1 ? styles.gridRow : undefined}
        onLayout={(event) => setMeasuredWidth(event.nativeEvent.layout.width)}
        refreshControl={<RefreshControl refreshing={templatesQuery.isRefetching} onRefresh={() => templatesQuery.refetch()} />}
        contentContainerStyle={[styles.content, { paddingHorizontal: horizontalPadding }]}
        ListHeaderComponent={
          <View style={styles.headerStack}>
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <View style={styles.greetingRow}>
                  <Text numberOfLines={1} style={[styles.greeting, { color: appTheme.text }, isCompact ? styles.greetingCompact : null]}>
                    {creator.greeting}
                  </Text>
                </View>
                <Text style={[styles.subtitle, { color: appTheme.secondaryText }, isCompact ? styles.subtitleCompact : null]}>What will you create today?</Text>
              </View>
              <View style={styles.headerActions}>
                <Pressable accessibilityLabel="Notifications" style={[styles.iconButton, { backgroundColor: appTheme.surface }]}>
                  <Ionicons color={appTheme.text} name="notifications-outline" size={20} />
                  <View style={[styles.iconDot, { backgroundColor: appTheme.primary }]} />
                </Pressable>
                <Pressable accessibilityLabel="Profile" style={[styles.avatar, { backgroundColor: appTheme.accent }]} onPress={() => router.push("/profile" as never)}>
                  <Text style={[styles.avatarText, { color: appTheme.surface }]}>{creator.avatar}</Text>
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
        renderItem={({ index, item }) => (
          <TemplateCard
            height={cardHeight}
            marginRight={index % columnCount === columnCount - 1 ? 0 : gridGap}
            position={index}
            template={item}
            width={cardWidth}
          />
        )}
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
      <Ionicons color={active ? appTheme.surface : appTheme.secondaryText} name={icon} size={14} />
      <Text style={[styles.chipText, { color: active ? appTheme.surface : appTheme.secondaryText }]}>{label}</Text>
    </Pressable>
  );
}

function TemplateCard({ height, marginRight, position, template, width }: { height: number; marginRight: number; position: number; template: DisplayTemplate; width: number }) {
  const appTheme = useAppTheme();
  const artVariant = position % 4;

  return (
    <Link href={{ pathname: "/templates/[id]", params: { id: template.routeId } }} asChild>
      <Pressable style={[styles.templateCard, { width, height, marginRight, backgroundColor: appTheme.surface, borderColor: appTheme.border, shadowColor: appTheme.text }]}>
        <DreamyArt variant={artVariant} />
        <View style={[styles.cardOverlay, { backgroundColor: appTheme.surface }]} />
        <View style={styles.cardContent}>
          <Text numberOfLines={2} style={[styles.cardTitle, { color: appTheme.text }]}>{template.name}</Text>
          <View style={[styles.cardPill, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]}>
            <Text numberOfLines={1} style={[styles.cardPillText, { color: getCategoryColor(template.category, appTheme.primary, appTheme.accent, appTheme.primaryDark) }]}>{formatCategory(template.category)}</Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

function DreamyArt({ variant }: { variant: number }) {
  const appTheme = useAppTheme();
  const flip = variant % 2 === 1;

  return (
    <View style={styles.artLayer} pointerEvents="none">
      <LinearGradient colors={[appTheme.surfaceAlt, appTheme.primaryLight, appTheme.background]} style={styles.artSky} />
      <View style={[styles.sun, { backgroundColor: variant === 2 ? appTheme.accent : appTheme.primary }]} />
      <View style={[styles.arc, { borderColor: appTheme.border }, flip ? styles.arcFlip : null]} />
      <View style={[styles.hillBack, { backgroundColor: appTheme.muted }, flip ? styles.hillBackFlip : null]} />
      <View style={[styles.hillFront, { backgroundColor: variant === 1 ? appTheme.accent : appTheme.primary }, flip ? styles.hillFrontFlip : null]} />
      <View style={[styles.path, { backgroundColor: appTheme.surface }]} />
      <View style={[styles.flowerDot, styles.flowerOne, { backgroundColor: appTheme.primary }]} />
      <View style={[styles.flowerDot, styles.flowerTwo, { backgroundColor: appTheme.accent }]} />
      <View style={[styles.flowerDot, styles.flowerThree, { backgroundColor: appTheme.mutedText }]} />
    </View>
  );
}

function mapTemplateForHome(template: Template): DisplayTemplate {
  return {
    id: template.id,
    name: template.name,
    category: getHomeCategory(template),
    routeId: template.id
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

function getCreator(fullName?: unknown, email?: string) {
  const fallback = { avatar: "A", greeting: "Good morning 👋" };

  if (typeof fullName === "string" && fullName.trim()) {
    const firstName = fullName.trim().split(/\s+/)[0] ?? "";

    if (firstName && firstName.length <= 14 && !/\d/.test(firstName)) {
      return { avatar: firstName.charAt(0).toUpperCase(), greeting: `Good morning, ${firstName} 🌿` };
    }
  }

  return fallback;
}

function formatCategory(category: HomeFilter) {
  return category === "all" ? "All" : category.charAt(0).toUpperCase() + category.slice(1);
}

function getCategoryColor(category: HomeFilter, primary: string, accent: string, primaryDark: string) {
  if (category === "surprise") {
    return accent;
  }

  if (category === "anniversary") {
    return primaryDark;
  }

  return primary;
}

const softShadow = {
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingTop: 6, paddingBottom: 90 },
  headerStack: { gap: 12, marginBottom: 12 },
  header: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  headerCopy: { flex: 1, minWidth: 0, gap: 3 },
  greetingRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  greeting: { fontFamily: FONT.bold, fontSize: 16, lineHeight: 20 },
  greetingCompact: { fontSize: 15, lineHeight: 19 },
  subtitle: { fontFamily: FONT.medium, fontSize: 11, lineHeight: 14 },
  subtitleCompact: { fontSize: 10 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 9 },
  iconButton: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", ...softShadow },
  iconDot: { position: "absolute", right: 8, top: 7, width: 8, height: 8, borderRadius: 4 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: FONT.bold, fontSize: 15, lineHeight: 19 },
  searchBar: { height: 44, borderRadius: 16, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, ...softShadow },
  searchInput: { flex: 1, fontFamily: FONT.regular, fontSize: 13, padding: 0 },
  searchInputCompact: { fontSize: 12 },
  chipRail: { gap: 8, paddingRight: 24 },
  chip: { height: 30, borderRadius: 999, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, ...softShadow },
  chipText: { fontFamily: FONT.medium, fontSize: 11, lineHeight: 14 },
  sectionHeader: { minHeight: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2, marginBottom: 12 },
  sectionTitle: { fontFamily: FONT.bold, fontSize: 16, lineHeight: 20 },
  sectionTitleCompact: { fontSize: 15 },
  seeAllButton: { flexDirection: "row", alignItems: "center", gap: 2 },
  seeAll: { fontFamily: FONT.medium, fontSize: 12, lineHeight: 16 },
  gridRow: {},
  templateCard: { marginBottom: 12, borderRadius: 16, borderWidth: 1, overflow: "hidden", ...softShadow },
  artLayer: { ...StyleSheet.absoluteFillObject, overflow: "hidden" },
  artSky: { ...StyleSheet.absoluteFillObject },
  sun: { position: "absolute", right: 18, top: 16, width: 30, height: 30, borderRadius: 15, opacity: 0.22 },
  arc: { position: "absolute", left: 16, top: 18, width: 64, height: 64, borderRadius: 32, borderWidth: 1, opacity: 0.8 },
  arcFlip: { left: undefined, right: 14, top: 26 },
  hillBack: { position: "absolute", left: -30, right: 22, bottom: 20, height: 76, borderTopLeftRadius: 120, borderTopRightRadius: 150, opacity: 0.48, transform: [{ rotate: "-8deg" }] },
  hillBackFlip: { left: 22, right: -30, transform: [{ rotate: "8deg" }] },
  hillFront: { position: "absolute", left: 20, right: -40, bottom: -22, height: 92, borderTopLeftRadius: 130, borderTopRightRadius: 120, opacity: 0.44, transform: [{ rotate: "8deg" }] },
  hillFrontFlip: { left: -40, right: 20, transform: [{ rotate: "-8deg" }] },
  path: { position: "absolute", left: "42%", bottom: -8, width: 24, height: 104, borderRadius: 18, opacity: 0.54, transform: [{ rotate: "9deg" }] },
  flowerDot: { position: "absolute", width: 5, height: 5, borderRadius: 2.5, opacity: 0.75 },
  flowerOne: { left: 16, bottom: 22 },
  flowerTwo: { right: 24, bottom: 36 },
  flowerThree: { left: 36, bottom: 48 },
  cardOverlay: { ...StyleSheet.absoluteFillObject, opacity: 0.08 },
  cardContent: { flex: 1, alignItems: "center", justifyContent: "center", padding: 10, gap: 8 },
  cardTitle: { fontFamily: FONT.bold, fontSize: 13, lineHeight: 16, textAlign: "center" },
  cardPill: { minHeight: 25, borderRadius: 999, borderWidth: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 10 },
  cardPillText: { fontFamily: FONT.medium, fontSize: 10, lineHeight: 13 },
  emptyCard: { minHeight: 84, borderRadius: 16, borderWidth: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  emptyText: { fontFamily: FONT.medium, fontSize: 12 }
});
