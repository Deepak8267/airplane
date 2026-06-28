import { useState } from "react";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Experience } from "@airplane/shared";
import { Alert, FlatList, Image, Linking, Modal, Pressable, RefreshControl, Share, StyleSheet, Text, View } from "react-native";
import { BottomNav } from "@/components/bottom-nav";
import { duplicateExperience, getExperienceForEditing, getMyExperiences, setExperienceArchived } from "@/features/experiences/experience-service";
import { useBuilderStore } from "@/stores/builder-store";

export default function ExperiencesScreen() {
  const [menuExperience, setMenuExperience] = useState<Experience | null>(null);
  const [copiedExperienceId, setCopiedExperienceId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "published" | "draft" | "archived">("all");
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
  const filteredExperiences = experiences.filter((experience) => {
    if (filter === "published") {
      return experience.isPublished;
    }

    if (filter === "archived") {
      return experience.status === "archived";
    }

    if (filter === "draft") {
      return !experience.isPublished && experience.status !== "archived";
    }

    return true;
  });
  const stats = {
    total: experiences.length,
    published: experiences.filter((experience) => experience.isPublished).length,
    drafts: experiences.filter((experience) => !experience.isPublished && experience.status !== "archived").length,
    archived: experiences.filter((experience) => experience.status === "archived").length
  };

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

  async function copyExperienceLink(experience: Experience) {
    if (!experience.slug) {
      return;
    }

    await Clipboard.setStringAsync(getExperienceLink(experience.slug));
    setCopiedExperienceId(experience.id);
    setMenuExperience(null);
    setTimeout(() => setCopiedExperienceId(null), 1800);
  }

  async function shareExperience(experience: Experience) {
    if (!experience.slug) {
      return;
    }

    await Share.share({
      message: getExperienceLink(experience.slug),
      url: getExperienceLink(experience.slug),
      title: experience.title || "AIRPLANE experience"
    });
  }

  async function openExperienceLink(experience: Experience) {
    if (!experience.slug) {
      return;
    }

    const link = getExperienceLink(experience.slug);
    const canOpen = await Linking.canOpenURL(link);

    if (!canOpen) {
      Alert.alert("Could not open link", "Copy the link and open it in your browser.");
      return;
    }

    await Linking.openURL(link);
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Library</Text>
          <Text style={styles.title}>My experiences</Text>
        </View>
        <Link href="/home" asChild>
          <Pressable style={styles.createButton}>
            <Ionicons color="#ffffff" name="add" size={22} />
          </Pressable>
        </Link>
      </View>

      <FlatList
        data={filteredExperiences}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={experiencesQuery.isRefetching} onRefresh={() => experiencesQuery.refetch()} />}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <View style={styles.statsGrid}>
              <Metric label="Total" value={stats.total} />
              <Metric label="Live" value={stats.published} />
              <Metric label="Drafts" value={stats.drafts} />
            </View>
            <View style={styles.filters}>
              <FilterPill active={filter === "all"} label="All" onPress={() => setFilter("all")} />
              <FilterPill active={filter === "published"} label="Live" onPress={() => setFilter("published")} />
              <FilterPill active={filter === "draft"} label="Drafts" onPress={() => setFilter("draft")} />
              <FilterPill active={filter === "archived"} label="Archived" onPress={() => setFilter("archived")} />
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons color="#ec0e68" name={experiencesQuery.isLoading ? "hourglass-outline" : "albums-outline"} size={26} />
            </View>
            <Text style={styles.emptyTitle}>{experiencesQuery.isLoading ? "Loading experiences..." : filter === "all" ? "No experiences yet" : `No ${filter} experiences`}</Text>
            <Text style={styles.emptyCopy}>
              {experiencesQuery.error instanceof Error ? experiencesQuery.error.message : "Create one from a template, then drafts and live links will appear here."}
            </Text>
            <Link href="/home" asChild>
              <Pressable style={styles.primaryButton}>
                <Ionicons color="#ffffff" name="sparkles-outline" size={19} />
                <Text style={styles.primaryButtonText}>Choose template</Text>
              </Pressable>
            </Link>
          </View>
        }
        renderItem={({ item }) => {
          const isArchived = item.status === "archived";

          return (
            <View style={styles.card}>
              <View style={styles.visualRow}>
                <View style={[styles.thumbnail, { backgroundColor: item.theme.muted }]}>
                  {item.coverPhotoUrl ? (
                    <Image source={{ uri: item.coverPhotoUrl }} style={styles.thumbnailImage} />
                  ) : (
                    <Ionicons color={item.theme.accent} name={item.isPublished ? "paper-plane-outline" : "image-outline"} size={26} />
                  )}
                </View>
                <View style={styles.cardMain}>
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
                </View>
              </View>
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
                    onPress={() => openExperienceLink(item)}
                  >
                    <Ionicons color="#101828" name="open-outline" size={19} />
                    <Text style={styles.secondaryButtonText}>Open</Text>
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
              <>
                <View style={styles.linkPreview}>
                  <Text style={styles.linkPreviewLabel}>Live link</Text>
                  <Text selectable numberOfLines={1} style={styles.linkPreviewText}>{getExperienceLink(menuExperience.slug)}</Text>
                </View>
                <MenuAction icon="open-outline" label="Open link" onPress={() => void openExperienceLink(menuExperience)} />
                <MenuAction icon="share-social-outline" label="Share link" onPress={() => void shareExperience(menuExperience)} />
                <MenuAction icon="copy-outline" label="Copy link" onPress={() => void copyExperienceLink(menuExperience)} />
                <MenuAction
                  icon="bar-chart-outline"
                  label="View analytics"
                  onPress={() => {
                    const experienceId = menuExperience.id;
                    setMenuExperience(null);
                    router.push({ pathname: "/analytics/[id]", params: { id: experienceId } } as never);
                  }}
                />
              </>
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
      <BottomNav active="library" />
    </View>
  );
}

function getExperienceLink(slug: string) {
  return `${process.env.EXPO_PUBLIC_WEB_URL ?? "https://airplane.app"}/e/${slug}`;
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function FilterPill({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable style={[styles.filterPill, active && styles.filterPillActive]} onPress={onPress}>
      <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>{label}</Text>
    </Pressable>
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
  screen: { flex: 1, paddingHorizontal: 20, paddingTop: 20, backgroundColor: "#fff7fb" },
  header: { paddingTop: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 14 },
  eyebrow: { color: "#ec0e68", fontSize: 13, fontWeight: "800", textTransform: "uppercase" },
  title: { color: "#101828", fontSize: 30, lineHeight: 36, fontWeight: "900" },
  createButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#ec0e68", alignItems: "center", justifyContent: "center", shadowColor: "#ec0e68", shadowOpacity: 0.2, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
  list: { gap: 12, paddingTop: 18, paddingBottom: 110 },
  listHeader: { gap: 14 },
  statsGrid: { flexDirection: "row", gap: 10 },
  metric: { flex: 1, minHeight: 74, borderRadius: 8, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#fce7f3", padding: 12, justifyContent: "center" },
  metricValue: { color: "#101828", fontSize: 24, fontWeight: "900" },
  metricLabel: { color: "#667085", marginTop: 2, fontSize: 12, fontWeight: "800", textTransform: "uppercase" },
  filters: { flexDirection: "row", gap: 8 },
  filterPill: { minHeight: 36, borderRadius: 18, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", paddingHorizontal: 13, alignItems: "center", justifyContent: "center" },
  filterPillActive: { borderColor: "#ec0e68", backgroundColor: "#ec0e68" },
  filterPillText: { color: "#667085", fontWeight: "900", fontSize: 12 },
  filterPillTextActive: { color: "#ffffff" },
  card: { gap: 12, padding: 14, backgroundColor: "#ffffff", borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", shadowColor: "#ec0e68", shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  visualRow: { flexDirection: "row", gap: 12 },
  thumbnail: { width: 74, height: 88, borderRadius: 8, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  thumbnailImage: { width: "100%", height: "100%" },
  cardMain: { flex: 1, minWidth: 0, gap: 8 },
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
  actionSheet: { backgroundColor: "#ffffff", padding: 20, paddingBottom: 32, gap: 4, borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  actionSheetHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  actionSheetHeading: { flex: 1, gap: 2 },
  actionSheetTitle: { color: "#101828", fontSize: 20, fontWeight: "900" },
  actionSheetSubtitle: { color: "#667085", fontSize: 12, fontWeight: "800", textTransform: "uppercase" },
  closeButton: { width: 40, height: 40, borderRadius: 8, borderWidth: 1, borderColor: "#d0d5dd", alignItems: "center", justifyContent: "center" },
  linkPreview: { gap: 6, borderRadius: 8, backgroundColor: "#fff7fb", borderWidth: 1, borderColor: "#fbcfe8", padding: 12, marginBottom: 6 },
  linkPreviewLabel: { color: "#ec0e68", fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  linkPreviewText: { color: "#101828", fontWeight: "800" },
  menuAction: { minHeight: 56, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: "#eaecf0" },
  menuActionText: { flex: 1, fontSize: 16, fontWeight: "900" },
  emptyState: { padding: 18, borderRadius: 8, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#fbcfe8", gap: 12, alignItems: "flex-start" },
  emptyIcon: { width: 54, height: 54, borderRadius: 8, backgroundColor: "#fff0f6", alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: "#101828", fontSize: 19, fontWeight: "900" },
  emptyCopy: { color: "#667085", lineHeight: 21 },
  primaryButton: { height: 48, borderRadius: 8, backgroundColor: "#ec0e68", alignItems: "center", justifyContent: "center", alignSelf: "stretch", flexDirection: "row", gap: 8 },
  primaryButtonText: { color: "#ffffff", fontWeight: "900" },
  toast: { position: "absolute", left: 20, right: 20, bottom: 96, minHeight: 48, borderRadius: 8, backgroundColor: "#ec0e68", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  toastText: { color: "#ffffff", fontWeight: "900" },
  error: { color: "#b42318", lineHeight: 20 }
});
