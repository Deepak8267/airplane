import { useState } from "react";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Experience } from "@airplane/shared";
import { Alert, FlatList, Image, Linking, Modal, Pressable, RefreshControl, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomNav } from "@/components/bottom-nav";
import { duplicateExperience, getExperienceForEditing, getMyExperiences, setExperienceArchived } from "@/features/experiences/experience-service";
import { useBuilderStore } from "@/stores/builder-store";
import { useAppTheme } from "@/stores/app-theme-store";

const FONT = {
  regular: "Poppins_400Regular",
  medium: "Poppins_500Medium",
  semibold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold"
};

export default function ExperiencesScreen() {
  const appTheme = useAppTheme();
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
    <SafeAreaView edges={["top"]} style={[styles.screen, { backgroundColor: appTheme.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.eyebrow, { color: appTheme.primary }]}>Library</Text>
          <Text style={[styles.title, { color: appTheme.text }]}>My experiences</Text>
        </View>
        <Link href="/home" asChild>
          <Pressable style={[styles.createButton, { backgroundColor: appTheme.primary, shadowColor: appTheme.primary }]}>
            <Ionicons color="#ffffff" name="add" size={18} />
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
              <FilterPill active={filter === "all"} label="All" onPress={() => setFilter("all")} />
              <FilterPill active={filter === "published"} label="Live" onPress={() => setFilter("published")} />
              <FilterPill active={filter === "draft"} label="Drafts" onPress={() => setFilter("draft")} />
              <FilterPill active={filter === "archived"} label="Archived" onPress={() => setFilter("archived")} />
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons color={appTheme.primary} name={experiencesQuery.isLoading ? "hourglass-outline" : "albums-outline"} size={21} />
            </View>
            <Text style={[styles.emptyTitle, { color: appTheme.text }]}>{experiencesQuery.isLoading ? "Loading experiences..." : filter === "all" ? "No experiences yet" : `No ${filter} experiences`}</Text>
            <Text style={[styles.emptyCopy, { color: appTheme.secondaryText }]}>
              {experiencesQuery.error instanceof Error ? experiencesQuery.error.message : "Create one from a template, then drafts and live links will appear here."}
            </Text>
            <Link href="/home" asChild>
              <Pressable style={[styles.primaryButton, { backgroundColor: appTheme.primary }]}>
                <Ionicons color="#ffffff" name="sparkles-outline" size={15} />
                <Text style={styles.primaryButtonText}>Choose template</Text>
              </Pressable>
            </Link>
          </View>
        }
        renderItem={({ item }) => {
          const isArchived = item.status === "archived";

          return (
            <View style={[styles.card, { backgroundColor: appTheme.surface, borderColor: appTheme.navBorder }]}>
              <View style={styles.visualRow}>
                <View style={[styles.thumbnail, { backgroundColor: item.theme.muted }]}>
                  {item.coverPhotoUrl ? (
                    <Image source={{ uri: item.coverPhotoUrl }} style={styles.thumbnailImage} />
                  ) : (
                    <Ionicons color={item.theme.accent} name={item.isPublished ? "paper-plane-outline" : "image-outline"} size={21} />
                  )}
                </View>
                <View style={styles.cardMain}>
              <View style={styles.cardHeader}>
                <Text numberOfLines={1} style={[styles.cardTitle, { color: appTheme.text }]}>{item.title}</Text>
                <Text style={[styles.status, item.isPublished ? styles.published : isArchived ? styles.archived : styles.draft]}>
                  {item.isPublished ? "published" : isArchived ? "archived" : "draft"}
                </Text>
              </View>
              <Text style={[styles.recipient, { color: appTheme.text }]}>{item.recipientName || "No recipient yet"}</Text>
              <Text style={[styles.message, { color: appTheme.secondaryText }]} numberOfLines={2}>
                {item.message || "No message yet"}
              </Text>
                </View>
              </View>
              <View style={styles.cardActions}>
                <Pressable
                  disabled={editMutation.isPending}
                  style={[styles.secondaryButton, { backgroundColor: appTheme.surface, borderColor: appTheme.navBorder }, editMutation.isPending && editMutation.variables === item.id ? styles.pendingButton : null]}
                  onPress={() => editMutation.mutate(item.id)}
                >
                  <Ionicons color={appTheme.text} name="create-outline" size={15} />
                  <Text adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1} style={[styles.secondaryButtonText, { color: appTheme.text }]}>
                    {editMutation.isPending && editMutation.variables === item.id ? "Opening..." : "Edit"}
                  </Text>
                </Pressable>
                {item.isPublished ? (
                  <Pressable
                    style={[styles.secondaryButton, { backgroundColor: appTheme.surface, borderColor: appTheme.navBorder }]}
                    onPress={() => openExperienceLink(item)}
                  >
                    <Ionicons color={appTheme.text} name="open-outline" size={15} />
                    <Text adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1} style={[styles.secondaryButtonText, { color: appTheme.text }]}>Open</Text>
                  </Pressable>
                ) : null}
                <Pressable style={[styles.iconButton, { backgroundColor: appTheme.surface, borderColor: appTheme.navBorder }]} accessibilityLabel="More experience actions" onPress={() => openActionMenu(item)}>
                  <Ionicons color={appTheme.text} name="ellipsis-horizontal" size={17} />
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
                <Ionicons color="#101828" name="close" size={18} />
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
          <Ionicons color="#ffffff" name="checkmark-circle-outline" size={15} />
          <Text style={styles.toastText}>Link copied</Text>
        </View>
      ) : null}
      <BottomNav active="library" />
    </SafeAreaView>
  );
}

function getExperienceLink(slug: string) {
  return `${process.env.EXPO_PUBLIC_WEB_URL ?? "https://airplane.app"}/e/${slug}`;
}

function Metric({ label, value }: { label: string; value: number }) {
  const appTheme = useAppTheme();

  return (
    <View style={[styles.metric, { backgroundColor: appTheme.surface, borderColor: appTheme.navBorder }]}>
      <Text style={[styles.metricValue, { color: appTheme.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: appTheme.secondaryText }]}>{label}</Text>
    </View>
  );
}

function FilterPill({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  const appTheme = useAppTheme();

  return (
    <Pressable style={[styles.filterPill, { backgroundColor: appTheme.surface, borderColor: appTheme.border }, active ? { backgroundColor: appTheme.primary, borderColor: appTheme.primary } : null]} onPress={onPress}>
      <Text style={[styles.filterPillText, { color: active ? "#ffffff" : appTheme.secondaryText }]}>{label}</Text>
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
      <Ionicons color={color} name={icon} size={17} />
      <Text style={[styles.menuActionText, { color }]}>{label}</Text>
      <Ionicons color="#98a2b3" name="chevron-forward" size={17} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 14, paddingTop: 4, backgroundColor: "#ffffff" },
  header: { minHeight: 54, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  eyebrow: { color: "#ec0e68", fontFamily: FONT.semibold, fontSize: 10, lineHeight: 13, textTransform: "uppercase" },
  title: { color: "#101828", fontFamily: FONT.bold, fontSize: 22, lineHeight: 25 },
  createButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#ec0e68", alignItems: "center", justifyContent: "center", shadowColor: "#ec0e68", shadowOpacity: 0.14, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  list: { gap: 12, paddingTop: 0, paddingBottom: 88 },
  listHeader: { gap: 10 },
  statsGrid: { flexDirection: "row", gap: 8 },
  metric: { flex: 1, minHeight: 54, borderRadius: 14, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#f3f4f6", padding: 9, justifyContent: "center" },
  metricValue: { color: "#101828", fontFamily: FONT.bold, fontSize: 17, lineHeight: 21 },
  metricLabel: { color: "#667085", marginTop: 1, fontFamily: FONT.medium, fontSize: 9, lineHeight: 12, textTransform: "uppercase" },
  filters: { gap: 6, paddingRight: 2 },
  filterPill: { minHeight: 30, borderRadius: 15, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", paddingHorizontal: 10, alignItems: "center", justifyContent: "center" },
  filterPillActive: { borderColor: "#ec0e68", backgroundColor: "#ec0e68" },
  filterPillText: { color: "#667085", fontFamily: FONT.semibold, fontSize: 10 },
  filterPillTextActive: { color: "#ffffff" },
  card: { gap: 8, padding: 10, backgroundColor: "#ffffff", borderRadius: 14, borderWidth: 1, borderColor: "#f3f4f6", shadowColor: "#111827", shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  visualRow: { flexDirection: "row", gap: 8 },
  thumbnail: { width: 58, height: 70, borderRadius: 11, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  thumbnailImage: { width: "100%", height: "100%" },
  cardMain: { flex: 1, minWidth: 0, gap: 4 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 6, minWidth: 0 },
  cardTitle: { flex: 1, color: "#101828", fontFamily: FONT.semibold, fontSize: 13, lineHeight: 17 },
  status: { overflow: "hidden", borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3, fontFamily: FONT.semibold, fontSize: 8, textTransform: "uppercase", flexShrink: 0 },
  published: { color: "#067647", backgroundColor: "#dcfae6" },
  draft: { color: "#b54708", backgroundColor: "#fef0c7" },
  archived: { color: "#475467", backgroundColor: "#eaecf0" },
  recipient: { color: "#344054", fontFamily: FONT.medium, fontSize: 10, lineHeight: 13 },
  message: { color: "#667085", fontFamily: FONT.regular, fontSize: 10, lineHeight: 14 },
  cardActions: { flexDirection: "row", gap: 6 },
  secondaryButton: { flex: 1, height: 34, borderRadius: 11, borderWidth: 1, borderColor: "#d0d5dd", flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center" },
  pendingButton: { opacity: 0.65 },
  secondaryButtonText: { color: "#101828", fontFamily: FONT.semibold, fontSize: 11, minWidth: 0 },
  iconButton: { width: 34, height: 34, borderRadius: 11, borderWidth: 1, borderColor: "#d0d5dd", alignItems: "center", justifyContent: "center" },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(16, 24, 40, 0.45)" },
  actionSheet: { backgroundColor: "#ffffff", padding: 14, paddingBottom: 24, gap: 3, borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  actionSheetHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  actionSheetHeading: { flex: 1, gap: 2 },
  actionSheetTitle: { color: "#101828", fontFamily: FONT.semibold, fontSize: 16, lineHeight: 21 },
  actionSheetSubtitle: { color: "#667085", fontFamily: FONT.medium, fontSize: 10, lineHeight: 13, textTransform: "uppercase" },
  closeButton: { width: 34, height: 34, borderRadius: 11, borderWidth: 1, borderColor: "#d0d5dd", alignItems: "center", justifyContent: "center" },
  linkPreview: { gap: 4, borderRadius: 12, backgroundColor: "#fff7fb", borderWidth: 1, borderColor: "#fbcfe8", padding: 10, marginBottom: 4 },
  linkPreviewLabel: { color: "#ec0e68", fontFamily: FONT.semibold, fontSize: 9, lineHeight: 12, textTransform: "uppercase" },
  linkPreviewText: { color: "#101828", fontFamily: FONT.medium, fontSize: 11 },
  menuAction: { minHeight: 46, flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: 1, borderBottomColor: "#eaecf0" },
  menuActionText: { flex: 1, fontFamily: FONT.semibold, fontSize: 13 },
  emptyState: { padding: 14, borderRadius: 14, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#f3f4f6", gap: 9, alignItems: "flex-start" },
  emptyIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#fff0f6", alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: "#101828", fontFamily: FONT.semibold, fontSize: 14, lineHeight: 18 },
  emptyCopy: { color: "#667085", fontFamily: FONT.regular, fontSize: 11, lineHeight: 16 },
  primaryButton: { height: 38, borderRadius: 13, backgroundColor: "#ec0e68", alignItems: "center", justifyContent: "center", alignSelf: "stretch", flexDirection: "row", gap: 7 },
  primaryButtonText: { color: "#ffffff", fontFamily: FONT.semibold, fontSize: 12 },
  toast: { position: "absolute", left: 14, right: 14, bottom: 84, minHeight: 42, borderRadius: 14, backgroundColor: "#ec0e68", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  toastText: { color: "#ffffff", fontFamily: FONT.semibold, fontSize: 12 },
  error: { color: "#b42318", fontFamily: FONT.regular, lineHeight: 18 }
});
