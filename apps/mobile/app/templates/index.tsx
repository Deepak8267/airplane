import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FlatList, ImageBackground, Pressable, RefreshControl, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import type { ImageSourcePropType } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TEMPLATE_CATEGORIES } from "@airplane/shared";
import type { Template, TemplateCategory } from "@airplane/shared";
import { getTemplates } from "@/features/templates/template-service";
import { useAppTheme } from "@/stores/app-theme-store";

type CategoryFilter = "all" | TemplateCategory;

const CARD_IMAGES = {
  proposal: require("../../assets/templates/proposal-garden.png") as ImageSourcePropType,
  lake: require("../../assets/templates/lake-memory.png") as ImageSourcePropType,
  birthday: require("../../assets/templates/birthday-garden.png") as ImageSourcePropType,
  memory: require("../../assets/templates/memory-table.png") as ImageSourcePropType,
  anniversary: require("../../assets/templates/anniversary-path.png") as ImageSourcePropType,
  candlelight: require("../../assets/templates/candlelight-couple.png") as ImageSourcePropType
};

export default function TemplatesScreen() {
  const appTheme = useAppTheme();
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const templatesQuery = useQuery({
    queryKey: ["templates"],
    queryFn: getTemplates
  });
  const templates = templatesQuery.data ?? [];
  const availableWidth = measuredWidth || width;
  const horizontalPadding = availableWidth < 380 ? 12 : 16;
  const contentWidth = Math.max(0, availableWidth - horizontalPadding * 2);
  const columnCount = contentWidth >= 330 ? 3 : 2;
  const gridGap = contentWidth >= 330 ? 12 : 10;
  const rowGap = contentWidth >= 330 ? 14 : 12;
  const cardWidth = Math.floor((contentWidth - gridGap * (columnCount - 1)) / columnCount);
  const cardHeight = columnCount === 3 ? Math.max(186, Math.min(206, Math.round(cardWidth * 1.72))) : Math.max(240, Math.min(280, Math.round(cardWidth * 1.45)));
  const filteredTemplates = useMemo(() => {
    const search = query.trim().toLowerCase();

    return templates.filter((template) => {
      const matchesCategory = category === "all" || template.category === category;
      const matchesSearch = !search || `${template.name} ${template.description} ${template.category}`.toLowerCase().includes(search);
      return matchesCategory && matchesSearch;
    });
  }, [category, query, templates]);
  const templateRows = useMemo(() => chunkTemplates(filteredTemplates, columnCount), [columnCount, filteredTemplates]);

  return (
    <SafeAreaView edges={["top"]} style={[styles.screen, { backgroundColor: appTheme.background }]}>
      <FlatList
        data={templateRows}
        keyExtractor={(item, index) => item.map((template) => template.id).join("-") || `row-${index}`}
        onLayout={(event) => setMeasuredWidth(event.nativeEvent.layout.width)}
        refreshControl={<RefreshControl refreshing={templatesQuery.isRefetching} onRefresh={() => templatesQuery.refetch()} />}
        contentContainerStyle={[styles.list, { paddingHorizontal: horizontalPadding }]}
        ListHeaderComponent={
          <View style={styles.headerStack}>
            <View style={styles.header}>
              <View style={[styles.headerIcon, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]}>
                <Ionicons color={appTheme.primary} name="grid-outline" size={26} />
              </View>
              <Text style={[styles.eyebrow, { color: appTheme.primary }]}>Templates</Text>
              <Text style={[styles.title, { color: appTheme.text }]}>Pick the perfect starting point.</Text>
              <Text style={[styles.subtitle, { color: appTheme.secondaryText }]}>Search love, birthday, friends, family, and fun templates.</Text>
            </View>

            <View style={[styles.searchBox, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]}>
              <Ionicons color={appTheme.mutedText} name="search-outline" size={19} />
              <TextInput
                autoCapitalize="none"
                onChangeText={setQuery}
                placeholder="Search templates..."
                placeholderTextColor={appTheme.mutedText}
                style={[styles.searchInput, { color: appTheme.text }]}
                value={query}
              />
              {query ? (
                <Pressable accessibilityLabel="Clear search" onPress={() => setQuery("")}>
                  <Ionicons color={appTheme.mutedText} name="close-circle" size={19} />
                </Pressable>
              ) : null}
            </View>

            <FlatList
              data={["all", ...TEMPLATE_CATEGORIES] as CategoryFilter[]}
              horizontal
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
              renderItem={({ item }) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: item === category }}
                  onPress={() => setCategory(item)}
                  style={[styles.chip, { backgroundColor: appTheme.surface, borderColor: appTheme.navBorder }, item === category ? { backgroundColor: appTheme.primary, borderColor: appTheme.primary } : null]}
                >
                  <Text style={[styles.chipText, { color: item === category ? "#ffffff" : appTheme.text }]}>{item}</Text>
                </Pressable>
              )}
            />

            {templatesQuery.error instanceof Error ? <Text style={styles.error}>{templatesQuery.error.message}</Text> : null}
          </View>
        }
        ListEmptyComponent={
          !templatesQuery.isLoading ? (
            <View style={styles.emptyCard}>
              <Ionicons color={appTheme.primary} name="file-tray-outline" size={28} />
              <Text style={[styles.emptyTitle, { color: appTheme.text }]}>No templates found</Text>
              <Text style={[styles.emptyCopy, { color: appTheme.secondaryText }]}>Try another search or category.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={[styles.gridRow, { gap: gridGap, marginBottom: rowGap }]}>
            {item.map((template) => (
              <TemplateCard key={template.id} height={cardHeight} template={template} width={cardWidth} />
            ))}
            {item.length < columnCount
              ? Array.from({ length: columnCount - item.length }).map((_, index) => (
                  <View key={`spacer-${index}`} style={[styles.cardSpacer, { width: cardWidth }]} />
                ))
              : null}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function TemplateCard({ height, template, width }: { height: number; template: Template; width: number }) {
  const appTheme = useAppTheme();
  const group = getTemplateGroup(template);

  return (
    <Link href={{ pathname: "/templates/[id]", params: { id: template.id } }} asChild>
      <Pressable style={[styles.card, { width, height, minHeight: height, maxHeight: height, shadowColor: appTheme.text }]}>
        <ImageBackground imageStyle={styles.cardImage} resizeMode="cover" source={getTemplateImage(template)} style={[styles.cardImageFill, { width, height, backgroundColor: appTheme.background }]}>
          <LinearGradient
            colors={[transparentColor(appTheme.text, 0), transparentColor(appTheme.text, 0.04), transparentColor(appTheme.text, 0.38)]}
            locations={[0, 0.62, 1]}
            style={styles.cardShade}
          />
          {template.isPremium ? <Text allowFontScaling={false} style={[styles.premiumBadge, { backgroundColor: appTheme.primary, color: appTheme.surface }]}>Premium</Text> : null}
          <View style={styles.cardContent}>
            <Text
              allowFontScaling={false}
              numberOfLines={2}
              style={[styles.cardTitle, { color: appTheme.text, textShadowColor: transparentColor(appTheme.surface, 0.82) }]}
            >
              {template.name}
            </Text>
          </View>
          <View style={[styles.cardPill, { backgroundColor: transparentColor(appTheme.surface, 0.82), borderColor: transparentColor(appTheme.surface, 0.7) }]}>
            <Text allowFontScaling={false} numberOfLines={1} style={[styles.cardPillText, { color: getCategoryColor(group, appTheme.primary, appTheme.accent, appTheme.primaryDark) }]}>
              {formatCategory(group)}
            </Text>
          </View>
        </ImageBackground>
      </Pressable>
    </Link>
  );
}

function chunkTemplates(items: Template[], size: number) {
  const rows: Template[][] = [];

  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size));
  }

  return rows;
}

function getTemplateGroup(template: Template) {
  const value = `${template.id} ${template.name} ${template.description} ${template.category} ${template.templateType}`.toLowerCase();

  if (value.includes("anniversary")) {
    return "anniversary";
  }

  if (value.includes("birthday") || value.includes("surprise")) {
    return "surprise";
  }

  if (value.includes("friend") || value.includes("family") || value.includes("memory")) {
    return "memory";
  }

  return "proposal";
}

function getTemplateImage(template: Template) {
  const value = `${template.id} ${template.name} ${template.description} ${template.category} ${template.templateType}`.toLowerCase();

  if (value.includes("birthday")) {
    return CARD_IMAGES.birthday;
  }

  if (value.includes("anniversary")) {
    return CARD_IMAGES.anniversary;
  }

  if (value.includes("friend") || value.includes("family") || value.includes("memory")) {
    return CARD_IMAGES.memory;
  }

  if (value.includes("date") || value.includes("trip")) {
    return CARD_IMAGES.lake;
  }

  if (value.includes("mystery")) {
    return CARD_IMAGES.candlelight;
  }

  return CARD_IMAGES.proposal;
}

function getCategoryColor(category: string, primary: string, accent: string, primaryDark: string) {
  if (category === "surprise") {
    return accent;
  }

  if (category === "anniversary") {
    return primaryDark;
  }

  return primary;
}

function formatCategory(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function transparentColor(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3 ? normalized.split("").map((char) => `${char}${char}`).join("") : normalized;
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  list: { gap: 16, paddingTop: 8, paddingBottom: 40 },
  headerStack: { gap: 14 },
  header: { gap: 5, paddingTop: 4 },
  headerIcon: { width: 48, height: 48, borderRadius: 18, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#fbcfe8", alignItems: "center", justifyContent: "center", marginBottom: 3 },
  eyebrow: { color: "#ec0e68", fontSize: 13, fontWeight: "900", textTransform: "uppercase" },
  title: { color: "#101828", fontSize: 24, lineHeight: 30, fontWeight: "900" },
  subtitle: { color: "#667085", fontSize: 13, lineHeight: 19 },
  searchBox: { height: 44, borderRadius: 16, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 13 },
  searchInput: { flex: 1, color: "#101828", fontSize: 13, padding: 0 },
  chips: { gap: 8 },
  chip: { minHeight: 32, borderRadius: 16, borderWidth: 1, borderColor: "#eaecf0", backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center", paddingHorizontal: 12 },
  activeChip: { borderColor: "#ec0e68", backgroundColor: "#ec0e68" },
  chipText: { color: "#344054", fontSize: 13, fontWeight: "900", textTransform: "capitalize" },
  activeChipText: { color: "#ffffff" },
  gridRow: { flexDirection: "row", justifyContent: "flex-start" },
  cardSpacer: { flexShrink: 0 },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  cardImage: { borderRadius: 16, width: "100%", height: "100%" },
  cardImageFill: { borderRadius: 16, overflow: "hidden" },
  cardShade: { ...StyleSheet.absoluteFillObject },
  premiumBadge: { position: "absolute", right: 7, top: 7, overflow: "hidden", borderRadius: 999, paddingHorizontal: 6, paddingVertical: 3, fontSize: 8, fontWeight: "900" },
  cardContent: { alignItems: "center", paddingHorizontal: 7, paddingTop: 22 },
  cardTitle: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
    textAlign: "center",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3
  },
  cardPill: { position: "absolute", alignSelf: "center", top: 72, minHeight: 22, borderRadius: 999, borderWidth: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  cardPillText: { fontSize: 9, lineHeight: 12, fontWeight: "700" },
  emptyCard: { gap: 8, alignItems: "center", borderRadius: 20, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", padding: 18 },
  emptyTitle: { color: "#101828", fontSize: 18, fontWeight: "900" },
  emptyCopy: { color: "#667085", textAlign: "center", lineHeight: 21 },
  error: { color: "#b42318", lineHeight: 20 }
});
