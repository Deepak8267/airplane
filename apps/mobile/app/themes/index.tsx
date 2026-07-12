import { Ionicons } from "@expo/vector-icons";
import { EXPERIENCE_THEMES } from "@airplane/shared";
import type { Theme } from "@airplane/shared";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FLOW_SIZE, MOBILE_FONT } from "@/design/tokens";
import { useBuilderStore } from "@/stores/builder-store";
import { useAppTheme } from "@/stores/app-theme-store";

export default function ThemesScreen() {
  const appTheme = useAppTheme();
  const draft = useBuilderStore((state) => state.draft);
  const updateDraft = useBuilderStore((state) => state.updateDraft);
  const initialThemeId = draft?.theme.id ?? EXPERIENCE_THEMES[0]?.id ?? "rose";
  const [selectedThemeId, setSelectedThemeId] = useState(initialThemeId);
  const selectedTheme = useMemo(
    () => EXPERIENCE_THEMES.find((theme) => theme.id === selectedThemeId) ?? EXPERIENCE_THEMES[0]!,
    [selectedThemeId]
  );
  const canApply = Boolean(draft);

  function applyTheme() {
    if (!draft) {
      router.push("/templates" as never);
      return;
    }

    updateDraft({ theme: selectedTheme });
    router.push("/builder" as never);
  }

  return (
    <SafeAreaView edges={["top"]} style={[styles.screen, { backgroundColor: appTheme.background }]}>
      <View style={styles.topBar}>
        <Pressable accessibilityLabel="Go back" style={[styles.iconButton, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]} onPress={() => router.back()}>
          <Ionicons color={appTheme.text} name="chevron-back" size={22} />
        </Pressable>
        <View style={[styles.badge, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]}>
          <Ionicons color={appTheme.primary} name="color-palette-outline" size={17} />
          <Text style={[styles.badgeText, { color: appTheme.primary }]}>Themes</Text>
        </View>
      </View>

      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: appTheme.primary }]}>Theme previews</Text>
        <Text adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={2} style={[styles.title, { color: appTheme.text }]}>Choose a mood</Text>
        <Text numberOfLines={2} style={[styles.subtitle, { color: appTheme.secondaryText }]}>
          {canApply ? "Select a theme and apply it to your current experience." : "Pick a template first, then apply a theme inside the builder."}
        </Text>
      </View>

      <FlatList
        data={EXPERIENCE_THEMES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View style={styles.footer}>
            <View style={[styles.selectedPanel, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]}>
              <View style={[styles.selectedSwatch, { backgroundColor: selectedTheme.accent }]} />
              <View style={styles.selectedCopy}>
                <Text numberOfLines={1} style={[styles.selectedTitle, { color: appTheme.text }]}>{selectedTheme.name}</Text>
                <Text numberOfLines={1} style={[styles.selectedSubtitle, { color: appTheme.secondaryText }]}>{canApply ? "Ready to apply to builder" : "Create a draft to use this theme"}</Text>
              </View>
            </View>
            <Pressable style={[styles.applyButton, { backgroundColor: appTheme.primary }, !canApply ? styles.applyButtonMuted : null]} onPress={applyTheme}>
              <Ionicons color="#ffffff" name={canApply ? "checkmark-circle-outline" : "albums-outline"} size={20} />
              <Text adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1} style={styles.applyButtonText}>
                {canApply ? "Apply Theme" : "Choose Template"}
              </Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <ThemeCard
            isSelected={item.id === selectedThemeId}
            onPress={() => setSelectedThemeId(item.id)}
            theme={item}
          />
        )}
      />
    </SafeAreaView>
  );
}

function ThemeCard({ isSelected, onPress, theme }: { isSelected: boolean; onPress: () => void; theme: Theme }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      style={[styles.themeCard, { backgroundColor: theme.background, borderColor: isSelected ? theme.accent : "#ffffff" }]}
      onPress={onPress}
    >
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
      {isSelected ? (
        <View style={[styles.selectedBadge, { backgroundColor: theme.accent }]}>
          <Ionicons color="#ffffff" name="checkmark" size={14} />
          <Text style={styles.selectedBadgeText}>Selected</Text>
        </View>
      ) : null}

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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: FLOW_SIZE.screenPadding, paddingTop: 10, backgroundColor: "#fff7fb" },
  topBar: { paddingTop: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconButton: { width: 42, height: 42, borderRadius: 16, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  badge: { minHeight: 36, borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", paddingHorizontal: 11, flexDirection: "row", alignItems: "center", gap: 7 },
  badgeText: { color: "#ec0e68", fontFamily: MOBILE_FONT.semibold, fontSize: FLOW_SIZE.caption, textTransform: "uppercase" },
  header: { gap: 5, paddingTop: 14 },
  eyebrow: { color: "#ec0e68", fontFamily: MOBILE_FONT.semibold, fontSize: FLOW_SIZE.caption, lineHeight: FLOW_SIZE.captionLine, textTransform: "uppercase" },
  title: { color: "#101828", fontFamily: MOBILE_FONT.bold, fontSize: FLOW_SIZE.headerTitle, lineHeight: FLOW_SIZE.headerTitleLine },
  subtitle: { color: "#667085", fontFamily: MOBILE_FONT.regular, fontSize: FLOW_SIZE.body, lineHeight: FLOW_SIZE.bodyLine },
  list: { gap: 12, paddingTop: 14, paddingBottom: 28 },
  themeCard: { minHeight: 226, borderRadius: FLOW_SIZE.cardRadius, borderWidth: 2, borderColor: "#ffffff", padding: FLOW_SIZE.cardPadding, justifyContent: "space-between", shadowColor: "#101828", shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
  themeTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  themeName: { fontFamily: MOBILE_FONT.semibold, fontSize: FLOW_SIZE.sectionTitle, maxWidth: 210 },
  themeMeta: { marginTop: 2, fontFamily: MOBILE_FONT.medium, fontSize: FLOW_SIZE.caption, opacity: 0.62, textTransform: "capitalize" },
  swatches: { flexDirection: "row", gap: 8 },
  swatch: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: "rgba(16, 24, 40, 0.12)" },
  previewStage: { alignItems: "center", gap: 8, borderRadius: 18, backgroundColor: "rgba(255, 255, 255, 0.5)", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.7)", padding: FLOW_SIZE.cardPadding },
  previewIcon: { width: 48, height: 48, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  previewTitle: { fontSize: FLOW_SIZE.pageTitle, lineHeight: FLOW_SIZE.pageTitleLine, fontWeight: "900", textAlign: "center" },
  previewCopy: { fontSize: FLOW_SIZE.body, opacity: 0.75 },
  previewActions: { alignSelf: "stretch", flexDirection: "row", gap: 8, marginTop: 5 },
  yesButton: { flex: 1, height: 42, borderRadius: FLOW_SIZE.compactRadius, alignItems: "center", justifyContent: "center" },
  yesText: { color: "#ffffff", fontFamily: MOBILE_FONT.semibold, fontSize: FLOW_SIZE.body },
  noButton: { flex: 1, height: 42, borderRadius: FLOW_SIZE.compactRadius, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(16, 24, 40, 0.1)" },
  noText: { fontFamily: MOBILE_FONT.semibold, fontSize: FLOW_SIZE.body },
  selectedBadge: { position: "absolute", right: 14, top: 58, minHeight: 26, borderRadius: 13, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9 },
  selectedBadgeText: { color: "#ffffff", fontFamily: MOBILE_FONT.semibold, fontSize: FLOW_SIZE.caption, textTransform: "uppercase" },
  footer: { gap: 12, paddingTop: 4 },
  selectedPanel: { minHeight: 62, borderRadius: 18, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", flexDirection: "row", alignItems: "center", gap: 10, padding: 12 },
  selectedSwatch: { width: 38, height: 38, borderRadius: 19 },
  selectedCopy: { flex: 1, minWidth: 0 },
  selectedTitle: { color: "#101828", fontFamily: MOBILE_FONT.semibold, fontSize: FLOW_SIZE.sectionTitle },
  selectedSubtitle: { color: "#667085", fontFamily: MOBILE_FONT.regular, fontSize: FLOW_SIZE.body, marginTop: 2 },
  applyButton: { height: FLOW_SIZE.buttonHeight, borderRadius: FLOW_SIZE.compactRadius, backgroundColor: "#ec0e68", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 16 },
  applyButtonMuted: { backgroundColor: "#667085" },
  applyButtonText: { color: "#ffffff", fontFamily: MOBILE_FONT.semibold, fontSize: 13 }
});
