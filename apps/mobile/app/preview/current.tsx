import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useBuilderStore } from "@/stores/builder-store";

export default function CurrentPreviewScreen() {
  const draft = useBuilderStore((state) => state.draft);

  if (!draft) {
    return null;
  }

  return (
    <View style={[styles.screen, { backgroundColor: draft.theme.background }]}>
      <Text style={[styles.recipient, { color: draft.theme.accent }]}>{draft.recipientName}</Text>
      <Text style={[styles.title, { color: draft.theme.foreground }]}>{draft.title}</Text>
      <Text style={[styles.copy, { color: draft.theme.foreground }]}>{draft.message}</Text>
      <Pressable style={[styles.button, { backgroundColor: draft.theme.accent }]} onPress={() => router.push("/publish")}>
        <Text style={styles.buttonText}>Looks good</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 24, justifyContent: "center", gap: 14 },
  recipient: { fontSize: 16, fontWeight: "900" },
  title: { fontSize: 38, lineHeight: 44, fontWeight: "900" },
  copy: { fontSize: 18, lineHeight: 27 },
  button: { height: 54, borderRadius: 8, alignItems: "center", justifyContent: "center", marginTop: 8 },
  buttonText: { color: "#ffffff", fontWeight: "900", fontSize: 16 }
});
