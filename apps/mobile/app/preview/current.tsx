import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useBuilderStore } from "@/stores/builder-store";

export default function CurrentPreviewScreen() {
  const draft = useBuilderStore((state) => state.draft);
  const [index, setIndex] = useState(0);

  if (!draft || !draft.pages[index]) {
    return null;
  }

  const page = draft.pages[index];
  const isLast = index === draft.pages.length - 1;
  const primaryText = page.content.question ?? page.title;
  const supportingText = page.content.body ?? page.content.finalMessage;

  return (
    <ScrollView
      contentContainerStyle={styles.screen}
      style={{ backgroundColor: draft.theme.background }}
    >
      <View style={styles.pageMeta}>
        <Text style={[styles.recipient, { color: draft.theme.accent }]}>{draft.recipientName || "Recipient"}</Text>
        <Text style={[styles.counter, { color: draft.theme.foreground }]}>{index + 1} / {draft.pages.length}</Text>
      </View>

      {page.pageType === "cover" && draft.coverPhotoUrl ? (
        <Image source={{ uri: draft.coverPhotoUrl }} style={styles.coverImage} />
      ) : null}

      {page.content.question ? <Text style={[styles.pageLabel, { color: draft.theme.accent }]}>{page.title}</Text> : null}
      <Text style={[styles.title, { color: draft.theme.foreground }]}>{primaryText}</Text>
      {supportingText ? <Text style={[styles.copy, { color: draft.theme.foreground }]}>{supportingText}</Text> : null}

      {page.pageType === "countdown" && page.content.targetDate ? (
        <Text style={[styles.countdown, { color: draft.theme.accent }]}>{page.content.targetDate}</Text>
      ) : null}

      {page.pageType === "quiz" ? (
        <View style={styles.options}>
          {(page.content.answers ?? []).map((answer) => (
            <View key={answer.id} style={styles.option}>
              <Text style={[styles.optionText, { color: draft.theme.foreground }]}>{answer.label}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {page.pageType === "proposal" ? (
        <View style={styles.proposalActions}>
          <View style={[styles.proposalButton, { backgroundColor: draft.theme.accent }]}><Text style={styles.buttonText}>YES</Text></View>
          <View style={styles.noButton}><Text style={[styles.noButtonText, { color: draft.theme.foreground }]}>NO</Text></View>
        </View>
      ) : null}

      <View style={styles.navigation}>
        <Pressable accessibilityLabel="Back to editor" style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons color="#101828" name="create-outline" size={22} />
        </Pressable>
        {index > 0 ? (
          <Pressable accessibilityLabel="Previous page" style={styles.iconButton} onPress={() => setIndex((value) => value - 1)}>
            <Ionicons color="#101828" name="chevron-back" size={24} />
          </Pressable>
        ) : null}
        <Pressable
          style={[styles.button, { backgroundColor: draft.theme.accent }]}
          onPress={() => isLast ? router.push("/publish") : setIndex((value) => value + 1)}
        >
          <Text style={styles.buttonText}>{isLast ? "Looks good" : page.content.ctaLabel || "Next"}</Text>
          <Ionicons color="#ffffff" name={isLast ? "checkmark" : "chevron-forward"} size={20} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, padding: 24, justifyContent: "center", gap: 14 },
  pageMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  coverImage: { width: "100%", aspectRatio: 4 / 5, borderRadius: 8 },
  recipient: { fontSize: 16, fontWeight: "900" },
  counter: { fontSize: 13, fontWeight: "800", opacity: 0.6 },
  pageLabel: { fontSize: 13, fontWeight: "900", textTransform: "uppercase" },
  title: { fontSize: 38, lineHeight: 44, fontWeight: "900" },
  copy: { fontSize: 18, lineHeight: 27 },
  countdown: { fontSize: 24, fontWeight: "900" },
  options: { gap: 10 },
  option: { minHeight: 52, borderRadius: 8, borderWidth: 1, borderColor: "rgba(16, 24, 40, 0.14)", backgroundColor: "rgba(255, 255, 255, 0.75)", justifyContent: "center", paddingHorizontal: 16 },
  optionText: { fontSize: 16, fontWeight: "800" },
  proposalActions: { flexDirection: "row", gap: 10 },
  proposalButton: { flex: 1, height: 54, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  noButton: { flex: 1, height: 54, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255, 255, 255, 0.8)", borderWidth: 1, borderColor: "rgba(16, 24, 40, 0.14)" },
  noButtonText: { fontWeight: "900" },
  navigation: { flexDirection: "row", gap: 10, marginTop: 8 },
  iconButton: { width: 54, height: 54, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#d0d5dd" },
  button: { flex: 1, height: 54, borderRadius: 8, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center" },
  buttonText: { color: "#ffffff", fontWeight: "900", fontSize: 16 }
});
