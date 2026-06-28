import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, Linking, Pressable, Share, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { publishExperience, updateDraftExperience } from "@/features/experiences/experience-service";
import { useBuilderStore } from "@/stores/builder-store";

export default function PublishScreen() {
  const draft = useBuilderStore((state) => state.draft);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();
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
    <View style={styles.screen}>
      <View style={styles.statusBadge}>
        <Ionicons color={link ? "#067647" : "#ec0e68"} name={link ? "checkmark-circle" : "rocket-outline"} size={20} />
        <Text style={[styles.eyebrow, { color: link ? "#067647" : "#ec0e68" }]}>{link ? "Published" : "Ready to publish"}</Text>
      </View>
      <Text style={styles.title}>{link ? "Your link is live." : `${draft?.title ?? "Your experience"} is ready.`}</Text>
      <Text style={styles.copy}>
        {link ? "Share it anywhere. Recipients can open it on the web without installing the app." : "Publishing saves the final draft, creates the public slug, and turns on the web experience."}
      </Text>

      {link ? (
        <View style={styles.linkPanel}>
          <Text style={styles.linkLabel}>Live link</Text>
          <Text selectable style={styles.link}>{link}</Text>
        </View>
      ) : null}

      {publishMutation.error instanceof Error ? <Text style={styles.error}>{publishMutation.error.message}</Text> : null}
      {!link ? (
        <Pressable
          style={[styles.button, { opacity: publishMutation.isPending ? 0.7 : 1 }]}
          onPress={() => publishMutation.mutate()}
          disabled={publishMutation.isPending || !draft?.experienceId}
        >
          <Ionicons color="#ffffff" name="rocket-outline" size={20} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 24, justifyContent: "center", gap: 16, backgroundColor: "#fff7fb" },
  statusBadge: { alignSelf: "flex-start", minHeight: 34, borderRadius: 8, borderWidth: 1, borderColor: "#d0d5dd", backgroundColor: "#ffffff", paddingHorizontal: 10, flexDirection: "row", alignItems: "center", gap: 7 },
  eyebrow: { fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  title: { color: "#101828", fontSize: 32, lineHeight: 38, fontWeight: "900" },
  copy: { color: "#667085", lineHeight: 21, fontSize: 15 },
  linkPanel: { gap: 8, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#eaecf0", padding: 14, borderRadius: 8 },
  linkLabel: { color: "#344054", fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  link: { color: "#101828", fontWeight: "800", lineHeight: 20 },
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
