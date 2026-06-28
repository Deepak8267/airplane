import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { publishExperience, updateDraftExperience } from "@/features/experiences/experience-service";
import { useBuilderStore } from "@/stores/builder-store";

export default function PublishScreen() {
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
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable accessibilityLabel="Back to preview" style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons color="#101828" name="chevron-back" size={22} />
          </Pressable>
          <View style={[styles.statusBadge, link ? styles.liveBadge : null]}>
            <Ionicons color={link ? "#067647" : "#ec0e68"} name={link ? "checkmark-circle" : "rocket-outline"} size={18} />
            <Text style={[styles.eyebrow, { color: link ? "#067647" : "#ec0e68" }]}>{link ? "Published" : "Ready"}</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons color="#ec0e68" name={link ? "paper-plane" : "rocket-outline"} size={34} />
          </View>
          <Text style={styles.title}>{link ? "Your link is live." : `${draft?.title ?? "Your experience"} is ready to fly.`}</Text>
          <Text style={styles.copy}>
            {link
              ? "Share this link anywhere. Recipients open the full web experience without installing the app."
              : "Publishing saves your latest edits, creates a unique slug, and turns on tracking for the web experience."}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Launch summary</Text>
          <View style={styles.summaryGrid}>
            <SummaryItem icon="person-outline" label="Recipient" value={draft?.recipientName || "Not set"} />
            <SummaryItem icon="documents-outline" label="Pages" value={`${pageCount}`} />
            <SummaryItem icon="color-palette-outline" label="Theme" value={draft?.theme.name ?? "Theme"} />
          </View>
        </View>

        {!link ? (
          <View style={styles.checklist}>
            <ChecklistItem complete={Boolean(draft?.title)} label="Title is saved" />
            <ChecklistItem complete={Boolean(draft?.recipientName)} label="Recipient name is added" />
            <ChecklistItem complete={pageCount > 0} label="Experience pages are ready" />
            <ChecklistItem complete={publishReady} label="Draft exists in Supabase" />
          </View>
        ) : (
          <View style={styles.linkPanel}>
            <View style={styles.linkHeader}>
              <View>
                <Text style={styles.linkLabel}>Live link</Text>
                <Text selectable numberOfLines={2} style={styles.link}>{link}</Text>
              </View>
              <Pressable accessibilityLabel="Copy link" style={styles.copyIconButton} onPress={copyLink}>
                <Ionicons color="#ec0e68" name={copied ? "checkmark-circle" : "copy-outline"} size={22} />
              </Pressable>
            </View>
            <Text style={styles.linkHint}>Views, completions, quiz answers, and proposal attempts will appear in Analytics.</Text>
          </View>
        )}

        {publishMutation.error instanceof Error ? <Text style={styles.error}>{publishMutation.error.message}</Text> : null}

        {!link ? (
          <Pressable
            style={[styles.button, { opacity: publishMutation.isPending || !publishReady ? 0.7 : 1 }]}
            onPress={() => publishMutation.mutate()}
            disabled={publishMutation.isPending || !publishReady}
          >
            <Ionicons color="#ffffff" name={publishMutation.isPending ? "hourglass-outline" : "rocket-outline"} size={20} />
            <Text style={styles.buttonText}>{publishMutation.isPending ? "Publishing..." : "Publish experience"}</Text>
          </Pressable>
        ) : (
          <View style={styles.publishedActions}>
            <Pressable style={styles.button} onPress={share}>
              <Ionicons color="#ffffff" name="share-social-outline" size={20} />
              <Text style={styles.buttonText}>Share link</Text>
            </Pressable>
            <View style={styles.actionGrid}>
              <Pressable style={styles.secondaryButton} onPress={copyLink}>
                <Ionicons color="#101828" name={copied ? "checkmark-circle-outline" : "copy-outline"} size={20} />
                <Text style={styles.secondaryButtonText}>{copied ? "Copied" : "Copy"}</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={openLink}>
                <Ionicons color="#101828" name="open-outline" size={20} />
                <Text style={styles.secondaryButtonText}>Open</Text>
              </Pressable>
            </View>
            {draft?.experienceId ? (
              <Pressable
                style={styles.secondaryButtonFull}
                onPress={() => router.push({ pathname: "/analytics/[id]", params: { id: draft.experienceId } } as never)}
              >
                <Ionicons color="#101828" name="bar-chart-outline" size={20} />
                <Text style={styles.secondaryButtonText}>View analytics</Text>
              </Pressable>
            ) : null}
          </View>
        )}

        <Pressable style={styles.textButton} onPress={() => router.replace("/experiences")}>
          <Text style={styles.textButtonText}>Back to my experiences</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function SummaryItem({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.summaryItem}>
      <Ionicons color="#ec0e68" name={icon} size={20} />
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function ChecklistItem({ complete, label }: { complete: boolean; label: string }) {
  return (
    <View style={styles.checkItem}>
      <Ionicons color={complete ? "#067647" : "#98a2b3"} name={complete ? "checkmark-circle" : "ellipse-outline"} size={21} />
      <Text style={styles.checkLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff7fb" },
  content: { flexGrow: 1, gap: 14, padding: 20, paddingBottom: 32 },
  topBar: { paddingTop: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconButton: { width: 42, height: 42, borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center" },
  statusBadge: { minHeight: 36, borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", paddingHorizontal: 11, flexDirection: "row", alignItems: "center", gap: 7 },
  liveBadge: { borderColor: "#abefc6", backgroundColor: "#ecfdf3" },
  eyebrow: { fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  hero: { gap: 12, padding: 18, borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff" },
  heroIcon: { width: 68, height: 68, borderRadius: 8, backgroundColor: "#fff0f6", alignItems: "center", justifyContent: "center" },
  title: { color: "#101828", fontSize: 34, lineHeight: 40, fontWeight: "900" },
  copy: { color: "#667085", lineHeight: 22, fontSize: 15 },
  summaryCard: { gap: 12, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff" },
  sectionTitle: { color: "#101828", fontSize: 18, fontWeight: "900" },
  summaryGrid: { flexDirection: "row", gap: 8 },
  summaryItem: { flex: 1, minHeight: 96, borderRadius: 8, backgroundColor: "#fff7fb", padding: 10, justifyContent: "center", gap: 5 },
  summaryLabel: { color: "#667085", fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  summaryValue: { color: "#101828", fontSize: 14, fontWeight: "900" },
  checklist: { gap: 8, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff" },
  checkItem: { minHeight: 38, flexDirection: "row", alignItems: "center", gap: 9 },
  checkLabel: { color: "#344054", fontWeight: "800" },
  linkPanel: { gap: 12, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#fbcfe8", padding: 14, borderRadius: 8 },
  linkHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  linkLabel: { color: "#ec0e68", fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  link: { color: "#101828", fontWeight: "800", lineHeight: 20, flexShrink: 1 },
  copyIconButton: { width: 44, height: 44, borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#fff7fb", alignItems: "center", justifyContent: "center" },
  linkHint: { color: "#667085", lineHeight: 20 },
  publishedActions: { gap: 10 },
  actionGrid: { flexDirection: "row", gap: 10 },
  button: { height: 54, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: "#ec0e68", flexDirection: "row", gap: 8 },
  buttonText: { color: "#ffffff", fontWeight: "900", fontSize: 16 },
  secondaryButton: { flex: 1, height: 50, borderRadius: 8, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#d0d5dd", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  secondaryButtonFull: { height: 50, borderRadius: 8, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#d0d5dd", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  secondaryButtonText: { color: "#101828", fontWeight: "900" },
  textButton: { minHeight: 44, alignItems: "center", justifyContent: "center" },
  textButtonText: { color: "#344054", fontWeight: "900" },
  error: { color: "#b42318", lineHeight: 20 }
});
