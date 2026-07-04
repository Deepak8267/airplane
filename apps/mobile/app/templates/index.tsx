import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TEMPLATE_CATEGORIES } from "@airplane/shared";
import type { Template, TemplateCategory } from "@airplane/shared";
import { getTemplates } from "@/features/templates/template-service";

type CategoryFilter = "all" | TemplateCategory;

export default function TemplatesScreen() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const templatesQuery = useQuery({
    queryKey: ["templates"],
    queryFn: getTemplates
  });
  const templates = templatesQuery.data ?? [];
  const filteredTemplates = useMemo(() => {
    const search = query.trim().toLowerCase();

    return templates.filter((template) => {
      const matchesCategory = category === "all" || template.category === category;
      const matchesSearch = !search || `${template.name} ${template.description} ${template.category}`.toLowerCase().includes(search);
      return matchesCategory && matchesSearch;
    });
  }, [category, query, templates]);

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <FlatList
        data={filteredTemplates}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        refreshControl={<RefreshControl refreshing={templatesQuery.isRefetching} onRefresh={() => templatesQuery.refetch()} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.headerStack}>
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Ionicons color="#ec0e68" name="grid-outline" size={26} />
              </View>
              <Text style={styles.eyebrow}>Templates</Text>
              <Text style={styles.title}>Pick the perfect starting point.</Text>
              <Text style={styles.subtitle}>Search love, birthday, friends, family, and fun templates.</Text>
            </View>

            <View style={styles.searchBox}>
              <Ionicons color="#98a2b3" name="search-outline" size={19} />
              <TextInput
                autoCapitalize="none"
                onChangeText={setQuery}
                placeholder="Search templates..."
                placeholderTextColor="#98a2b3"
                style={styles.searchInput}
                value={query}
              />
              {query ? (
                <Pressable accessibilityLabel="Clear search" onPress={() => setQuery("")}>
                  <Ionicons color="#98a2b3" name="close-circle" size={19} />
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
                  style={[styles.chip, item === category ? styles.activeChip : null]}
                >
                  <Text style={[styles.chipText, item === category ? styles.activeChipText : null]}>{item}</Text>
                </Pressable>
              )}
            />

            {templatesQuery.error instanceof Error ? <Text style={styles.error}>{templatesQuery.error.message}</Text> : null}
          </View>
        }
        ListEmptyComponent={
          !templatesQuery.isLoading ? (
            <View style={styles.emptyCard}>
              <Ionicons color="#ec0e68" name="file-tray-outline" size={28} />
              <Text style={styles.emptyTitle}>No templates found</Text>
              <Text style={styles.emptyCopy}>Try another search or category.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => <TemplateCard template={item} />}
      />
    </SafeAreaView>
  );
}

function TemplateCard({ template }: { template: Template }) {
  return (
    <Link href={{ pathname: "/templates/[id]", params: { id: template.id } }} asChild>
      <Pressable style={styles.card}>
        <View style={[styles.preview, { backgroundColor: template.defaultTheme.background }]}>
          <View style={[styles.previewIcon, { backgroundColor: template.defaultTheme.muted }]}>
            <Ionicons color={template.defaultTheme.accent} name={getTemplateIcon(template.category)} size={28} />
          </View>
          <Text style={[styles.previewText, { color: template.defaultTheme.foreground }]} numberOfLines={2}>{template.name}</Text>
          {template.isPremium ? <Text style={styles.premiumBadge}>Premium</Text> : null}
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.categoryLabel}>{template.category}</Text>
          <View style={styles.swatches}>
            <View style={[styles.swatch, { backgroundColor: template.defaultTheme.muted }]} />
            <View style={[styles.swatch, { backgroundColor: template.defaultTheme.accent }]} />
          </View>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>{template.name}</Text>
        <Text style={styles.cardCopy} numberOfLines={2}>{template.description}</Text>
        <View style={styles.footerRow}>
          <Text style={styles.pageCount}>{template.defaultPages.length} pages</Text>
          <Ionicons color="#98a2b3" name="chevron-forward" size={17} />
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
  screen: { flex: 1, backgroundColor: "#fff7fb" },
  list: { gap: 20, padding: 16, paddingBottom: 40 },
  headerStack: { gap: 20 },
  header: { gap: 7, paddingTop: 8 },
  headerIcon: { width: 48, height: 48, borderRadius: 18, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#fbcfe8", alignItems: "center", justifyContent: "center", marginBottom: 3 },
  eyebrow: { color: "#ec0e68", fontSize: 13, fontWeight: "900", textTransform: "uppercase" },
  title: { color: "#101828", fontSize: 32, lineHeight: 38, fontWeight: "900" },
  subtitle: { color: "#667085", fontSize: 15, lineHeight: 22 },
  searchBox: { height: 52, borderRadius: 18, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 13 },
  searchInput: { flex: 1, color: "#101828", fontSize: 13 },
  chips: { gap: 10 },
  chip: { minHeight: 36, borderRadius: 18, borderWidth: 1, borderColor: "#eaecf0", backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center", paddingHorizontal: 13 },
  activeChip: { borderColor: "#ec0e68", backgroundColor: "#ec0e68" },
  chipText: { color: "#344054", fontSize: 13, fontWeight: "900", textTransform: "capitalize" },
  activeChipText: { color: "#ffffff" },
  gridRow: { gap: 12 },
  card: { flex: 1, minHeight: 268, borderRadius: 20, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", padding: 10, gap: 9 },
  preview: { height: 128, borderRadius: 18, alignItems: "center", justifyContent: "center", overflow: "hidden", gap: 8, padding: 10 },
  previewIcon: { width: 52, height: 52, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  previewText: { fontSize: 16, lineHeight: 20, fontWeight: "900", textAlign: "center" },
  premiumBadge: { position: "absolute", right: 8, top: 8, overflow: "hidden", borderRadius: 14, backgroundColor: "#ec0e68", color: "#ffffff", paddingHorizontal: 7, paddingVertical: 4, fontSize: 10, fontWeight: "900" },
  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  categoryLabel: { color: "#ec0e68", fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  swatches: { flexDirection: "row", gap: 5 },
  swatch: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: "rgba(16, 24, 40, 0.12)" },
  cardTitle: { color: "#101828", fontSize: 14, lineHeight: 18, fontWeight: "900" },
  cardCopy: { color: "#667085", fontSize: 12, lineHeight: 17 },
  footerRow: { marginTop: "auto", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pageCount: { color: "#667085", fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  emptyCard: { gap: 8, alignItems: "center", borderRadius: 20, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", padding: 18 },
  emptyTitle: { color: "#101828", fontSize: 18, fontWeight: "900" },
  emptyCopy: { color: "#667085", textAlign: "center", lineHeight: 21 },
  error: { color: "#b42318", lineHeight: 20 }
});
