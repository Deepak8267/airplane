import * as Sharing from "expo-sharing";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useBuilderStore } from "@/stores/builder-store";

export default function PublishScreen() {
  const draft = useBuilderStore((state) => state.draft);
  const slug = useMemo(() => Math.random().toString(36).slice(2, 8).toUpperCase(), []);
  const link = `${process.env.EXPO_PUBLIC_WEB_URL ?? "https://airplane.app"}/e/${slug}`;

  async function share() {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(link);
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>Published</Text>
      <Text style={styles.title}>{draft?.title ?? "Your experience"} is ready.</Text>
      <Text style={styles.link}>{link}</Text>
      <Pressable style={styles.button} onPress={share}>
        <Text style={styles.buttonText}>Share link</Text>
      </Pressable>
      <Text style={styles.note}>Production publishing uses the Supabase `publish_experience` function.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 24, justifyContent: "center", gap: 14 },
  eyebrow: { color: "#2563eb", fontSize: 13, fontWeight: "900", textTransform: "uppercase" },
  title: { color: "#101828", fontSize: 32, lineHeight: 38, fontWeight: "900" },
  link: { color: "#344054", backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#eaecf0", padding: 14, borderRadius: 8, fontWeight: "800" },
  button: { height: 54, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: "#101828" },
  buttonText: { color: "#ffffff", fontWeight: "900", fontSize: 16 },
  note: { color: "#667085", lineHeight: 20 }
});
