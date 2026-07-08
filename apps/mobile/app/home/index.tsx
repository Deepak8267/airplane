import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FlatList, ImageBackground, Pressable, RefreshControl, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import type { ImageSourcePropType } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Template } from "@airplane/shared";
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
  image: ImageSourcePropType;
};

const CARD_IMAGES = {
  proposal: require("../../assets/templates/proposal-garden.png") as ImageSourcePropType,
  lake: require("../../assets/templates/lake-memory.png") as ImageSourcePropType,
  birthday: require("../../assets/templates/birthday-garden.png") as ImageSourcePropType,
  memory: require("../../assets/templates/memory-table.png") as ImageSourcePropType,
  anniversary: require("../../assets/templates/anniversary-path.png") as ImageSourcePropType,
  candlelight: require("../../assets/templates/candlelight-couple.png") as ImageSourcePropType
};

const POPULAR_TEMPLATE_CARDS: Array<{
  category: HomeFilter;
  fallbackRoute: string;
  image: ImageSourcePropType;
  match: string[];
  name: string;
}> = [
  { name: "Will You Marry Me?", category: "proposal", fallbackRoute: "marriage-proposal", image: CARD_IMAGES.proposal, match: ["marriage", "proposal"] },
  { name: "Our First Trip Together", category: "memory", fallbackRoute: "date-proposal", image: CARD_IMAGES.lake, match: ["date", "trip"] },
  { name: "Birthday Surprise", category: "surprise", fallbackRoute: "birthday-surprise", image: CARD_IMAGES.birthday, match: ["birthday surprise"] },
  { name: "Reasons I Love You", category: "memory", fallbackRoute: "birthday-memory-book", image: CARD_IMAGES.memory, match: ["memory book", "family memories", "memory"] },
  { name: "Anniversary Journey", category: "anniversary", fallbackRoute: "anniversary-story", image: CARD_IMAGES.anniversary, match: ["anniversary"] },
  { name: "Be My Girlfriend?", category: "proposal", fallbackRoute: "date-proposal", image: CARD_IMAGES.candlelight, match: ["girlfriend", "date"] }
];

const FILTERS: Array<{ id: HomeFilter; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { id: "all", label: "All", icon: "leaf-outline" },
  { id: "proposal", label: "Proposal", icon: "heart-outline" },
  { id: "memory", label: "Memory", icon: "image-outline" },
  { id: "surprise", label: "Surprise", icon: "gift-outline" },
  { id: "anniversary", label: "Anniversary", icon: "calendar-outline" }
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
  const columnCount = contentWidth >= 320 ? 3 : 2;
  const gridGap = 10;
  const cardWidth = Math.floor((contentWidth - gridGap * (columnCount - 1)) / columnCount);
  const cardHeight = columnCount === 3 ? Math.max(158, Math.min(178, Math.round(cardWidth * 1.55))) : Math.max(170, Math.min(188, Math.round(cardWidth * 1.05)));
  const creator = getCreator(session?.user.user_metadata?.full_name, session?.user.email);
  const templates = useMemo(() => {
    const source = buildPopularTemplates(templatesQuery.data ?? []);
    return source.filter((template) => filter === "all" || template.category === filter);
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
                  <Text allowFontScaling={false} numberOfLines={1} style={[styles.greeting, { color: appTheme.text }, isCompact ? styles.greetingCompact : null]}>
                    {creator.greeting}
                  </Text>
                </View>
                <Text allowFontScaling={false} style={[styles.subtitle, { color: appTheme.secondaryText }, isCompact ? styles.subtitleCompact : null]}>What will you create today?</Text>
              </View>
              <View style={styles.headerActions}>
                <Pressable accessibilityLabel="Notifications" style={[styles.iconButton, { backgroundColor: appTheme.surface }]}>
                  <Ionicons color={appTheme.text} name="notifications-outline" size={20} />
                  <View style={[styles.iconDot, { backgroundColor: appTheme.primary }]} />
                </Pressable>
                <Pressable accessibilityLabel="Profile" style={[styles.avatar, { backgroundColor: appTheme.accent }]} onPress={() => router.push("/profile" as never)}>
                  <Text allowFontScaling={false} style={[styles.avatarText, { color: appTheme.surface }]}>{creator.avatar}</Text>
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
                allowFontScaling={false}
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
              <Text allowFontScaling={false} style={[styles.sectionTitle, { color: appTheme.text }, isCompact ? styles.sectionTitleCompact : null]}>Popular Templates</Text>
              <Pressable style={styles.seeAllButton} onPress={() => router.push("/templates" as never)}>
                <Text allowFontScaling={false} style={[styles.seeAll, { color: appTheme.primary }]}>See All</Text>
                <Ionicons color={appTheme.primary} name="chevron-forward" size={16} />
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={[styles.emptyCard, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]}>
            <Ionicons color={appTheme.primary} name="leaf-outline" size={22} />
            <Text allowFontScaling={false} style={[styles.emptyText, { color: appTheme.secondaryText }]}>{templatesQuery.isLoading ? "Loading templates..." : "No templates found."}</Text>
          </View>
        }
        renderItem={({ index, item }) => (
          <TemplateCard
            height={cardHeight}
            marginRight={index % columnCount === columnCount - 1 ? 0 : gridGap}
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
      <Text allowFontScaling={false} style={[styles.chipText, { color: active ? appTheme.surface : appTheme.secondaryText }]}>{label}</Text>
    </Pressable>
  );
}

function TemplateCard({ height, marginRight, template, width }: { height: number; marginRight: number; template: DisplayTemplate; width: number }) {
  const appTheme = useAppTheme();

  return (
    <Link href={{ pathname: "/templates/[id]", params: { id: template.routeId } }} asChild>
      <Pressable style={[styles.templateCard, { width, height, marginRight, backgroundColor: appTheme.surface, borderColor: appTheme.border, shadowColor: appTheme.text }]}>
        <ImageBackground imageStyle={styles.cardImage} resizeMode="cover" source={template.image} style={styles.cardImageFill}>
          <LinearGradient
            colors={[transparentColor(appTheme.surface, 0.1), transparentColor(appTheme.surface, 0.34), transparentColor(appTheme.text, 0.34)]}
            locations={[0, 0.55, 1]}
            style={styles.cardShade}
          />
          <View style={[styles.cardTopWash, { backgroundColor: transparentColor(appTheme.surface, 0.64) }]} />
          <View style={styles.cardContent}>
            <Text allowFontScaling={false} numberOfLines={2} style={[styles.cardTitle, { color: appTheme.text }]}>{template.name}</Text>
          </View>
          <View style={[styles.cardPill, { backgroundColor: transparentColor(appTheme.surface, 0.82), borderColor: transparentColor(appTheme.surface, 0.7) }]}>
            <Text allowFontScaling={false} numberOfLines={1} style={[styles.cardPillText, { color: getCategoryColor(template.category, appTheme.primary, appTheme.accent, appTheme.primaryDark) }]}>{formatCategory(template.category)}</Text>
          </View>
        </ImageBackground>
      </Pressable>
    </Link>
  );
}

function buildPopularTemplates(templates: Template[]): DisplayTemplate[] {
  return POPULAR_TEMPLATE_CARDS.map((card) => {
    const matchingTemplate = findMatchingTemplate(templates, card.match);
    const routeId = matchingTemplate?.id ?? card.fallbackRoute;

    return {
      id: matchingTemplate?.id ?? `fallback-${card.fallbackRoute}`,
      name: card.name,
      category: card.category,
      routeId,
      image: card.image
    };
  });
}

function findMatchingTemplate(templates: Template[], matchers: string[]) {
  return templates.find((template) => {
    const value = `${template.id} ${template.name} ${template.description} ${template.category} ${template.templateType}`.toLowerCase();
    return matchers.some((matcher) => value.includes(matcher));
  });
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

function transparentColor(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3 ? normalized.split("").map((char) => `${char}${char}`).join("") : normalized;
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
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
  cardImage: { borderRadius: 16 },
  cardImageFill: { flex: 1, overflow: "hidden" },
  cardShade: { ...StyleSheet.absoluteFillObject },
  cardTopWash: { position: "absolute", left: 0, right: 0, top: 0, height: 64 },
  cardContent: { alignItems: "center", paddingHorizontal: 8, paddingTop: 18 },
  cardTitle: { fontFamily: FONT.bold, fontSize: 12, lineHeight: 16, textAlign: "center" },
  cardPill: { position: "absolute", alignSelf: "center", top: 66, minHeight: 24, borderRadius: 999, borderWidth: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 9 },
  cardPillText: { fontFamily: FONT.medium, fontSize: 10, lineHeight: 13 },
  emptyCard: { minHeight: 84, borderRadius: 16, borderWidth: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  emptyText: { fontFamily: FONT.medium, fontSize: 12 }
});
