import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { AppThemeTokens } from "@/stores/app-theme-store";
import { APP_THEME_OPTIONS, useAppTheme, useAppThemeStore } from "@/stores/app-theme-store";

export default function SettingsScreen() {
  const appTheme = useAppTheme();
  const selectedThemeId = useAppThemeStore((state) => state.themeId);
  const setTheme = useAppThemeStore((state) => state.setTheme);
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(true);
  const [dark, setDark] = useState(false);
  const [branding, setBranding] = useState(true);
  const [password, setPassword] = useState(false);

  function showComingSoon(title: string) {
    Alert.alert(title, "This setting is prepared for the MVP UI and will be connected after auth/payment is finalized.");
  }

  function confirmDelete() {
    Alert.alert(
      "Delete account?",
      "Account deletion will be connected after signup is finalized. No data will be deleted right now.",
      [{ text: "OK" }]
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={[styles.root, { backgroundColor: appTheme.background }]}>
      <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable accessibilityLabel="Go back" style={[styles.iconButton, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]} onPress={() => router.back()}>
            <Ionicons color={appTheme.text} name="chevron-back" size={22} />
          </Pressable>
          <View style={[styles.badge, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]}>
            <Ionicons color={appTheme.primary} name="settings-outline" size={17} />
            <Text style={[styles.badgeText, { color: appTheme.primary }]}>Settings</Text>
          </View>
        </View>

        <View style={[styles.hero, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]}>
          <View style={[styles.heroIcon, { backgroundColor: appTheme.muted }]}>
            <Ionicons color={appTheme.primary} name="options-outline" size={30} />
          </View>
          <Text adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={2} style={[styles.title, { color: appTheme.text }]}>Creator preferences</Text>
          <Text style={[styles.subtitle, { color: appTheme.secondaryText }]}>Control notifications, branding defaults, and account-level options for AIRPLANE.</Text>
        </View>

        <Section theme={appTheme} title="Appearance" subtitle="Change the creator app theme.">
          <View style={styles.themeGrid}>
            {APP_THEME_OPTIONS.map((theme) => (
              <ThemeOption
                key={theme.id}
                selected={theme.id === selectedThemeId}
                theme={theme}
                onPress={() => setTheme(theme.id)}
              />
            ))}
          </View>
        </Section>

        <Section theme={appTheme} title="Notifications" subtitle="Choose how AIRPLANE should update you.">
          <Setting
            theme={appTheme}
            icon="notifications-outline"
            label="Push notifications"
            description="Publish updates and recipient activity."
            value={push}
            onValueChange={setPush}
          />
          <Setting
            theme={appTheme}
            icon="mail-outline"
            label="Email notifications"
            description="Receipts, product updates, and important account notices."
            value={email}
            onValueChange={setEmail}
          />
        </Section>

        <Section theme={appTheme} title="Experience defaults" subtitle="These options prepare future publishing defaults.">
          <Setting
            theme={appTheme}
            disabled
            icon="moon-outline"
            label="Dark mode"
            description="Coming later with full app theming."
            value={dark}
            onValueChange={setDark}
          />
          <Setting
            theme={appTheme}
            icon="paper-plane-outline"
            label="AIRPLANE branding"
            description="Free plan experiences include the AIRPLANE watermark."
            value={branding}
            onValueChange={setBranding}
          />
          <Setting
            theme={appTheme}
            disabled
            icon="lock-closed-outline"
            label="Password protect experiences"
            description="Prepared for a later privacy upgrade."
            value={password}
            onValueChange={setPassword}
          />
        </Section>

        <Section theme={appTheme} title="Account" subtitle="Security and account management.">
          <Action theme={appTheme} icon="key-outline" label="Change password" onPress={() => showComingSoon("Change password")} />
          <Action theme={appTheme} icon="shield-checkmark-outline" label="Login methods" onPress={() => showComingSoon("Login methods")} />
          <Action theme={appTheme} danger icon="trash-outline" label="Delete account" onPress={confirmDelete} />
        </Section>

        <Pressable style={[styles.secondaryButton, { backgroundColor: appTheme.surface, borderColor: appTheme.navBorder }]} onPress={() => router.back()}>
          <Ionicons color={appTheme.text} name="checkmark-circle-outline" size={20} />
          <Text style={[styles.secondaryButtonText, { color: appTheme.text }]}>Done</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ children, subtitle, theme, title }: { children: React.ReactNode; subtitle: string; theme: AppThemeTokens; title: string }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text numberOfLines={1} style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
        <Text numberOfLines={2} style={[styles.sectionSubtitle, { color: theme.secondaryText }]}>{subtitle}</Text>
      </View>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>{children}</View>
    </View>
  );
}

function ThemeOption({ onPress, selected, theme }: { onPress: () => void; selected: boolean; theme: AppThemeTokens }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={[styles.themeOption, { borderColor: selected ? theme.primary : theme.border, backgroundColor: theme.surface }]}
      onPress={onPress}
    >
      <View style={styles.themeSwatches}>
        <View style={[styles.themeSwatch, { backgroundColor: theme.primary }]} />
        <View style={[styles.themeSwatch, { backgroundColor: theme.background }]} />
        <View style={[styles.themeSwatch, { backgroundColor: theme.text }]} />
      </View>
      <Text numberOfLines={1} style={[styles.themeName, { color: theme.text }]}>{theme.name}</Text>
      <Text numberOfLines={2} style={[styles.themeDescription, { color: theme.secondaryText }]}>{theme.description}</Text>
      {selected ? (
        <View style={[styles.themeSelected, { backgroundColor: theme.primary }]}>
          <Ionicons color="#ffffff" name="checkmark" size={13} />
        </View>
      ) : null}
    </Pressable>
  );
}

function Setting({
  description,
  disabled = false,
  icon,
  label,
  onValueChange,
  theme,
  value
}: {
  description: string;
  disabled?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onValueChange: (value: boolean) => void;
  theme: AppThemeTokens;
  value: boolean;
}) {
  return (
    <View style={[styles.row, disabled ? styles.disabledRow : null]}>
      <View style={[styles.rowIcon, { backgroundColor: theme.muted }]}>
        <Ionicons color={disabled ? theme.secondaryText : theme.primary} name={icon} size={20} />
      </View>
      <View style={styles.rowCopy}>
        <Text numberOfLines={1} style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
        <Text numberOfLines={2} style={[styles.rowDescription, { color: theme.secondaryText }]}>{description}</Text>
      </View>
      <Switch
        disabled={disabled}
        thumbColor="#ffffff"
        trackColor={{ false: "#d0d5dd", true: theme.primary }}
        value={value}
        onValueChange={onValueChange}
      />
    </View>
  );
}

function Action({ danger = false, icon, label, onPress, theme }: { danger?: boolean; icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; theme: AppThemeTokens }) {
  const color = danger ? theme.danger : theme.text;

  return (
    <Pressable style={styles.actionRow} onPress={onPress}>
      <View style={[styles.rowIcon, { backgroundColor: danger ? "#FEF3F2" : theme.muted }]}>
        <Ionicons color={danger ? theme.danger : theme.primary} name={icon} size={20} />
      </View>
      <Text numberOfLines={1} style={[styles.actionLabel, { color }]}>{label}</Text>
      <Ionicons color={danger ? theme.danger : theme.secondaryText} name="chevron-forward" size={19} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff7fb" },
  screen: { flexGrow: 1, gap: 16, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 34 },
  topBar: { paddingTop: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconButton: { width: 42, height: 42, borderRadius: 16, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  badge: { minHeight: 36, borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", paddingHorizontal: 11, flexDirection: "row", alignItems: "center", gap: 7 },
  badgeText: { color: "#ec0e68", fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  hero: { gap: 10, borderRadius: 20, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", padding: 16 },
  heroIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: "#fff0f6", alignItems: "center", justifyContent: "center" },
  title: { color: "#101828", fontSize: 26, lineHeight: 32, fontWeight: "900" },
  subtitle: { color: "#667085", fontSize: 13, lineHeight: 20 },
  section: { gap: 10 },
  sectionHeader: { gap: 3 },
  sectionTitle: { color: "#101828", fontSize: 18, fontWeight: "900" },
  sectionSubtitle: { color: "#667085", fontSize: 13, lineHeight: 18 },
  card: { borderRadius: 18, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", overflow: "hidden" },
  themeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, padding: 12 },
  themeOption: { flexBasis: "47%", flexGrow: 1, minHeight: 116, borderRadius: 16, borderWidth: 2, padding: 12, gap: 7 },
  themeSwatches: { flexDirection: "row", gap: 5 },
  themeSwatch: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: "rgba(16,24,40,0.12)" },
  themeName: { fontSize: 12, fontWeight: "900" },
  themeDescription: { fontSize: 10, lineHeight: 14, fontWeight: "700" },
  themeSelected: { position: "absolute", right: 9, top: 9, width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  row: { minHeight: 74, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eaecf0" },
  disabledRow: { opacity: 0.58 },
  rowIcon: { width: 38, height: 38, borderRadius: 14, backgroundColor: "#fff0f6", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  rowCopy: { flex: 1, minWidth: 0, gap: 3 },
  rowLabel: { color: "#101828", fontWeight: "900" },
  rowDescription: { color: "#667085", fontSize: 12, lineHeight: 17 },
  actionRow: { minHeight: 62, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: "#eaecf0" },
  actionLabel: { flex: 1, fontWeight: "900" },
  dangerIcon: { backgroundColor: "#fef3f2" },
  secondaryButton: { height: 52, borderRadius: 16, borderWidth: 1, borderColor: "#d0d5dd", backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  secondaryButtonText: { color: "#101828", fontWeight: "900" }
});
