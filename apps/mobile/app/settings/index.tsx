import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";

export default function SettingsScreen() {
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
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable accessibilityLabel="Go back" style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons color="#101828" name="chevron-back" size={22} />
          </Pressable>
          <View style={styles.badge}>
            <Ionicons color="#ec0e68" name="settings-outline" size={17} />
            <Text style={styles.badgeText}>Settings</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons color="#ec0e68" name="options-outline" size={30} />
          </View>
          <Text style={styles.title}>Creator preferences</Text>
          <Text style={styles.subtitle}>Control notifications, branding defaults, and account-level options for AIRPLANE.</Text>
        </View>

        <Section title="Notifications" subtitle="Choose how AIRPLANE should update you.">
          <Setting
            icon="notifications-outline"
            label="Push notifications"
            description="Publish updates and recipient activity."
            value={push}
            onValueChange={setPush}
          />
          <Setting
            icon="mail-outline"
            label="Email notifications"
            description="Receipts, product updates, and important account notices."
            value={email}
            onValueChange={setEmail}
          />
        </Section>

        <Section title="Experience defaults" subtitle="These options prepare future publishing defaults.">
          <Setting
            disabled
            icon="moon-outline"
            label="Dark mode"
            description="Coming later with full app theming."
            value={dark}
            onValueChange={setDark}
          />
          <Setting
            icon="paper-plane-outline"
            label="AIRPLANE branding"
            description="Free plan experiences include the AIRPLANE watermark."
            value={branding}
            onValueChange={setBranding}
          />
          <Setting
            disabled
            icon="lock-closed-outline"
            label="Password protect experiences"
            description="Prepared for a later privacy upgrade."
            value={password}
            onValueChange={setPassword}
          />
        </Section>

        <Section title="Account" subtitle="Security and account management.">
          <Action icon="key-outline" label="Change password" onPress={() => showComingSoon("Change password")} />
          <Action icon="shield-checkmark-outline" label="Login methods" onPress={() => showComingSoon("Login methods")} />
          <Action danger icon="trash-outline" label="Delete account" onPress={confirmDelete} />
        </Section>

        <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
          <Ionicons color="#101828" name="checkmark-circle-outline" size={20} />
          <Text style={styles.secondaryButtonText}>Done</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Section({ children, subtitle, title }: { children: React.ReactNode; subtitle: string; title: string }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Setting({
  description,
  disabled = false,
  icon,
  label,
  onValueChange,
  value
}: {
  description: string;
  disabled?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onValueChange: (value: boolean) => void;
  value: boolean;
}) {
  return (
    <View style={[styles.row, disabled ? styles.disabledRow : null]}>
      <View style={styles.rowIcon}>
        <Ionicons color={disabled ? "#98a2b3" : "#ec0e68"} name={icon} size={20} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      <Switch
        disabled={disabled}
        thumbColor="#ffffff"
        trackColor={{ false: "#d0d5dd", true: "#ec0e68" }}
        value={value}
        onValueChange={onValueChange}
      />
    </View>
  );
}

function Action({ danger = false, icon, label, onPress }: { danger?: boolean; icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  const color = danger ? "#b42318" : "#101828";

  return (
    <Pressable style={styles.actionRow} onPress={onPress}>
      <View style={[styles.rowIcon, danger ? styles.dangerIcon : null]}>
        <Ionicons color={danger ? "#b42318" : "#ec0e68"} name={icon} size={20} />
      </View>
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
      <Ionicons color={danger ? "#b42318" : "#98a2b3"} name="chevron-forward" size={19} />
    </Pressable>
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
  section: { gap: 10 },
  sectionHeader: { gap: 3 },
  sectionTitle: { color: "#101828", fontSize: 18, fontWeight: "900" },
  sectionSubtitle: { color: "#667085", fontSize: 13, lineHeight: 18 },
  card: { borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", overflow: "hidden" },
  row: { minHeight: 74, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eaecf0" },
  disabledRow: { opacity: 0.58 },
  rowIcon: { width: 38, height: 38, borderRadius: 8, backgroundColor: "#fff0f6", alignItems: "center", justifyContent: "center" },
  rowCopy: { flex: 1, minWidth: 0, gap: 3 },
  rowLabel: { color: "#101828", fontWeight: "900" },
  rowDescription: { color: "#667085", fontSize: 12, lineHeight: 17 },
  actionRow: { minHeight: 62, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: "#eaecf0" },
  actionLabel: { flex: 1, fontWeight: "900" },
  dangerIcon: { backgroundColor: "#fef3f2" },
  secondaryButton: { height: 52, borderRadius: 8, borderWidth: 1, borderColor: "#d0d5dd", backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  secondaryButtonText: { color: "#101828", fontWeight: "900" }
});
