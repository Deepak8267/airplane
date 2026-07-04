import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { memo, useEffect, useMemo, useRef } from "react";
import { Animated, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { UserProfile } from "@airplane/shared";
import { BottomNav } from "@/components/bottom-nav";
import { useSignOut } from "@/features/auth/use-sign-out";
import { getMyProfile } from "@/features/profile/profile-service";
import { useSessionStore } from "@/stores/session-store";

const COLORS = {
  primary: "#FF3D81",
  background: "#FFFFFF",
  text: "#111827",
  secondary: "#6B7280",
  border: "#F3F4F6",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444"
};

const FONT = {
  regular: "Poppins_400Regular",
  medium: "Poppins_500Medium",
  semibold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold"
};

const STATS = [
  { icon: "briefcase", iconColor: COLORS.primary, tone: "#FFEAF3", label: "Experiences", value: "18" },
  { icon: "eye", iconColor: "#8B5CF6", tone: "#F0E7FF", label: "Total Views", value: "12.4K" },
  { icon: "heart", iconColor: COLORS.primary, tone: "#FFEAF3", label: "Reactions", value: "892" },
  { icon: "arrow-redo", iconColor: "#8B5CF6", tone: "#F0E7FF", label: "Shares", value: "248" }
] satisfies Array<{
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  tone: string;
  value: string;
}>;

const MENU_ITEMS = [
  { icon: "person-outline", iconColor: COLORS.primary, tone: "#FFEAF3", title: "Account Settings", subtitle: "Edit your personal information", route: "/settings" },
  { icon: "star-outline", iconColor: COLORS.warning, tone: "#FFF7DF", title: "Subscription", subtitle: "Manage your plan and billing", route: "/subscription" },
  { icon: "gift-outline", iconColor: "#16A34A", tone: "#E8F8EF", title: "My Templates", subtitle: "Your favorite and saved templates", route: "/templates" },
  { icon: "download-outline", iconColor: "#228BE6", tone: "#EAF4FF", title: "Downloads", subtitle: "Access your downloaded assets", route: "/experiences" },
  { icon: "shield-checkmark-outline", iconColor: "#7C3AED", tone: "#F2EAFF", title: "Privacy & Security", subtitle: "Manage privacy and security settings", route: "/settings" },
  { icon: "help-circle-outline", iconColor: "#F04438", tone: "#FFF0EA", title: "Help & Support", subtitle: "Get help and contact support", route: "/help" },
  { icon: "information-circle-outline", iconColor: "#475467", tone: "#F2F4F7", title: "About Airplane", subtitle: "Version 1.2.0", route: "/themes" }
] satisfies Array<{
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  route: string;
  subtitle: string;
  title: string;
  tone: string;
}>;

export default function ProfileScreen() {
  const session = useSessionStore((state) => state.session);
  const signOutMutation = useSignOut();
  const profileQuery = useQuery({
    queryKey: ["my-profile"],
    queryFn: getMyProfile
  });
  const entrance = useRef(new Animated.Value(0)).current;
  const profile = profileQuery.data;
  const displayName = profile?.fullName?.trim() || session?.user.user_metadata?.full_name || "Riya Sharma";
  const displayEmail = profile?.email || session?.user.email || "riya.sharma@email.com";
  const displayPhone = "+91 98765 43210";
  const initials = useMemo(() => getInitials(displayName), [displayName]);

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, [entrance]);

  return (
    <SafeAreaView edges={["top"]} style={styles.shell}>
      <Animated.View
        style={[
          styles.animatedContent,
          {
            opacity: entrance,
            transform: [
              {
                translateY: entrance.interpolate({
                  inputRange: [0, 1],
                  outputRange: [14, 0]
                })
              }
            ]
          }
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.screen}
          refreshControl={<RefreshControl refreshing={profileQuery.isRefetching} onRefresh={() => profileQuery.refetch()} />}
          showsVerticalScrollIndicator={false}
        >
          <ProfileHeader />
          <ProfileCard email={displayEmail} initials={initials} name={displayName} phone={displayPhone} profile={profile} />
          <PremiumBanner />
          <MenuCard />
          {profileQuery.error instanceof Error ? <Text style={styles.errorText}>{profileQuery.error.message}</Text> : null}
          <LogoutButton isPending={signOutMutation.isPending} onPress={() => signOutMutation.mutate()} />
        </ScrollView>
      </Animated.View>
      <BottomNav active="profile" />
    </SafeAreaView>
  );
}

const ProfileHeader = memo(function ProfileHeader() {
  return (
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        <Text adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1} style={styles.pageTitle}>Profile</Text>
        <Text numberOfLines={2} style={styles.pageSubtitle}>Manage your account and preferences</Text>
      </View>
      <View style={styles.headerActions}>
        <IconButton dot icon="notifications-outline" onPress={() => undefined} />
        <IconButton icon="settings-outline" onPress={() => router.push("/settings" as never)} />
      </View>
    </View>
  );
});

const ProfileCard = memo(function ProfileCard({
  email,
  initials,
  name,
  phone,
  profile
}: {
  email: string;
  initials: string;
  name: string;
  phone: string;
  profile: UserProfile | undefined;
}) {
  return (
    <View style={styles.profileCard}>
      <View style={styles.profileTop}>
        <View style={styles.avatarWrap}>
          {profile?.avatarUrl ? (
            <Image resizeMode="cover" source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <LinearGradient colors={["#FCE7F3", "#F9A8D4"]} style={styles.avatarImage}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </LinearGradient>
          )}
          <View style={styles.cameraBadge}>
            <Ionicons color="#FFFFFF" name="camera" size={12} />
          </View>
        </View>

        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text numberOfLines={1} style={styles.userName}>
              {name}
            </Text>
            <View style={styles.proBadge}>
              <Ionicons color={COLORS.primary} name="diamond" size={14} />
              <Text style={styles.proBadgeText}>Pro</Text>
            </View>
          </View>
          <Text numberOfLines={1} style={styles.profileBio}>
            Create beautiful experiences, share love
          </Text>
          <ContactLine icon="mail-outline" text={email} />
          <ContactLine icon="call-outline" text={phone} />
        </View>

        <Ionicons color="#111827" name="chevron-forward" size={18} />
      </View>

      <View style={styles.cardDivider} />
      <StatsRow />
    </View>
  );
});

const StatsRow = memo(function StatsRow() {
  return (
    <View style={styles.statsRow}>
      {STATS.map((stat, index) => (
        <View key={stat.label} style={styles.statColumn}>
          {index > 0 ? <View style={styles.statDivider} /> : null}
          <View style={[styles.statIcon, { backgroundColor: stat.tone }]}>
            <Ionicons color={stat.iconColor} name={stat.icon} size={16} />
          </View>
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text numberOfLines={1} style={styles.statLabel}>
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
});

const PremiumBanner = memo(function PremiumBanner() {
  return (
    <LinearGradient colors={["#FFF7FA", "#FFFFFF"]} end={{ x: 1, y: 0 }} start={{ x: 0, y: 0 }} style={styles.premiumBanner}>
      <View style={styles.premiumIcon}>
        <Ionicons color={COLORS.warning} name="diamond" size={20} />
      </View>
      <View style={styles.premiumCopy}>
          <Text adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1} style={styles.premiumTitle}>You're on Pro Plan</Text>
        <Text numberOfLines={2} style={styles.premiumSubtitle}>
          Enjoy unlimited creativity and premium features.
        </Text>
      </View>
      <Pressable style={({ pressed }) => [styles.manageButton, pressed ? styles.pressed : null]} onPress={() => router.push("/subscription" as never)}>
        <Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={styles.manageButtonText}>Manage Plan</Text>
      </Pressable>
    </LinearGradient>
  );
});

const MenuCard = memo(function MenuCard() {
  return (
    <View style={styles.menuCard}>
      {MENU_ITEMS.map((item, index) => (
        <MenuItem
          icon={item.icon}
          iconColor={item.iconColor}
          isLast={index === MENU_ITEMS.length - 1}
          key={item.title}
          onPress={() => router.push(item.route as never)}
          subtitle={item.subtitle}
          title={item.title}
          tone={item.tone}
        />
      ))}
    </View>
  );
});

function MenuItem({
  icon,
  iconColor,
  isLast,
  onPress,
  subtitle,
  title,
  tone
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  isLast: boolean;
  onPress: () => void;
  subtitle: string;
  title: string;
  tone: string;
}) {
  return (
    <Pressable style={({ pressed }) => [styles.menuItem, pressed ? styles.pressed : null]} onPress={onPress}>
      <View style={[styles.menuIcon, { backgroundColor: tone }]}>
        <Ionicons color={iconColor} name={icon} size={18} />
      </View>
      <View style={[styles.menuCopy, isLast ? styles.menuCopyLast : null]}>
        <View style={styles.menuTextBlock}>
          <Text numberOfLines={1} style={styles.menuTitle}>{title}</Text>
          <Text numberOfLines={1} style={styles.menuSubtitle}>
            {subtitle}
          </Text>
        </View>
        <Ionicons color="#475467" name="chevron-forward" size={18} />
      </View>
    </Pressable>
  );
}

function ContactLine({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.contactLine}>
      <Ionicons color="#667085" name={icon} size={14} />
      <Text numberOfLines={1} style={styles.contactText}>
        {text}
      </Text>
    </View>
  );
}

function IconButton({ dot, icon, onPress }: { dot?: boolean; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" style={({ pressed }) => [styles.iconButton, pressed ? styles.pressed : null]} onPress={onPress}>
      <Ionicons color="#111827" name={icon} size={20} />
      {dot ? <View style={styles.notificationDot} /> : null}
    </Pressable>
  );
}

function LogoutButton({ isPending, onPress }: { isPending: boolean; onPress: () => void }) {
  return (
    <Pressable disabled={isPending} style={({ pressed }) => [styles.logoutCard, pressed ? styles.pressed : null, isPending ? styles.disabled : null]} onPress={onPress}>
      <Ionicons color={COLORS.danger} name="log-out-outline" size={18} />
      <Text style={styles.logoutText}>{isPending ? "Logging out..." : "Log Out"}</Text>
    </Pressable>
  );
}

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "A";
  const second = parts.length > 1 ? parts[1]?.[0] : parts[0]?.[1];
  return `${first}${second ?? ""}`.toUpperCase();
}

const softShadow = {
  shadowColor: COLORS.text,
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2
};

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: COLORS.background },
  animatedContent: { flex: 1 },
  screen: { gap: 12, paddingHorizontal: 14, paddingTop: 4, paddingBottom: 88 },
  header: { minHeight: 54, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  headerCopy: { flex: 1, minWidth: 0, gap: 2 },
  pageTitle: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 22, lineHeight: 25 },
  pageSubtitle: { color: COLORS.secondary, fontFamily: FONT.medium, fontSize: 10, lineHeight: 13 },
  headerActions: { flexShrink: 0, flexDirection: "row", alignItems: "center", gap: 6, paddingTop: 0 },
  iconButton: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  notificationDot: { position: "absolute", right: 4, top: 4, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  profileCard: { borderRadius: 16, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, padding: 12, ...softShadow },
  profileTop: { minHeight: 92, flexDirection: "row", alignItems: "center", gap: 10 },
  avatarWrap: { width: 68, height: 68 },
  avatarImage: { width: 68, height: 68, borderRadius: 34, alignItems: "center", justifyContent: "center" },
  avatarInitials: { color: "#FFFFFF", fontFamily: FONT.bold, fontSize: 22, lineHeight: 26 },
  cameraBadge: { position: "absolute", right: -2, bottom: 1, width: 26, height: 26, borderRadius: 13, borderWidth: 3, borderColor: COLORS.background, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center" },
  profileInfo: { flex: 1, minWidth: 0, gap: 4 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  userName: { flexShrink: 1, color: COLORS.text, fontFamily: FONT.bold, fontSize: 16, lineHeight: 21 },
  proBadge: { height: 24, borderRadius: 12, backgroundColor: "#FFE8F2", flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, flexShrink: 0 },
  proBadgeText: { color: COLORS.primary, fontFamily: FONT.semibold, fontSize: 11 },
  profileBio: { color: COLORS.secondary, fontFamily: FONT.regular, fontSize: 11, lineHeight: 15 },
  contactLine: { flexDirection: "row", alignItems: "center", gap: 7 },
  contactText: { flex: 1, color: COLORS.secondary, fontFamily: FONT.medium, fontSize: 11, lineHeight: 15 },
  cardDivider: { height: 1, backgroundColor: COLORS.border, marginTop: 10, marginBottom: 8 },
  statsRow: { height: 78, flexDirection: "row", alignItems: "stretch" },
  statColumn: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4 },
  statDivider: { position: "absolute", left: 0, top: 8, bottom: 8, width: 1, backgroundColor: COLORS.border },
  statIcon: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: { color: COLORS.text, fontFamily: FONT.bold, fontSize: 17, lineHeight: 21 },
  statLabel: { color: COLORS.secondary, fontFamily: FONT.medium, fontSize: 9, lineHeight: 12 },
  premiumBanner: { minHeight: 64, borderRadius: 14, borderWidth: 1, borderColor: "#FFD4E5", flexDirection: "row", alignItems: "center", gap: 8, padding: 12, ...softShadow },
  premiumIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.background, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  premiumCopy: { flex: 1, minWidth: 0, gap: 2 },
  premiumTitle: { color: COLORS.text, fontFamily: FONT.semibold, fontSize: 12, lineHeight: 16 },
  premiumSubtitle: { color: COLORS.secondary, fontFamily: FONT.regular, fontSize: 10, lineHeight: 13 },
  manageButton: { width: 92, height: 32, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center", paddingHorizontal: 8, flexShrink: 0 },
  manageButtonText: { color: "#FFFFFF", fontFamily: FONT.semibold, fontSize: 10 },
  menuCard: { borderRadius: 16, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, overflow: "hidden", ...softShadow },
  menuItem: { height: 58, flexDirection: "row", alignItems: "center", gap: 10, paddingLeft: 12 },
  menuIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  menuCopy: { flex: 1, height: "100%", borderBottomWidth: 1, borderBottomColor: COLORS.border, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, paddingRight: 12 },
  menuCopyLast: { borderBottomWidth: 0 },
  menuTextBlock: { flex: 1, minWidth: 0, gap: 2 },
  menuTitle: { color: COLORS.text, fontFamily: FONT.semibold, fontSize: 13, lineHeight: 17 },
  menuSubtitle: { color: COLORS.secondary, fontFamily: FONT.regular, fontSize: 10, lineHeight: 13 },
  logoutCard: { height: 52, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, ...softShadow },
  logoutText: { color: COLORS.danger, fontFamily: FONT.semibold, fontSize: 13, lineHeight: 17 },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.92 },
  disabled: { opacity: 0.6 },
  errorText: { color: COLORS.danger, fontFamily: FONT.medium, fontSize: 12, lineHeight: 18, textAlign: "center" }
});
