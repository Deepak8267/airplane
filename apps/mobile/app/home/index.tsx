import { Link } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { TEMPLATE_CATEGORIES } from "@airplane/shared";
import { templateFixtures } from "@/features/templates/template-fixtures";

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Creator Home</Text>
        <Text style={styles.title}>Choose a starting point.</Text>
      </View>

      <FlatList
        data={TEMPLATE_CATEGORIES}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
        renderItem={({ item }) => <Text style={styles.category}>{item}</Text>}
      />

      <FlatList
        data={templateFixtures}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Link href={{ pathname: "/templates/[id]", params: { id: item.id } }} asChild>
            <Pressable style={styles.card}>
              <View style={[styles.swatch, { backgroundColor: item.defaultTheme.accent }]} />
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardCopy}>{item.description}</Text>
              </View>
              {item.isPremium ? <Text style={styles.pro}>PRO</Text> : null}
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20 },
  header: { paddingTop: 8, gap: 6 },
  eyebrow: { color: "#2563eb", fontSize: 13, fontWeight: "800", textTransform: "uppercase" },
  title: { color: "#101828", fontSize: 30, lineHeight: 36, fontWeight: "800" },
  categories: { gap: 8, paddingVertical: 18 },
  category: { overflow: "hidden", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: "#ffffff", color: "#344054", fontWeight: "700", textTransform: "capitalize" },
  list: { gap: 12, paddingBottom: 40 },
  card: { minHeight: 104, flexDirection: "row", alignItems: "center", gap: 14, padding: 16, backgroundColor: "#ffffff", borderRadius: 8, borderWidth: 1, borderColor: "#eaecf0" },
  swatch: { width: 48, height: 48, borderRadius: 8 },
  cardText: { flex: 1, gap: 4 },
  cardTitle: { color: "#101828", fontSize: 17, fontWeight: "800" },
  cardCopy: { color: "#667085", fontSize: 14, lineHeight: 20 },
  pro: { color: "#7c3aed", fontWeight: "900", fontSize: 12 }
});
