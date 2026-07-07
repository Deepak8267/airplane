import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { publishExperience, updateDraftExperience } from "@/features/experiences/experience-service";
import { useBuilderStore } from "@/stores/builder-store";
import { useAppTheme } from "@/stores/app-theme-store";

export default function PublishScreen() {
  const appTheme = useAppTheme();
  const draft = useBuilderStore((state) => state.draft);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();
  const pageCount = draft?.pages.length ?? 0;
  const publishReady = Boolean(draft?.experienceId);
  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!draft?.experienceId) {
        throw new Error("No draft is ready to publish.");
      }

      await updateDraftExperience({
        id: draft.experienceId,
        title: draft.title,
        recipientName: draft.recipientName,
        message: draft.message,
        coverPhotoUrl: draft.coverPhotoUrl,
        theme: draft.theme,
        pages: draft.pages
      });

      return publishExperience(draft.experienceId);
    },
    onSuccess: (slug) => {
      setLink(`${process.env.EXPO_PUBLIC_WEB_URL ?? "https://airplane.app"}/e/${slug}`);
      void queryClient.invalidateQueries({ queryKey: ["my-experiences"] });
      void queryClient.invalidateQueries({ queryKey: ["analytics-dashboard"] });
    }
  });

  async function share() {
    if (!link) {
      return;
    }

    await Share.share({
      message: link,
      url: link,
      title: draft?.title ?? "AIRPLANE experience"
    });
  }

  async function copyLink() {
    if (!link) {
      return;
    }

    await Clipboard.setStringAsync(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function openLink() {
    if (!link) {
      return;
    }

    const canOpen = await Linking.canOpenURL(link);
    if (!canOpen) {
      Alert.alert("Could not open link", "Copy the link and open it in your browser.");
      return;
    }

    await Linking.openURL(link);
  }

  return (
    <SafeAreaView edges={["top"]} style={[styles.root, { backgroundColor: appTheme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable accessibilityLabel="Back to preview" style={[styles.iconButton, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]} onPress={() => router.back()}>
            <Ionicons color={appTheme.text} name="chevron-back" size={22} />
          </Pressable>
          <View style={[styles.statusBadge, { backgroundColor: appTheme.surface, borderColor: appTheme.border }, link ? styles.liveBadge : null]}>
            <Ionicons color={link ? appTheme.success : appTheme.primary} name={link ? "checkmark-circle" : "rocket-outline"} size={18} />
            <Text style={[styles.eyebrow, { color: link ? appTheme.success : appTheme.primary }]}>{link ? "Published" : "Ready"}</Text>
          </View>
        </View>

        <View style={[styles.hero, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]}>
          <View style={[styles.heroIcon, { backgroundColor: link ? "#ECFDF3" : appTheme.muted }]}>
            <Ionicons color={link ? appTheme.success : appTheme.primary} name={link ? "checkmark-circle" : "rocket-outline"} size={34} />
          </View>
          <Text style={[styles.title, { color: appTheme.text }]}>{link ? "Your link is live." : `${draft?.title ?? "Your experience"} is ready to fly.`}</Text>
          <Text style={[styles.copy, { color: appTheme.secondaryText }]}>
            {link
              ? "Share this link anywhere. Recipients open the full web experience without installing the app."
              : "Publishing saves your latest edits, creates a unique slug, and turns on tracking for the web experience."}
          </Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]}>
          <Text style={[styles.sectionTitle, { color: appTheme.text }]}>Launch summary</Text>
          <View style={styles.summaryGrid}>
            <SummaryItem icon="person-outline" label="Recipient" value={draft?.recipientName || "Not set"} />
            <SummaryItem icon="documents-outline" label="Pages" value={`${pageCount}`} />
            <SummaryItem icon="color-palette-outline" label="Theme" value={draft?.theme.name ?? "Theme"} />
          </View>
        </View>

        {!link ? (
          <View style={[styles.checklist, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]}>
            <ChecklistItem complete={Boolean(draft?.title)} label="Title is saved" />
            <ChecklistItem complete={Boolean(draft?.recipientName)} label="Recipient name is added" />
            <ChecklistItem complete={pageCount > 0} label="Experience pages are ready" />
            <ChecklistItem complete={publishReady} label="Draft exists in Supabase" />
          </View>
        ) : (
          <View style={[styles.linkPanel, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]}>
            <View style={styles.successRow}>
              <View style={[styles.successIcon, { backgroundColor: "#ECFDF3" }]}>
                <Ionicons color={appTheme.success} name="shield-checkmark-outline" size={22} />
              </View>
              <View style={styles.successCopy}>
                <Text style={[styles.successTitle, { color: appTheme.text }]}>Published successfully</Text>
                <Text style={[styles.successSubtitle, { color: appTheme.secondaryText }]}>Analytics tracking is now active for this experience.</Text>
              </View>
            </View>
            <View style={styles.linkHeader}>
              <View>
                <Text style={[styles.linkLabel, { color: appTheme.primary }]}>Live link</Text>
                <Text selectable numberOfLines={2} style={[styles.link, { color: appTheme.text }]}>{link}</Text>
              </View>
              <Pressable accessibilityLabel="Copy link" style={[styles.copyIconButton, { backgroundColor: appTheme.surfaceAlt, borderColor: appTheme.border }]} onPress={copyLink}>
                <Ionicons color={appTheme.primary} name={copied ? "checkmark-circle" : "copy-outline"} size={22} />
              </Pressable>
            </View>
            <Text style={[styles.linkHint, { color: appTheme.secondaryText }]}>Views, completions, quiz answers, and proposal attempts will appear in Analytics.</Text>
          </View>
        )}

        {publishMutation.error instanceof Error ? <Text style={styles.error}>{publishMutation.error.message}</Text> : null}

        {!link ? (
          <Pressable
            style={[styles.button, { backgroundColor: appTheme.primary, opacity: publishMutation.isPending || !publishReady ? 0.7 : 1 }]}
            onPress={() => publishMutation.mutate()}
            disabled={publishMutation.isPending || !publishReady}
          >
            <Ionicons color="#ffffff" name={publishMutation.isPending ? "hourglass-outline" : "rocket-outline"} size={20} />
            <Text style={styles.buttonText}>{publishMutation.isPending ? "Publishing..." : "Publish experience"}</Text>
          </Pressable>
        ) : (
          <View style={styles.publishedActions}>
            <Pressable style={[styles.button, { backgroundColor: appTheme.primary }]} onPress={share}>
              <Ionicons color="#ffffff" name="share-social-outline" size={20} />
              <Text style={styles.buttonText}>Share link</Text>
            </Pressable>
            <View style={styles.actionGrid}>
              <Pressable style={[styles.secondaryButton, { backgroundColor: appTheme.surface, borderColor: appTheme.navBorder }]} onPress={copyLink}>
                <Ionicons color={appTheme.text} name={copied ? "checkmark-circle-outline" : "copy-outline"} size={20} />
                <Text style={[styles.secondaryButtonText, { color: appTheme.text }]}>{copied ? "Copied" : "Copy"}</Text>
              </Pressable>
              <Pressable style={[styles.secondaryButton, { backgroundColor: appTheme.surface, borderColor: appTheme.navBorder }]} onPress={openLink}>
                <Ionicons color={appTheme.text} name="open-outline" size={20} />
                <Text style={[styles.secondaryButtonText, { color: appTheme.text }]}>Open</Text>
              </Pressable>
            </View>
            {draft?.experienceId ? (
              <Pressable
                style={[styles.secondaryButtonFull, { backgroundColor: appTheme.surface, borderColor: appTheme.navBorder }]}
                onPress={() => router.push({ pathname: "/analytics/[id]", params: { id: draft.experienceId } } as never)}
              >
                <Ionicons color={appTheme.text} name="bar-chart-outline" size={20} />
                <Text style={[styles.secondaryButtonText, { color: appTheme.text }]}>View analytics</Text>
              </Pressable>
            ) : null}
          </View>
        )}

        <Pressable style={styles.textButton} onPress={() => router.replace("/experiences")}>
          <Text style={[styles.textButtonText, { color: appTheme.secondaryText }]}>Back to my experiences</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryItem({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  const appTheme = useAppTheme();

  return (
    <View style={[styles.summaryItem, { backgroundColor: appTheme.surfaceAlt }]}>
      <Ionicons color={appTheme.primary} name={icon} size={20} />
      <Text style={[styles.summaryLabel, { color: appTheme.secondaryText }]}>{label}</Text>
      <Text numberOfLines={1} style={[styles.summaryValue, { color: appTheme.text }]}>{value}</Text>
    </View>
  );
}

function ChecklistItem({ complete, label }: { complete: boolean; label: string }) {
  const appTheme = useAppTheme();

  return (
    <View style={styles.checkItem}>
      <Ionicons color={complete ? appTheme.success : appTheme.secondaryText} name={complete ? "checkmark-circle" : "ellipse-outline"} size={21} />
      <Text style={[styles.checkLabel, { color: appTheme.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff7fb" },
  content: { flexGrow: 1, gap: 20, padding: 16, paddingBottom: 32 },
  topBar: { paddingTop: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconButton: { width: 42, height: 42, borderRadius: 16, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center" },
  statusBadge: { minHeight: 36, borderRadius: 16, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", paddingHorizontal: 11, flexDirection: "row", alignItems: "center", gap: 7 },
  liveBadge: { borderColor: "#abefc6", backgroundColor: "#ecfdf3" },
  eyebrow: { fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  hero: { gap: 12, padding: 16, borderRadius: 22, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff" },
  heroIcon: { width: 68, height: 68, borderRadius: 22, backgroundColor: "#fff0f6", alignItems: "center", justifyContent: "center" },
  title: { color: "#101828", fontSize: 34, lineHeight: 40, fontWeight: "900" },
  copy: { color: "#667085", lineHeight: 20, fontSize: 13 },
  summaryCard: { gap: 12, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff" },
  sectionTitle: { color: "#101828", fontSize: 14, fontWeight: "900" },
  summaryGrid: { flexDirection: "row", gap: 8 },
  summaryItem: { flex: 1, minHeight: 96, borderRadius: 18, backgroundColor: "#fff7fb", padding: 10, justifyContent: "center", gap: 5 },
  summaryLabel: { color: "#667085", fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  summaryValue: { color: "#101828", fontSize: 14, fontWeight: "900" },
  checklist: { gap: 8, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff" },
  checkItem: { minHeight: 38, flexDirection: "row", alignItems: "center", gap: 9 },
  checkLabel: { color: "#344054", fontWeight: "800" },
  linkPanel: { gap: 12, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#fbcfe8", padding: 16, borderRadius: 20 },
  successRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  successIcon: { width: 44, height: 44, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  successCopy: { flex: 1, minWidth: 0, gap: 2 },
  successTitle: { fontSize: 15, fontWeight: "900" },
  successSubtitle: { fontSize: 12, lineHeight: 17 },
  linkHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  linkLabel: { color: "#ec0e68", fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  link: { color: "#101828", fontWeight: "800", lineHeight: 20, flexShrink: 1 },
  copyIconButton: { width: 44, height: 44, borderRadius: 16, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#fff7fb", alignItems: "center", justifyContent: "center" },
  linkHint: { color: "#667085", lineHeight: 18, fontSize: 12 },
  publishedActions: { gap: 10 },
  actionGrid: { flexDirection: "row", gap: 10 },
  button: { height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "#ec0e68", flexDirection: "row", gap: 8 },
  buttonText: { color: "#ffffff", fontWeight: "900", fontSize: 16 },
  secondaryButton: { flex: 1, height: 50, borderRadius: 16, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#d0d5dd", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  secondaryButtonFull: { height: 50, borderRadius: 16, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#d0d5dd", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  secondaryButtonText: { color: "#101828", fontWeight: "900" },
  textButton: { minHeight: 44, alignItems: "center", justifyContent: "center" },
  textButtonText: { color: "#344054", fontWeight: "900" },
  error: { color: "#b42318", lineHeight: 20 }
});
