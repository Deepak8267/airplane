import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FLOW_SIZE, MOBILE_FONT } from "@/design/tokens";
import { getCreatorNotifications, markAllNotificationsRead } from "@/features/notifications/notification-service";
import type { CreatorNotification, CreatorNotificationType } from "@/features/notifications/notification-service";
import { useAppTheme } from "@/stores/app-theme-store";

export default function NotificationsScreen() {
  const appTheme = useAppTheme();
  const queryClient = useQueryClient();
  const notificationsQuery = useQuery({
    queryKey: ["creator-notifications"],
    queryFn: getCreatorNotifications
  });
  const notifications = notificationsQuery.data?.notifications ?? [];
  const unreadCount = notificationsQuery.data?.unreadCount ?? 0;
  const markReadMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(notifications),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["creator-notifications"] })
  });

  return (
    <SafeAreaView edges={["top"]} style={[styles.screen, { backgroundColor: appTheme.background }]}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={notificationsQuery.isRefetching} onRefresh={() => notificationsQuery.refetch()} />}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={[styles.eyebrow, { color: appTheme.primary }]}>Creator center</Text>
              <Text numberOfLines={1} style={[styles.title, { color: appTheme.text }]}>Notifications</Text>
              <Text style={[styles.subtitle, { color: appTheme.secondaryText }]}>
                {unreadCount > 0 ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}` : "You are all caught up"}
              </Text>
            </View>
            <Pressable accessibilityLabel="Close notifications" style={[styles.closeButton, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]} onPress={() => router.back()}>
              <Ionicons color={appTheme.text} name="close" size={21} />
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          <View style={[styles.emptyCard, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]}>
            <View style={[styles.emptyIcon, { backgroundColor: appTheme.muted }]}>
              <Ionicons color={appTheme.primary} name={notificationsQuery.isLoading ? "hourglass-outline" : "notifications-outline"} size={24} />
            </View>
            <Text style={[styles.emptyTitle, { color: appTheme.text }]}>{notificationsQuery.isLoading ? "Loading updates" : "No notifications yet"}</Text>
            <Text style={[styles.emptyCopy, { color: appTheme.secondaryText }]}>Experience activity, draft reminders, and plan updates will appear here.</Text>
          </View>
        }
        ListFooterComponent={
          notifications.length > 0 ? (
            <Pressable
              disabled={markReadMutation.isPending || unreadCount === 0}
              style={[styles.markReadButton, { backgroundColor: appTheme.surface, borderColor: appTheme.border, opacity: unreadCount === 0 ? 0.55 : 1 }]}
              onPress={() => markReadMutation.mutate()}
            >
              <Ionicons color={appTheme.primary} name="checkmark-done-outline" size={18} />
              <Text style={[styles.markReadText, { color: appTheme.primary }]}>{markReadMutation.isPending ? "Updating..." : "Mark all as read"}</Text>
            </Pressable>
          ) : null
        }
        renderItem={({ item }) => <NotificationCard notification={item} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function NotificationCard({ notification }: { notification: CreatorNotification }) {
  const appTheme = useAppTheme();
  const icon = getNotificationIcon(notification.type);

  return (
    <Pressable
      style={[styles.card, { backgroundColor: appTheme.surface, borderColor: notification.unread ? appTheme.primaryLight : appTheme.border }]}
      onPress={() => router.push(notification.route as never)}
    >
      <View style={[styles.iconWrap, { backgroundColor: icon.background }]}>
        <Ionicons color={icon.color} name={icon.name} size={19} />
      </View>
      <View style={styles.cardCopy}>
        <View style={styles.cardTitleRow}>
          <Text numberOfLines={1} style={[styles.cardTitle, { color: appTheme.text }]}>{notification.title}</Text>
          {notification.unread ? <View style={[styles.unreadDot, { backgroundColor: appTheme.primary }]} /> : null}
        </View>
        <Text numberOfLines={2} style={[styles.cardBody, { color: appTheme.secondaryText }]}>{notification.body}</Text>
        <View style={styles.cardMetaRow}>
          <Text style={[styles.cardTime, { color: appTheme.mutedText }]}>{formatRelativeTime(notification.createdAt)}</Text>
          <View style={styles.actionLabel}>
            <Text style={[styles.actionText, { color: appTheme.primary }]}>{notification.actionLabel}</Text>
            <Ionicons color={appTheme.primary} name="chevron-forward" size={13} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function getNotificationIcon(type: CreatorNotificationType): { background: string; color: string; name: keyof typeof Ionicons.glyphMap } {
  if (type === "plan") {
    return { background: "#FEF3C7", color: "#B45309", name: "card-outline" };
  }

  if (type === "activity") {
    return { background: "#E0F2FE", color: "#0369A1", name: "pulse-outline" };
  }

  if (type === "publish") {
    return { background: "#DCFCE7", color: "#15803D", name: "paper-plane-outline" };
  }

  if (type === "draft") {
    return { background: "#F3E8FF", color: "#7E22CE", name: "create-outline" };
  }

  return { background: "#FCE7F3", color: "#BE185D", name: "sparkles-outline" };
}

function formatRelativeTime(value: string) {
  const timestamp = Date.parse(value);

  if (!Number.isFinite(timestamp)) {
    return "Just now";
  }

  const diffMs = Date.now() - timestamp;
  const minutes = Math.max(0, Math.floor(diffMs / 60000));

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { gap: 12, padding: FLOW_SIZE.screenPadding, paddingBottom: 28 },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12, paddingBottom: 4 },
  headerCopy: { flex: 1, minWidth: 0, gap: 3 },
  eyebrow: { fontFamily: MOBILE_FONT.semibold, fontSize: FLOW_SIZE.caption, lineHeight: FLOW_SIZE.captionLine, textTransform: "uppercase" },
  title: { fontFamily: MOBILE_FONT.bold, fontSize: FLOW_SIZE.headerTitle, lineHeight: FLOW_SIZE.headerTitleLine },
  subtitle: { fontFamily: MOBILE_FONT.regular, fontSize: FLOW_SIZE.body, lineHeight: FLOW_SIZE.bodyLine },
  closeButton: { width: 40, height: 40, borderRadius: 16, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  emptyCard: { minHeight: 190, borderRadius: FLOW_SIZE.cardRadius, borderWidth: 1, alignItems: "center", justifyContent: "center", padding: 18, gap: 10 },
  emptyIcon: { width: 48, height: 48, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontFamily: MOBILE_FONT.semibold, fontSize: FLOW_SIZE.sectionTitle },
  emptyCopy: { fontFamily: MOBILE_FONT.regular, fontSize: FLOW_SIZE.body, lineHeight: FLOW_SIZE.bodyLine, textAlign: "center" },
  card: { minHeight: 104, borderRadius: FLOW_SIZE.cardRadius, borderWidth: 1, padding: 12, flexDirection: "row", gap: 11, shadowColor: "#101828", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 1 },
  iconWrap: { width: 40, height: 40, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  cardCopy: { flex: 1, minWidth: 0, gap: 5 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { flex: 1, minWidth: 0, fontFamily: MOBILE_FONT.semibold, fontSize: FLOW_SIZE.sectionTitle, lineHeight: 18 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  cardBody: { fontFamily: MOBILE_FONT.regular, fontSize: FLOW_SIZE.body, lineHeight: FLOW_SIZE.bodyLine },
  cardMetaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, paddingTop: 2 },
  cardTime: { fontFamily: MOBILE_FONT.medium, fontSize: FLOW_SIZE.caption, lineHeight: FLOW_SIZE.captionLine },
  actionLabel: { flexDirection: "row", alignItems: "center", gap: 2 },
  actionText: { fontFamily: MOBILE_FONT.semibold, fontSize: FLOW_SIZE.caption, lineHeight: FLOW_SIZE.captionLine },
  markReadButton: { height: FLOW_SIZE.buttonHeight, borderRadius: FLOW_SIZE.compactRadius, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 2 },
  markReadText: { fontFamily: MOBILE_FONT.semibold, fontSize: 13 }
});
