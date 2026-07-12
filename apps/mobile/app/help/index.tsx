import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FLOW_SIZE, MOBILE_FONT } from "@/design/tokens";
import { useAppTheme } from "@/stores/app-theme-store";

const ARTICLES = [
  { title: "How to create an experience", category: "Builder", icon: "create-outline" },
  { title: "How to share my link", category: "Publishing", icon: "share-social-outline" },
  { title: "How to track analytics", category: "Analytics", icon: "bar-chart-outline" },
  { title: "Subscription and billing", category: "Plan", icon: "diamond-outline" },
  { title: "Template customization", category: "Templates", icon: "color-palette-outline" }
] as const;

export default function HelpScreen() {
  const appTheme = useAppTheme();
  const [query, setQuery] = useState("");
  const filteredArticles = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) {
      return ARTICLES;
    }

    return ARTICLES.filter((article) => `${article.title} ${article.category}`.toLowerCase().includes(search));
  }, [query]);

  function openArticle(title: string) {
    Alert.alert(title, "Help article content will be connected after the MVP flow is locked.");
  }

  function contactSupport() {
    Alert.alert("Contact support", "Support inbox integration is prepared for later. For now, keep testing the MVP flow.");
  }

  return (
    <SafeAreaView edges={["top"]} style={[styles.root, { backgroundColor: appTheme.background }]}>
      <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable accessibilityLabel="Go back" style={[styles.iconButton, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]} onPress={() => router.back()}>
            <Ionicons color={appTheme.text} name="chevron-back" size={22} />
          </Pressable>
          <View style={[styles.badge, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]}>
            <Ionicons color={appTheme.primary} name="help-circle-outline" size={17} />
            <Text style={[styles.badgeText, { color: appTheme.primary }]}>Support</Text>
          </View>
        </View>

        <View style={[styles.hero, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]}>
          <View style={[styles.heroIcon, { backgroundColor: appTheme.muted }]}>
            <Ionicons color={appTheme.primary} name="chatbubble-ellipses-outline" size={30} />
          </View>
          <Text adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={2} style={[styles.title, { color: appTheme.text }]}>How can we help?</Text>
          <Text style={[styles.subtitle, { color: appTheme.secondaryText }]}>Find answers for creating, publishing, sharing, and tracking AIRPLANE experiences.</Text>
        </View>

        <View style={[styles.searchBox, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]}>
          <Ionicons color="#98a2b3" name="search-outline" size={19} />
          <TextInput
            autoCapitalize="none"
            onChangeText={setQuery}
            placeholder="Search help articles..."
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

        <View style={[styles.card, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]}>
          <View style={styles.sectionHeader}>
            <Text numberOfLines={1} style={[styles.sectionTitle, { color: appTheme.text }]}>Popular articles</Text>
            <Text style={[styles.sectionCount, { backgroundColor: appTheme.muted, color: appTheme.primary }]}>{filteredArticles.length}</Text>
          </View>
          {filteredArticles.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons color={appTheme.primary} name="file-tray-outline" size={24} />
              <Text style={[styles.emptyText, { color: appTheme.secondaryText }]}>No matching articles.</Text>
            </View>
          ) : (
            filteredArticles.map((article) => (
              <Pressable key={article.title} style={styles.articleRow} onPress={() => openArticle(article.title)}>
                <View style={[styles.articleIcon, { backgroundColor: appTheme.muted }]}>
                  <Ionicons color={appTheme.primary} name={article.icon} size={19} />
                </View>
                <View style={styles.articleCopy}>
                  <Text numberOfLines={1} style={[styles.articleText, { color: appTheme.text }]}>{article.title}</Text>
                  <Text style={[styles.articleCategory, { color: appTheme.secondaryText }]}>{article.category}</Text>
                </View>
                <Ionicons color="#98a2b3" name="chevron-forward" size={18} />
              </Pressable>
            ))
          )}
        </View>

        <View style={[styles.supportCard, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]}>
          <Text numberOfLines={1} style={[styles.supportTitle, { color: appTheme.text }]}>Need hands-on help?</Text>
          <Text numberOfLines={3} style={[styles.supportCopy, { color: appTheme.secondaryText }]}>Use this once support inbox is connected. For now, the MVP can be tested locally end to end.</Text>
          <Pressable style={[styles.primaryButton, { backgroundColor: appTheme.primary }]} onPress={contactSupport}>
            <Ionicons color="#ffffff" name="chatbubble-ellipses-outline" size={20} />
            <Text style={styles.primaryButtonText}>Contact support</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff7fb" },
  screen: { flexGrow: 1, gap: FLOW_SIZE.sectionGap, paddingHorizontal: FLOW_SIZE.screenPadding, paddingTop: 10, paddingBottom: 30 },
  topBar: { paddingTop: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconButton: { width: 42, height: 42, borderRadius: 16, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  badge: { minHeight: 36, borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", paddingHorizontal: 11, flexDirection: "row", alignItems: "center", gap: 7 },
  badgeText: { color: "#ec0e68", fontFamily: MOBILE_FONT.semibold, fontSize: FLOW_SIZE.caption, textTransform: "uppercase" },
  hero: { gap: 9, borderRadius: FLOW_SIZE.cardRadius, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", padding: FLOW_SIZE.cardPadding },
  heroIcon: { width: 48, height: 48, borderRadius: 18, backgroundColor: "#fff0f6", alignItems: "center", justifyContent: "center" },
  title: { color: "#101828", fontFamily: MOBILE_FONT.bold, fontSize: FLOW_SIZE.headerTitle, lineHeight: FLOW_SIZE.headerTitleLine },
  subtitle: { color: "#667085", fontFamily: MOBILE_FONT.regular, fontSize: FLOW_SIZE.body, lineHeight: FLOW_SIZE.bodyLine },
  searchBox: { height: FLOW_SIZE.buttonHeight, borderRadius: 18, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 13 },
  searchInput: { flex: 1, minWidth: 0, color: "#101828", fontFamily: MOBILE_FONT.regular, fontSize: FLOW_SIZE.body },
  card: { gap: 4, borderRadius: FLOW_SIZE.cardRadius, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", padding: FLOW_SIZE.cardPadding },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  sectionTitle: { flex: 1, minWidth: 0, color: "#101828", fontFamily: MOBILE_FONT.semibold, fontSize: FLOW_SIZE.sectionTitle },
  sectionCount: { overflow: "hidden", borderRadius: 8, backgroundColor: "#fff0f6", color: "#ec0e68", paddingHorizontal: 8, paddingVertical: 4, fontFamily: MOBILE_FONT.semibold, fontSize: FLOW_SIZE.caption },
  articleRow: { minHeight: 58, flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: 1, borderBottomColor: "#eaecf0" },
  articleIcon: { width: 38, height: 38, borderRadius: 14, backgroundColor: "#fff0f6", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  articleCopy: { flex: 1, minWidth: 0, gap: 2 },
  articleText: { color: "#101828", fontFamily: MOBILE_FONT.semibold, fontSize: FLOW_SIZE.body },
  articleCategory: { color: "#667085", fontFamily: MOBILE_FONT.medium, fontSize: FLOW_SIZE.caption },
  emptyState: { minHeight: 90, alignItems: "center", justifyContent: "center", gap: 8 },
  emptyText: { color: "#667085", fontFamily: MOBILE_FONT.medium, fontSize: FLOW_SIZE.body },
  supportCard: { gap: 10, borderRadius: FLOW_SIZE.cardRadius, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", padding: FLOW_SIZE.cardPadding },
  supportTitle: { color: "#101828", fontFamily: MOBILE_FONT.semibold, fontSize: FLOW_SIZE.sectionTitle },
  supportCopy: { color: "#667085", fontFamily: MOBILE_FONT.regular, fontSize: FLOW_SIZE.body, lineHeight: FLOW_SIZE.bodyLine },
  primaryButton: { height: FLOW_SIZE.buttonHeight, borderRadius: FLOW_SIZE.compactRadius, backgroundColor: "#ec0e68", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  primaryButtonText: { color: "#ffffff", fontFamily: MOBILE_FONT.semibold, fontSize: 13 }
});
