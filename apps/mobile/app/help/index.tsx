import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

const ARTICLES = [
  { title: "How to create an experience", category: "Builder", icon: "create-outline" },
  { title: "How to share my link", category: "Publishing", icon: "share-social-outline" },
  { title: "How to track analytics", category: "Analytics", icon: "bar-chart-outline" },
  { title: "Subscription and billing", category: "Plan", icon: "diamond-outline" },
  { title: "Template customization", category: "Templates", icon: "color-palette-outline" }
] as const;

export default function HelpScreen() {
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
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable accessibilityLabel="Go back" style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons color="#101828" name="chevron-back" size={22} />
          </Pressable>
          <View style={styles.badge}>
            <Ionicons color="#ec0e68" name="help-circle-outline" size={17} />
            <Text style={styles.badgeText}>Support</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons color="#ec0e68" name="chatbubble-ellipses-outline" size={30} />
          </View>
          <Text style={styles.title}>How can we help?</Text>
          <Text style={styles.subtitle}>Find answers for creating, publishing, sharing, and tracking AIRPLANE experiences.</Text>
        </View>

        <View style={styles.searchBox}>
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

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular articles</Text>
            <Text style={styles.sectionCount}>{filteredArticles.length}</Text>
          </View>
          {filteredArticles.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons color="#ec0e68" name="file-tray-outline" size={24} />
              <Text style={styles.emptyText}>No matching articles.</Text>
            </View>
          ) : (
            filteredArticles.map((article) => (
              <Pressable key={article.title} style={styles.articleRow} onPress={() => openArticle(article.title)}>
                <View style={styles.articleIcon}>
                  <Ionicons color="#ec0e68" name={article.icon} size={19} />
                </View>
                <View style={styles.articleCopy}>
                  <Text style={styles.articleText}>{article.title}</Text>
                  <Text style={styles.articleCategory}>{article.category}</Text>
                </View>
                <Ionicons color="#98a2b3" name="chevron-forward" size={18} />
              </Pressable>
            ))
          )}
        </View>

        <View style={styles.supportCard}>
          <Text style={styles.supportTitle}>Need hands-on help?</Text>
          <Text style={styles.supportCopy}>Use this once support inbox is connected. For now, the MVP can be tested locally end to end.</Text>
          <Pressable style={styles.primaryButton} onPress={contactSupport}>
            <Ionicons color="#ffffff" name="chatbubble-ellipses-outline" size={20} />
            <Text style={styles.primaryButtonText}>Contact support</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff7fb" },
  screen: { flexGrow: 1, gap: 16, padding: 20, paddingBottom: 34 },
  topBar: { paddingTop: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconButton: { width: 42, height: 42, borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center" },
  badge: { minHeight: 36, borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", paddingHorizontal: 11, flexDirection: "row", alignItems: "center", gap: 7 },
  badgeText: { color: "#ec0e68", fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  hero: { gap: 10, borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", padding: 18 },
  heroIcon: { width: 62, height: 62, borderRadius: 8, backgroundColor: "#fff0f6", alignItems: "center", justifyContent: "center" },
  title: { color: "#101828", fontSize: 32, lineHeight: 38, fontWeight: "900" },
  subtitle: { color: "#667085", fontSize: 15, lineHeight: 22 },
  searchBox: { height: 52, borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 13 },
  searchInput: { flex: 1, color: "#101828", fontSize: 16 },
  card: { gap: 4, borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", padding: 14 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  sectionTitle: { color: "#101828", fontSize: 18, fontWeight: "900" },
  sectionCount: { overflow: "hidden", borderRadius: 8, backgroundColor: "#fff0f6", color: "#ec0e68", paddingHorizontal: 8, paddingVertical: 4, fontSize: 11, fontWeight: "900" },
  articleRow: { minHeight: 62, flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: 1, borderBottomColor: "#eaecf0" },
  articleIcon: { width: 38, height: 38, borderRadius: 8, backgroundColor: "#fff0f6", alignItems: "center", justifyContent: "center" },
  articleCopy: { flex: 1, gap: 2 },
  articleText: { color: "#101828", fontWeight: "900" },
  articleCategory: { color: "#667085", fontSize: 12, fontWeight: "800" },
  emptyState: { minHeight: 90, alignItems: "center", justifyContent: "center", gap: 8 },
  emptyText: { color: "#667085", fontWeight: "800" },
  supportCard: { gap: 10, borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", padding: 16 },
  supportTitle: { color: "#101828", fontSize: 18, fontWeight: "900" },
  supportCopy: { color: "#667085", lineHeight: 21 },
  primaryButton: { height: 54, borderRadius: 8, backgroundColor: "#ec0e68", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  primaryButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "900" }
});
