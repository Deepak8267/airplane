import { Ionicons } from "@expo/vector-icons";
import { EXPERIENCE_THEMES } from "@airplane/shared";
import { router } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

export default function ThemesScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Theme previews</Text>
        <Text style={styles.title}>Choose a mood</Text>
        <Text style={styles.subtitle}>Themes can be applied inside the builder.</Text>
      </View>
      <FlatList
        data={EXPERIENCE_THEMES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.themeCard, { backgroundColor: item.background }]}>
            <View style={styles.themeTop}>
              <Text style={[styles.themeName, { color: item.foreground }]}>{item.name}</Text>
              <View style={[styles.themeDot, { backgroundColor: item.accent }]} />
            </View>
            <View style={styles.previewStage}>
              <Ionicons color={item.accent} name="heart" size={34} />
              <Text style={[styles.previewTitle, { color: item.foreground }]}>Will you marry me?</Text>
              <Text style={[styles.previewCopy, { color: item.foreground }]}>You mean the world to me.</Text>
            </View>
          </View>
        )}
      />
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20, backgroundColor: "#fff7fb" },
  header: { gap: 6, paddingTop: 8 },
  eyebrow: { color: "#ec0e68", fontSize: 13, fontWeight: "900", textTransform: "uppercase" },
  title: { color: "#101828", fontSize: 32, lineHeight: 38, fontWeight: "900" },
  subtitle: { color: "#667085", fontSize: 15, lineHeight: 22 },
  list: { gap: 12, paddingTop: 18, paddingBottom: 90 },
  themeCard: { minHeight: 210, borderRadius: 8, borderWidth: 1, borderColor: "#eaecf0", padding: 14, justifyContent: "space-between" },
  themeTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  themeName: { fontSize: 17, fontWeight: "900" },
  themeDot: { width: 30, height: 30, borderRadius: 15 },
  previewStage: { alignItems: "center", gap: 8 },
  previewTitle: { fontSize: 24, lineHeight: 29, fontWeight: "900", textAlign: "center" },
  previewCopy: { fontSize: 14, opacity: 0.75 },
  backButton: { position: "absolute", left: 20, right: 20, bottom: 20, height: 52, borderRadius: 8, backgroundColor: "#ec0e68", alignItems: "center", justifyContent: "center" },
  backButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "900" }
});
