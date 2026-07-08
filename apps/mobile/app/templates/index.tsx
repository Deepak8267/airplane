import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TEMPLATE_CATEGORIES } from "@airplane/shared";
import type { Template, TemplateCategory } from "@airplane/shared";
import { getTemplates } from "@/features/templates/template-service";
import { useAppTheme } from "@/stores/app-theme-store";

type CategoryFilter = "all" | TemplateCategory;

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
  const columnCount = contentWidth >= 340 ? 3 : 2;
  const gridGap = contentWidth >= 340 ? 10 : 12;
  const cardWidth = Math.floor((contentWidth - gridGap * (columnCount - 1)) / columnCount);
  const previewHeight = columnCount === 3 ? 112 : 126;
  const filteredTemplates = useMemo(() => {
    const search = query.trim().toLowerCase();

    return templates.filter((template) => {
      const matchesCategory = category === "all" || template.category === category;
      const matchesSearch = !search || `${template.name} ${template.description} ${template.category}`.toLowerCase().includes(search);
      return matchesCategory && matchesSearch;
    });
  }, [category, query, templates]);

  return (
    <SafeAreaView edges={["top"]} style={[styles.screen, { backgroundColor: appTheme.background }]}>
      <FlatList
        data={filteredTemplates}
        key={columnCount}
        keyExtractor={(item) => item.id}
        numColumns={columnCount}
        columnWrapperStyle={styles.gridRow}
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
        renderItem={({ index, item }) => (
          <TemplateCard
            marginRight={index % columnCount === columnCount - 1 ? 0 : gridGap}
            previewHeight={previewHeight}
            template={item}
            width={cardWidth}
          />
        )}
      />
    </SafeAreaView>
  );
}

function TemplateCard({ marginRight, previewHeight, template, width }: { marginRight: number; previewHeight: number; template: Template; width: number }) {
  const appTheme = useAppTheme();

  return (
    <Link href={{ pathname: "/templates/[id]", params: { id: template.id } }} asChild>
      <Pressable style={[styles.card, { width, marginRight, backgroundColor: appTheme.surface, borderColor: appTheme.border }]}>
        <View style={[styles.preview, { height: previewHeight, backgroundColor: template.defaultTheme.background }]}>
          <View style={[styles.previewIcon, { backgroundColor: template.defaultTheme.muted }]}>
            <Ionicons color={template.defaultTheme.accent} name={getTemplateIcon(template.category)} size={28} />
          </View>
          <Text style={[styles.previewText, { color: template.defaultTheme.foreground }]} numberOfLines={2}>{template.name}</Text>
          {template.isPremium ? <Text style={[styles.premiumBadge, { backgroundColor: appTheme.primary }]}>Premium</Text> : null}
        </View>
        <View style={styles.metaRow}>
          <Text style={[styles.categoryLabel, { color: appTheme.primary }]}>{template.category}</Text>
          <View style={styles.swatches}>
            <View style={[styles.swatch, { backgroundColor: template.defaultTheme.muted }]} />
            <View style={[styles.swatch, { backgroundColor: template.defaultTheme.accent }]} />
          </View>
        </View>
        <Text style={[styles.cardTitle, { color: appTheme.text }]} numberOfLines={2}>{template.name}</Text>
        <Text style={[styles.cardCopy, { color: appTheme.secondaryText }]} numberOfLines={2}>{template.description}</Text>
        <View style={styles.footerRow}>
          <Text style={[styles.pageCount, { color: appTheme.secondaryText }]}>{template.defaultPages.length} pages</Text>
          <Ionicons color={appTheme.secondaryText} name="chevron-forward" size={17} />
        </View>
      </Pressable>
    </Link>
  );
}

function getTemplateIcon(category: TemplateCategory): keyof typeof Ionicons.glyphMap {
  if (category === "birthday") {
    return "gift-outline";
  }

  if (category === "friends") {
    return "people-outline";
  }

  if (category === "family") {
    return "home-outline";
  }

  if (category === "fun") {
    return "sparkles-outline";
  }

  return "heart-outline";
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
  gridRow: {},
  card: { minHeight: 216, borderRadius: 18, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", padding: 8, gap: 7, marginBottom: 12 },
  preview: { borderRadius: 16, alignItems: "center", justifyContent: "center", overflow: "hidden", gap: 7, padding: 8 },
  previewIcon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  previewText: { fontSize: 13, lineHeight: 17, fontWeight: "900", textAlign: "center" },
  premiumBadge: { position: "absolute", right: 8, top: 8, overflow: "hidden", borderRadius: 14, backgroundColor: "#ec0e68", color: "#ffffff", paddingHorizontal: 7, paddingVertical: 4, fontSize: 10, fontWeight: "900" },
  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  categoryLabel: { color: "#ec0e68", fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  swatches: { flexDirection: "row", gap: 5 },
  swatch: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: "rgba(16, 24, 40, 0.12)" },
  cardTitle: { color: "#101828", fontSize: 12, lineHeight: 16, fontWeight: "900" },
  cardCopy: { color: "#667085", fontSize: 10, lineHeight: 14 },
  footerRow: { marginTop: "auto", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pageCount: { color: "#667085", fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  emptyCard: { gap: 8, alignItems: "center", borderRadius: 20, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", padding: 18 },
  emptyTitle: { color: "#101828", fontSize: 18, fontWeight: "900" },
  emptyCopy: { color: "#667085", textAlign: "center", lineHeight: 21 },
  error: { color: "#b42318", lineHeight: 20 }
});
