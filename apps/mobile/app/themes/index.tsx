import { Ionicons } from "@expo/vector-icons";
import { EXPERIENCE_THEMES } from "@airplane/shared";
import type { Theme } from "@airplane/shared";
import { router } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ThemesScreen() {
  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable accessibilityLabel="Go back" style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons color="#101828" name="chevron-back" size={22} />
        </Pressable>
        <View style={styles.badge}>
          <Ionicons color="#ec0e68" name="color-palette-outline" size={17} />
          <Text style={styles.badgeText}>Themes</Text>
        </View>
      </View>

      <View style={styles.header}>
        <Text style={styles.eyebrow}>Theme previews</Text>
        <Text adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={2} style={styles.title}>Choose a mood</Text>
        <Text numberOfLines={2} style={styles.subtitle}>Themes can be applied inside the builder to shape the recipient link.</Text>
      </View>

      <FlatList
        data={EXPERIENCE_THEMES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <ThemeCard theme={item} />}
      />
    </SafeAreaView>
  );
}

function ThemeCard({ theme }: { theme: Theme }) {
  return (
    <View style={[styles.themeCard, { backgroundColor: theme.background }]}>
      <View style={styles.themeTop}>
        <View>
          <Text numberOfLines={1} style={[styles.themeName, { color: theme.foreground }]}>{theme.name}</Text>
          <Text style={[styles.themeMeta, { color: theme.foreground }]}>{theme.fontFamily} font</Text>
        </View>
        <View style={styles.swatches}>
          <View style={[styles.swatch, { backgroundColor: theme.muted }]} />
          <View style={[styles.swatch, { backgroundColor: theme.accent }]} />
        </View>
      </View>

      <View style={styles.previewStage}>
        <View style={[styles.previewIcon, { backgroundColor: theme.muted }]}>
          <Ionicons color={theme.accent} name="heart" size={30} />
        </View>
        <Text adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={2} style={[styles.previewTitle, { color: theme.foreground }]}>Will you marry me?</Text>
        <Text numberOfLines={1} style={[styles.previewCopy, { color: theme.foreground }]}>You mean the world to me.</Text>
        <View style={styles.previewActions}>
          <View style={[styles.yesButton, { backgroundColor: theme.accent }]}>
            <Text style={styles.yesText}>YES</Text>
          </View>
          <View style={[styles.noButton, { backgroundColor: theme.muted }]}>
            <Text style={[styles.noText, { color: theme.foreground }]}>NO</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 16, paddingTop: 12, backgroundColor: "#fff7fb" },
  topBar: { paddingTop: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconButton: { width: 42, height: 42, borderRadius: 16, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  badge: { minHeight: 36, borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", paddingHorizontal: 11, flexDirection: "row", alignItems: "center", gap: 7 },
  badgeText: { color: "#ec0e68", fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  header: { gap: 6, paddingTop: 18 },
  eyebrow: { color: "#ec0e68", fontSize: 13, fontWeight: "900", textTransform: "uppercase" },
  title: { color: "#101828", fontSize: 26, lineHeight: 32, fontWeight: "900" },
  subtitle: { color: "#667085", fontSize: 13, lineHeight: 20 },
  list: { gap: 12, paddingTop: 18, paddingBottom: 28 },
  themeCard: { minHeight: 248, borderRadius: 20, borderWidth: 1, borderColor: "#ffffff", padding: 15, justifyContent: "space-between", shadowColor: "#101828", shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
  themeTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  themeName: { fontSize: 18, fontWeight: "900", maxWidth: 210 },
  themeMeta: { marginTop: 2, fontSize: 12, fontWeight: "800", opacity: 0.62, textTransform: "capitalize" },
  swatches: { flexDirection: "row", gap: 8 },
  swatch: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: "rgba(16, 24, 40, 0.12)" },
  previewStage: { alignItems: "center", gap: 9, borderRadius: 18, backgroundColor: "rgba(255, 255, 255, 0.5)", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.7)", padding: 16 },
  previewIcon: { width: 54, height: 54, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  previewTitle: { fontSize: 25, lineHeight: 30, fontWeight: "900", textAlign: "center" },
  previewCopy: { fontSize: 14, opacity: 0.75 },
  previewActions: { alignSelf: "stretch", flexDirection: "row", gap: 8, marginTop: 5 },
  yesButton: { flex: 1, height: 44, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  yesText: { color: "#ffffff", fontWeight: "900" },
  noButton: { flex: 1, height: 44, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(16, 24, 40, 0.1)" },
  noText: { fontWeight: "900" }
});
