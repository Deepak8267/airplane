import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";

export default function SettingsScreen() {
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(true);
  const [dark, setDark] = useState(false);
  const [branding, setBranding] = useState(true);
  const [password, setPassword] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Header title="Settings" subtitle="Control app preferences and creator defaults." />
      <View style={styles.card}>
        <Setting icon="notifications-outline" label="Push notifications" value={push} onValueChange={setPush} />
        <Setting icon="mail-outline" label="Email notifications" value={email} onValueChange={setEmail} />
        <Setting icon="moon-outline" label="Dark mode" value={dark} onValueChange={setDark} />
        <Setting icon="paper-plane-outline" label="AIRPLANE branding" value={branding} onValueChange={setBranding} />
        <Setting icon="lock-closed-outline" label="Password protect experiences" value={password} onValueChange={setPassword} />
      </View>
      <View style={styles.card}>
        <Action label="Change password" />
        <Action danger label="Delete account" />
      </View>
      <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
        <Text style={styles.secondaryButtonText}>Back</Text>
      </Pressable>
    </ScrollView>
  );
}

function Header({ subtitle, title }: { subtitle: string; title: string }) {
  return (
    <View style={styles.header}>
      <Text style={styles.eyebrow}>AIRPLANE</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

function Setting({ icon, label, onValueChange, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; onValueChange: (value: boolean) => void; value: boolean }) {
  return (
    <View style={styles.row}>
      <Ionicons color="#ec0e68" name={icon} size={20} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch thumbColor="#ffffff" trackColor={{ false: "#d0d5dd", true: "#ec0e68" }} value={value} onValueChange={onValueChange} />
    </View>
  );
}

function Action({ danger = false, label }: { danger?: boolean; label: string }) {
  return (
    <Pressable style={styles.actionRow}>
      <Text style={[styles.actionLabel, danger ? styles.dangerText : null]}>{label}</Text>
      <Ionicons color={danger ? "#b42318" : "#98a2b3"} name="chevron-forward" size={19} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, gap: 16, padding: 20, backgroundColor: "#fff7fb" },
  header: { gap: 6, paddingTop: 8 },
  eyebrow: { color: "#ec0e68", fontSize: 13, fontWeight: "900", textTransform: "uppercase" },
  title: { color: "#101828", fontSize: 32, lineHeight: 38, fontWeight: "900" },
  subtitle: { color: "#667085", fontSize: 15, lineHeight: 22 },
  card: { borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", overflow: "hidden" },
  row: { minHeight: 60, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: "#eaecf0" },
  rowLabel: { flex: 1, color: "#101828", fontWeight: "900" },
  actionRow: { minHeight: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: "#eaecf0" },
  actionLabel: { color: "#101828", fontWeight: "900" },
  dangerText: { color: "#b42318" },
  secondaryButton: { height: 50, borderRadius: 8, borderWidth: 1, borderColor: "#d0d5dd", backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center" },
  secondaryButtonText: { color: "#101828", fontWeight: "900" }
});
