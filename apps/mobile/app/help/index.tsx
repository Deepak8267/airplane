import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

const ARTICLES = [
  "How to create an experience",
  "How to share my link",
  "How to track analytics",
  "Subscription and billing",
  "Template customization"
];

export default function HelpScreen() {
  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Help & Support</Text>
        <Text style={styles.title}>How can we help you?</Text>
      </View>
      <View style={styles.searchBox}>
        <Ionicons color="#98a2b3" name="search-outline" size={19} />
        <TextInput placeholder="Search help articles..." placeholderTextColor="#98a2b3" style={styles.searchInput} />
      </View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Popular articles</Text>
        {ARTICLES.map((article) => (
          <Pressable key={article} style={styles.articleRow}>
            <Ionicons color="#ec0e68" name="help-circle-outline" size={19} />
            <Text style={styles.articleText}>{article}</Text>
            <Ionicons color="#98a2b3" name="chevron-forward" size={18} />
          </Pressable>
        ))}
      </View>
      <Pressable style={styles.primaryButton}>
        <Ionicons color="#ffffff" name="chatbubble-ellipses-outline" size={20} />
        <Text style={styles.primaryButtonText}>Contact support</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
        <Text style={styles.secondaryButtonText}>Back</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, gap: 16, padding: 20, backgroundColor: "#fff7fb" },
  header: { gap: 6, paddingTop: 8 },
  eyebrow: { color: "#ec0e68", fontSize: 13, fontWeight: "900", textTransform: "uppercase" },
  title: { color: "#101828", fontSize: 32, lineHeight: 38, fontWeight: "900" },
  searchBox: { height: 52, borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 13 },
  searchInput: { flex: 1, color: "#101828", fontSize: 16 },
  card: { gap: 4, borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", padding: 14 },
  sectionTitle: { color: "#101828", fontSize: 18, fontWeight: "900", marginBottom: 4 },
  articleRow: { minHeight: 50, flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: 1, borderBottomColor: "#eaecf0" },
  articleText: { flex: 1, color: "#101828", fontWeight: "800" },
  primaryButton: { height: 54, borderRadius: 8, backgroundColor: "#ec0e68", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  primaryButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "900" },
  secondaryButton: { height: 50, borderRadius: 8, borderWidth: 1, borderColor: "#d0d5dd", backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center" },
  secondaryButtonText: { color: "#101828", fontWeight: "900" }
});
