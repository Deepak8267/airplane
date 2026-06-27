import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { getCountdownParts } from "@airplane/shared";
import type { Theme } from "@airplane/shared";
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useBuilderStore } from "@/stores/builder-store";

export default function CurrentPreviewScreen() {
  const draft = useBuilderStore((state) => state.draft);
  const [index, setIndex] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const activePage = draft?.pages[index];
  const countdownTarget = activePage?.pageType === "countdown" ? activePage.content.targetDate : undefined;

  useEffect(() => {
    if (!countdownTarget) {
      return;
    }

    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [countdownTarget]);

  if (!draft || !activePage) {
    return (
      <View style={styles.emptyScreen}>
        <Ionicons color="#2563eb" name="eye-outline" size={30} />
        <Text style={styles.emptyTitle}>Nothing to preview yet.</Text>
        <Text style={styles.emptyCopy}>Choose a template or open an existing draft first.</Text>
        <Pressable style={styles.emptyButton} onPress={() => router.replace("/home")}>
          <Text style={styles.emptyButtonText}>Go to templates</Text>
        </Pressable>
      </View>
    );
  }

  const page = activePage;
  const isLast = index === draft.pages.length - 1;
  const primaryText = page.content.question ?? page.title;
  const supportingText = page.content.body ?? page.content.finalMessage;
  const pagePhotoUrl = page.mediaUrls[0] ?? (page.pageType === "cover" ? draft.coverPhotoUrl : null);
  const themedFont = { fontFamily: getMobileFontFamily(draft.theme.fontFamily) };

  return (
    <ScrollView
      contentContainerStyle={styles.screen}
      style={{ backgroundColor: draft.theme.background }}
    >
      <View style={styles.pageMeta}>
        <Text style={[styles.recipient, themedFont, { color: draft.theme.accent }]}>{draft.recipientName || "Recipient"}</Text>
        <Text style={[styles.counter, themedFont, { color: draft.theme.foreground }]}>{index + 1} / {draft.pages.length}</Text>
      </View>

      {pagePhotoUrl ? (
        <Image source={{ uri: pagePhotoUrl }} style={page.pageType === "cover" ? styles.coverImage : styles.pageImage} />
      ) : null}

      {page.content.question ? <Text style={[styles.pageLabel, themedFont, { color: draft.theme.accent }]}>{page.title}</Text> : null}
      <Text style={[styles.title, themedFont, { color: draft.theme.foreground }]}>{primaryText}</Text>
      {supportingText ? <Text style={[styles.copy, themedFont, { color: draft.theme.foreground }]}>{supportingText}</Text> : null}

      {page.pageType === "countdown" && page.content.targetDate ? (
        <CountdownPanel
          accent={draft.theme.accent}
          foreground={draft.theme.foreground}
          fontFamily={themedFont.fontFamily}
          now={now}
          targetDate={page.content.targetDate}
        />
      ) : null}

      {page.pageType === "quiz" ? (
        <View style={styles.options}>
          {(page.content.answers ?? []).map((answer) => (
            <View key={answer.id} style={[styles.option, { backgroundColor: draft.theme.muted }]}>
              <Text style={[styles.optionText, themedFont, { color: draft.theme.foreground }]}>{answer.label}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {page.pageType === "proposal" ? (
        <View style={styles.proposalActions}>
          <View style={[styles.proposalButton, { backgroundColor: draft.theme.accent }]}><Text style={[styles.buttonText, themedFont]}>YES</Text></View>
          <View style={[styles.noButton, { backgroundColor: draft.theme.muted }]}><Text style={[styles.noButtonText, themedFont, { color: draft.theme.foreground }]}>NO</Text></View>
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
          <Text style={[styles.buttonText, themedFont]}>{isLast ? "Looks good" : page.content.ctaLabel || "Next"}</Text>
          <Ionicons color="#ffffff" name={isLast ? "checkmark" : "chevron-forward"} size={20} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

function CountdownPanel({ accent, fontFamily, foreground, now, targetDate }: { accent: string; fontFamily: string; foreground: string; now: number; targetDate: string }) {
  const countdown = getCountdownParts(targetDate, now);

  if (!countdown.isValid) {
    return <Text style={[styles.countdownMessage, { color: foreground, fontFamily }]}>Coming soon</Text>;
  }

  if (countdown.isComplete) {
    return <Text style={[styles.countdownMessage, { color: accent, fontFamily }]}>It&apos;s time!</Text>;
  }

  const units = [
    { label: "Days", value: countdown.days },
    { label: "Hours", value: countdown.hours },
    { label: "Minutes", value: countdown.minutes },
    { label: "Seconds", value: countdown.seconds }
  ];

  return (
    <View style={styles.countdownGrid}>
      {units.map((unit) => (
        <View key={unit.label} style={styles.countdownUnit}>
          <Text style={[styles.countdownValue, { color: accent, fontFamily }]}>{unit.value.toString().padStart(2, "0")}</Text>
          <Text style={[styles.countdownLabel, { color: foreground, fontFamily }]}>{unit.label}</Text>
        </View>
      ))}
    </View>
  );
}

function getMobileFontFamily(fontFamily: Theme["fontFamily"]) {
  if (fontFamily === "serif") {
    return Platform.select({ android: "serif", ios: "Georgia", default: "Georgia" }) ?? "serif";
  }

  if (fontFamily === "rounded") {
    return Platform.select({ android: "sans-serif", ios: "Arial Rounded MT Bold", default: "ui-rounded" }) ?? "sans-serif";
  }

  return Platform.select({ android: "sans-serif", ios: "System", default: "system-ui" }) ?? "sans-serif";
}

const styles = StyleSheet.create({
  emptyScreen: { flex: 1, padding: 24, justifyContent: "center", gap: 12 },
  emptyTitle: { color: "#101828", fontSize: 28, lineHeight: 34, fontWeight: "900" },
  emptyCopy: { color: "#667085", fontSize: 16, lineHeight: 23 },
  emptyButton: { height: 52, borderRadius: 8, backgroundColor: "#101828", alignItems: "center", justifyContent: "center" },
  emptyButtonText: { color: "#ffffff", fontWeight: "900" },
  screen: { flexGrow: 1, padding: 24, justifyContent: "center", gap: 14 },
  pageMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  coverImage: { width: "100%", aspectRatio: 4 / 5, borderRadius: 8 },
  pageImage: { width: "100%", aspectRatio: 4 / 3, borderRadius: 8 },
  recipient: { fontSize: 16, fontWeight: "900" },
  counter: { fontSize: 13, fontWeight: "800", opacity: 0.6 },
  pageLabel: { fontSize: 13, fontWeight: "900", textTransform: "uppercase" },
  title: { fontSize: 38, lineHeight: 44, fontWeight: "900" },
  copy: { fontSize: 18, lineHeight: 27 },
  countdownGrid: { flexDirection: "row", gap: 6 },
  countdownUnit: { flex: 1, minWidth: 0, height: 74, borderRadius: 8, backgroundColor: "rgba(255, 255, 255, 0.72)", alignItems: "center", justifyContent: "center", gap: 3 },
  countdownValue: { fontSize: 23, fontWeight: "900" },
  countdownLabel: { fontSize: 10, fontWeight: "800", opacity: 0.65 },
  countdownMessage: { fontSize: 28, fontWeight: "900" },
  options: { gap: 10 },
  option: { minHeight: 52, borderRadius: 8, borderWidth: 1, borderColor: "rgba(16, 24, 40, 0.14)", justifyContent: "center", paddingHorizontal: 16 },
  optionText: { fontSize: 16, fontWeight: "800" },
  proposalActions: { flexDirection: "row", gap: 10 },
  proposalButton: { flex: 1, height: 54, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  noButton: { flex: 1, height: 54, borderRadius: 8, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(16, 24, 40, 0.14)" },
  noButtonText: { fontWeight: "900" },
  navigation: { flexDirection: "row", gap: 10, marginTop: 8 },
  iconButton: { width: 54, height: 54, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#d0d5dd" },
  button: { flex: 1, height: 54, borderRadius: 8, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center" },
  buttonText: { color: "#ffffff", fontWeight: "900", fontSize: 16 }
});
