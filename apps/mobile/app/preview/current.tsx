import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { getCountdownParts } from "@airplane/shared";
import type { ExperiencePageDraft, Theme } from "@airplane/shared";
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useBuilderStore } from "@/stores/builder-store";
import { useAppTheme } from "@/stores/app-theme-store";

export default function CurrentPreviewScreen() {
  const appTheme = useAppTheme();
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
      <SafeAreaView edges={["top"]} style={[styles.emptyScreen, { backgroundColor: appTheme.background }]}>
        <View style={[styles.emptyIcon, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]}>
          <Ionicons color={appTheme.primary} name="eye-outline" size={30} />
        </View>
        <Text style={[styles.emptyTitle, { color: appTheme.text }]}>Nothing to preview yet.</Text>
        <Text style={[styles.emptyCopy, { color: appTheme.secondaryText }]}>Choose a template or open an existing draft first.</Text>
        <Pressable style={[styles.emptyButton, { backgroundColor: appTheme.primary }]} onPress={() => router.replace("/home")}>
          <Ionicons color="#ffffff" name="sparkles-outline" size={19} />
          <Text style={styles.emptyButtonText}>Go to templates</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const page = activePage;
  const isLast = index === draft.pages.length - 1;
  const progress = Math.round(((index + 1) / draft.pages.length) * 100);
  const pagePhotoUrl = page.mediaUrls[0] ?? (page.pageType === "cover" ? draft.coverPhotoUrl : null);
  const themedFont = { fontFamily: getMobileFontFamily(draft.theme.fontFamily) };

  return (
    <SafeAreaView edges={["top"]} style={[styles.root, { backgroundColor: draft.theme.background }]}>
      <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable accessibilityLabel="Back to editor" style={[styles.topIconButton, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]} onPress={() => router.back()}>
            <Ionicons color={appTheme.text} name="create-outline" size={21} />
          </Pressable>
          <View style={[styles.previewBadge, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]}>
            <Ionicons color={draft.theme.accent} name="eye-outline" size={17} />
            <Text style={[styles.previewBadgeText, { color: draft.theme.accent }]}>Preview</Text>
          </View>
        </View>

        <View style={[styles.progressShell, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: draft.theme.accent }]} />
          </View>
          <Text style={styles.progressText}>{index + 1}/{draft.pages.length}</Text>
        </View>

        <View style={styles.phoneCard}>
          <PreviewPageBody
            coverPhotoUrl={draft.coverPhotoUrl}
            fontFamily={themedFont.fontFamily}
            page={page}
            pagePhotoUrl={pagePhotoUrl}
            recipientName={draft.recipientName}
            theme={draft.theme}
            now={now}
          />

          <PageDots activeIndex={index} count={draft.pages.length} accent={draft.theme.accent} />
          <Text style={styles.watermark}>Made with AIRPLANE</Text>
        </View>

        <View style={styles.navigation}>
          <Pressable
            accessibilityLabel="Previous page"
            disabled={index === 0}
            style={[styles.navIconButton, index === 0 && styles.disabledButton]}
            onPress={() => setIndex((value) => Math.max(value - 1, 0))}
          >
            <Ionicons color="#101828" name="chevron-back" size={24} />
          </Pressable>
          <Pressable
            style={[styles.button, { backgroundColor: draft.theme.accent }]}
            onPress={() => (isLast ? router.push("/publish") : setIndex((value) => Math.min(value + 1, draft.pages.length - 1)))}
          >
            <Text style={[styles.buttonText, themedFont]}>{isLast ? "Looks good" : page.content.ctaLabel || "Next"}</Text>
            <Ionicons color="#ffffff" name={isLast ? "checkmark" : "chevron-forward"} size={20} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PreviewPageBody({
  fontFamily,
  now,
  page,
  pagePhotoUrl,
  recipientName,
  theme
}: {
  coverPhotoUrl: string | null;
  fontFamily: string;
  now: number;
  page: ExperiencePageDraft;
  pagePhotoUrl: string | null;
  recipientName: string;
  theme: Theme;
}) {
  const primaryText = page.content.question ?? page.title;
  const supportingText = page.content.body ?? page.content.finalMessage;
  const themedFont = { fontFamily };

  return (
    <View style={styles.cardContent}>
      {pagePhotoUrl ? (
        <View style={styles.mediaFrame}>
          <Image source={{ uri: pagePhotoUrl }} style={page.pageType === "cover" ? styles.coverImage : styles.pageImage} />
        </View>
      ) : (
        <View style={[styles.placeholderMedia, { backgroundColor: theme.muted }]}>
          <Ionicons color={theme.accent} name={getPageIcon(page.pageType)} size={34} />
        </View>
      )}

      <Text style={[styles.recipient, themedFont, { color: theme.accent }]}>{recipientName || "Recipient"}</Text>
      {page.content.question ? <Text style={[styles.pageLabel, themedFont, { color: theme.foreground }]}>{page.title}</Text> : null}
      <Text style={[styles.title, themedFont, { color: theme.foreground }]}>{primaryText}</Text>
      {supportingText ? <Text style={[styles.copy, themedFont, { color: theme.foreground }]}>{supportingText}</Text> : null}

      {page.pageType === "countdown" && page.content.targetDate ? (
        <CountdownPanel accent={theme.accent} fontFamily={fontFamily} foreground={theme.foreground} now={now} targetDate={page.content.targetDate} />
      ) : null}

      {page.pageType === "quiz" ? (
        <View style={styles.options}>
          {(page.content.answers ?? []).map((answer, answerIndex) => (
            <View key={answer.id} style={[styles.option, { backgroundColor: theme.muted }]}>
              <Text style={[styles.optionLetter, { color: theme.accent }]}>{String.fromCharCode(65 + answerIndex)}</Text>
              <Text style={[styles.optionText, themedFont, { color: theme.foreground }]}>{answer.label}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {page.pageType === "proposal" ? (
        <View style={styles.proposalActions}>
          <View style={[styles.proposalButton, { backgroundColor: theme.accent }]}>
            <Text style={[styles.proposalButtonText, themedFont]}>YES</Text>
          </View>
          <View style={[styles.noButton, { backgroundColor: theme.muted }]}>
            <Text style={[styles.noButtonText, themedFont, { color: theme.foreground }]}>NO</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function CountdownPanel({ accent, fontFamily, foreground, now, targetDate }: { accent: string; fontFamily: string; foreground: string; now: number; targetDate: string }) {
  const countdown = getCountdownParts(targetDate, now);

  if (!countdown.isValid) {
    return <Text style={[styles.countdownMessage, { color: foreground, fontFamily }]}>Coming soon</Text>;
  }

  if (countdown.isComplete) {
    return <Text style={[styles.countdownMessage, { color: accent, fontFamily }]}>It's time!</Text>;
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

function PageDots({ activeIndex, count, accent }: { activeIndex: number; count: number; accent: string }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              width: index === activeIndex ? 18 : 6,
              backgroundColor: index === activeIndex ? accent : "rgba(16, 24, 40, 0.18)"
            }
          ]}
        />
      ))}
    </View>
  );
}

function getPageIcon(pageType: ExperiencePageDraft["pageType"]): keyof typeof Ionicons.glyphMap {
  if (pageType === "cover") {
    return "sparkles-outline";
  }

  if (pageType === "memory") {
    return "image-outline";
  }

  if (pageType === "quiz") {
    return "help-circle-outline";
  }

  if (pageType === "countdown") {
    return "timer-outline";
  }

  if (pageType === "proposal") {
    return "heart-outline";
  }

  return "checkmark-circle-outline";
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
  root: { flex: 1 },
  emptyScreen: { flex: 1, padding: 16, justifyContent: "center", gap: 20, backgroundColor: "#fff7fb" },
  emptyIcon: { width: 58, height: 58, borderRadius: 18, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#fbcfe8", alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: "#101828", fontSize: 28, lineHeight: 34, fontWeight: "900" },
  emptyCopy: { color: "#667085", fontSize: 16, lineHeight: 23 },
  emptyButton: { height: 52, borderRadius: 16, backgroundColor: "#ec0e68", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  emptyButtonText: { color: "#ffffff", fontWeight: "900" },
  screen: { flexGrow: 1, padding: 16, paddingBottom: 28, justifyContent: "center", gap: 20 },
  topBar: { paddingTop: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  topIconButton: { width: 42, height: 42, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff", borderWidth: 1, borderColor: "rgba(16, 24, 40, 0.12)" },
  previewBadge: { minHeight: 36, borderRadius: 16, backgroundColor: "rgba(255, 255, 255, 0.82)", borderWidth: 1, borderColor: "rgba(16, 24, 40, 0.08)", paddingHorizontal: 11, flexDirection: "row", alignItems: "center", gap: 7 },
  previewBadgeText: { fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  progressShell: { minHeight: 40, borderRadius: 20, backgroundColor: "rgba(255, 255, 255, 0.72)", borderWidth: 1, borderColor: "rgba(16, 24, 40, 0.08)", flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12 },
  progressTrack: { flex: 1, height: 7, borderRadius: 999, overflow: "hidden", backgroundColor: "rgba(16, 24, 40, 0.1)" },
  progressFill: { height: "100%", borderRadius: 999 },
  progressText: { color: "#667085", fontSize: 12, fontWeight: "900" },
  phoneCard: { gap: 14, padding: 16, borderRadius: 22, backgroundColor: "rgba(255, 255, 255, 0.82)", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.88)", shadowColor: "#101828", shadowOpacity: 0.1, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } },
  cardContent: { gap: 12 },
  mediaFrame: { overflow: "hidden", borderRadius: 18, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.84)", backgroundColor: "#ffffff" },
  coverImage: { width: "100%", aspectRatio: 4 / 5 },
  pageImage: { width: "100%", aspectRatio: 4 / 3 },
  placeholderMedia: { height: 118, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  recipient: { fontSize: 13, fontWeight: "900", textTransform: "uppercase" },
  pageLabel: { fontSize: 12, fontWeight: "900", textTransform: "uppercase", opacity: 0.58 },
  title: { fontSize: 34, lineHeight: 40, fontWeight: "900" },
  copy: { fontSize: 13, lineHeight: 20, opacity: 0.78 },
  countdownGrid: { flexDirection: "row", gap: 6 },
  countdownUnit: { flex: 1, minWidth: 0, height: 74, borderRadius: 8, backgroundColor: "rgba(255, 255, 255, 0.72)", alignItems: "center", justifyContent: "center", gap: 3, borderWidth: 1, borderColor: "rgba(16, 24, 40, 0.06)" },
  countdownValue: { fontSize: 22, fontWeight: "900" },
  countdownLabel: { fontSize: 9, fontWeight: "800", opacity: 0.65 },
  countdownMessage: { fontSize: 28, fontWeight: "900" },
  options: { gap: 10 },
  option: { minHeight: 52, borderRadius: 18, borderWidth: 1, borderColor: "rgba(16, 24, 40, 0.12)", flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12 },
  optionLetter: { width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(255, 255, 255, 0.78)", textAlign: "center", lineHeight: 30, fontSize: 12, fontWeight: "900" },
  optionText: { flex: 1, fontSize: 15, fontWeight: "800" },
  proposalActions: { flexDirection: "row", gap: 10 },
  proposalButton: { flex: 1, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  proposalButtonText: { color: "#ffffff", fontWeight: "900" },
  noButton: { flex: 1, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(16, 24, 40, 0.12)" },
  noButtonText: { fontWeight: "900" },
  dots: { flexDirection: "row", justifyContent: "center", gap: 6, paddingTop: 2 },
  dot: { height: 6, borderRadius: 999 },
  watermark: { color: "#667085", textAlign: "center", fontSize: 11, fontWeight: "800" },
  navigation: { flexDirection: "row", gap: 10 },
  navIconButton: { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#d0d5dd" },
  disabledButton: { opacity: 0.35 },
  button: { flex: 1, height: 52, borderRadius: 16, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center" },
  buttonText: { color: "#ffffff", fontWeight: "900", fontSize: 16 }
});
