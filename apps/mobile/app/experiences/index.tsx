import { useState } from "react";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Experience } from "@airplane/shared";
import { Alert, FlatList, Modal, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { duplicateExperience, getExperienceForEditing, getMyExperiences, setExperienceArchived } from "@/features/experiences/experience-service";
import { useBuilderStore } from "@/stores/builder-store";

export default function ExperiencesScreen() {
  const [menuExperience, setMenuExperience] = useState<Experience | null>(null);
  const [copiedExperienceId, setCopiedExperienceId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const startFromExperience = useBuilderStore((state) => state.startFromExperience);
  const experiencesQuery = useQuery({
    queryKey: ["my-experiences"],
    queryFn: getMyExperiences
  });
  const editMutation = useMutation({
    mutationFn: getExperienceForEditing,
    onSuccess: ({ experience, pages }) => {
      startFromExperience(experience, pages);
      router.push("/builder");
    }
  });
  const duplicateMutation = useMutation({
    mutationFn: duplicateExperience,
    onSuccess: ({ experience, pages }) => {
      void queryClient.invalidateQueries({ queryKey: ["my-experiences"] });
      setMenuExperience(null);
      startFromExperience(experience, pages);
      router.push("/builder");
    }
  });
  const archiveMutation = useMutation({
    mutationFn: setExperienceArchived,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-experiences"] });
      setMenuExperience(null);
    }
  });
  const experiences = experiencesQuery.data ?? [];

  function openActionMenu(experience: Experience) {
    duplicateMutation.reset();
    archiveMutation.reset();
    setMenuExperience(experience);
  }

  function changeArchiveState(experience: Experience) {
    const archived = experience.status !== "archived";

    if (!archived) {
      archiveMutation.mutate({ experienceId: experience.id, archived: false });
      return;
    }

    Alert.alert(
      "Archive experience?",
      "Its public link will stop working until you restore and republish it.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive",
          style: "destructive",
          onPress: () => archiveMutation.mutate({ experienceId: experience.id, archived: true })
        }
      ]
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Library</Text>
        <Text style={styles.title}>My experiences</Text>
      </View>

      <FlatList
        data={experiences}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={experiencesQuery.isRefetching} onRefresh={() => experiencesQuery.refetch()} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{experiencesQuery.isLoading ? "Loading experiences..." : "No experiences yet"}</Text>
            <Text style={styles.emptyCopy}>
              {experiencesQuery.error instanceof Error ? experiencesQuery.error.message : "Create one from a template to see it here."}
            </Text>
            <Link href="/home" asChild>
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Choose template</Text>
              </Pressable>
            </Link>
          </View>
        }
        renderItem={({ item }) => {
          const isArchived = item.status === "archived";

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={[styles.status, item.isPublished ? styles.published : isArchived ? styles.archived : styles.draft]}>
                  {item.isPublished ? "published" : isArchived ? "archived" : "draft"}
                </Text>
              </View>
              <Text style={styles.recipient}>{item.recipientName || "No recipient yet"}</Text>
              <Text style={styles.message} numberOfLines={2}>
                {item.message || "No message yet"}
              </Text>
              <View style={styles.cardActions}>
                <Pressable
                  disabled={editMutation.isPending}
                  style={[styles.secondaryButton, editMutation.isPending && editMutation.variables === item.id ? styles.pendingButton : null]}
                  onPress={() => editMutation.mutate(item.id)}
                >
                  <Ionicons color="#101828" name="create-outline" size={19} />
                  <Text style={styles.secondaryButtonText}>
                    {editMutation.isPending && editMutation.variables === item.id ? "Opening..." : "Edit"}
                  </Text>
                </Pressable>
                {item.isPublished ? (
                  <Pressable
                    style={styles.secondaryButton}
                    onPress={() => router.push({ pathname: "/analytics/[id]", params: { id: item.id } } as never)}
                  >
                    <Ionicons color="#101828" name="bar-chart-outline" size={19} />
                    <Text style={styles.secondaryButtonText}>Analytics</Text>
                  </Pressable>
                ) : null}
                <Pressable style={styles.iconButton} accessibilityLabel="More experience actions" onPress={() => openActionMenu(item)}>
                  <Ionicons color="#101828" name="ellipsis-horizontal" size={21} />
                </Pressable>
              </View>
              {editMutation.variables === item.id && editMutation.error instanceof Error ? (
                <Text style={styles.error}>{editMutation.error.message}</Text>
              ) : null}
            </View>
          );
        }}
      />

      <Modal animationType="slide" transparent visible={Boolean(menuExperience)} onRequestClose={() => setMenuExperience(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.actionSheet}>
            <View style={styles.actionSheetHeader}>
              <View style={styles.actionSheetHeading}>
                <Text style={styles.actionSheetTitle} numberOfLines={1}>{menuExperience?.title}</Text>
                <Text style={styles.actionSheetSubtitle}>{menuExperience?.status}</Text>
              </View>
              <Pressable style={styles.closeButton} accessibilityLabel="Close actions" onPress={() => setMenuExperience(null)}>
                <Ionicons color="#101828" name="close" size={22} />
              </Pressable>
            </View>

            {menuExperience?.isPublished && menuExperience.slug ? (
              <MenuAction
                icon="copy-outline"
                label="Copy link"
                onPress={() => {
                  const link = `${process.env.EXPO_PUBLIC_WEB_URL ?? "https://airplane.app"}/e/${menuExperience.slug}`;
                  void Clipboard.setStringAsync(link);
                  setCopiedExperienceId(menuExperience.id);
                  setMenuExperience(null);
                  setTimeout(() => setCopiedExperienceId(null), 1800);
                }}
              />
            ) : null}
            <MenuAction
              disabled={duplicateMutation.isPending}
              icon="duplicate-outline"
              label={duplicateMutation.isPending ? "Duplicating..." : "Duplicate"}
              onPress={() => menuExperience && duplicateMutation.mutate(menuExperience.id)}
            />
            <MenuAction
              destructive={menuExperience?.status !== "archived"}
              disabled={archiveMutation.isPending}
              icon={menuExperience?.status === "archived" ? "refresh-outline" : "archive-outline"}
              label={archiveMutation.isPending ? "Updating..." : menuExperience?.status === "archived" ? "Restore to drafts" : "Archive"}
              onPress={() => menuExperience && changeArchiveState(menuExperience)}
            />
            {duplicateMutation.error instanceof Error ? <Text style={styles.error}>{duplicateMutation.error.message}</Text> : null}
            {archiveMutation.error instanceof Error ? <Text style={styles.error}>{archiveMutation.error.message}</Text> : null}
          </View>
        </View>
      </Modal>
      {copiedExperienceId ? (
        <View style={styles.toast}>
          <Ionicons color="#ffffff" name="checkmark-circle-outline" size={18} />
          <Text style={styles.toastText}>Link copied</Text>
        </View>
      ) : null}
    </View>
  );
}

function MenuAction({
  destructive = false,
  disabled = false,
  icon,
  label,
  onPress
}: {
  destructive?: boolean;
  disabled?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const color = destructive ? "#b42318" : "#101828";

  return (
    <Pressable disabled={disabled} style={[styles.menuAction, disabled && styles.pendingButton]} onPress={onPress}>
      <Ionicons color={color} name={icon} size={21} />
      <Text style={[styles.menuActionText, { color }]}>{label}</Text>
      <Ionicons color="#98a2b3" name="chevron-forward" size={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20 },
  header: { paddingTop: 8, gap: 6 },
  eyebrow: { color: "#2563eb", fontSize: 13, fontWeight: "800", textTransform: "uppercase" },
  title: { color: "#101828", fontSize: 30, lineHeight: 36, fontWeight: "900" },
  list: { gap: 12, paddingTop: 18, paddingBottom: 40 },
  card: { gap: 10, padding: 16, backgroundColor: "#ffffff", borderRadius: 8, borderWidth: 1, borderColor: "#eaecf0" },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardTitle: { flex: 1, color: "#101828", fontSize: 18, fontWeight: "900" },
  status: { overflow: "hidden", borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5, fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  published: { color: "#067647", backgroundColor: "#dcfae6" },
  draft: { color: "#b54708", backgroundColor: "#fef0c7" },
  archived: { color: "#475467", backgroundColor: "#eaecf0" },
  recipient: { color: "#344054", fontWeight: "800" },
  message: { color: "#667085", lineHeight: 20 },
  cardActions: { flexDirection: "row", gap: 8 },
  secondaryButton: { flex: 1, height: 44, borderRadius: 8, borderWidth: 1, borderColor: "#d0d5dd", flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center" },
  pendingButton: { opacity: 0.65 },
  secondaryButtonText: { color: "#101828", fontWeight: "900" },
  iconButton: { width: 44, height: 44, borderRadius: 8, borderWidth: 1, borderColor: "#d0d5dd", alignItems: "center", justifyContent: "center" },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(16, 24, 40, 0.45)" },
  actionSheet: { backgroundColor: "#ffffff", padding: 20, paddingBottom: 32, gap: 4, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  actionSheetHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  actionSheetHeading: { flex: 1, gap: 2 },
  actionSheetTitle: { color: "#101828", fontSize: 20, fontWeight: "900" },
  actionSheetSubtitle: { color: "#667085", fontSize: 12, fontWeight: "800", textTransform: "uppercase" },
  closeButton: { width: 40, height: 40, borderRadius: 8, borderWidth: 1, borderColor: "#d0d5dd", alignItems: "center", justifyContent: "center" },
  menuAction: { minHeight: 56, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: "#eaecf0" },
  menuActionText: { flex: 1, fontSize: 16, fontWeight: "900" },
  emptyState: { padding: 16, borderRadius: 8, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#eaecf0", gap: 10 },
  emptyTitle: { color: "#101828", fontSize: 17, fontWeight: "900" },
  emptyCopy: { color: "#667085", lineHeight: 20 },
  primaryButton: { height: 48, borderRadius: 8, backgroundColor: "#101828", alignItems: "center", justifyContent: "center" },
  primaryButtonText: { color: "#ffffff", fontWeight: "900" },
  toast: { position: "absolute", left: 20, right: 20, bottom: 22, minHeight: 48, borderRadius: 8, backgroundColor: "#101828", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  toastText: { color: "#ffffff", fontWeight: "900" },
  error: { color: "#b42318", lineHeight: 20 }
});
