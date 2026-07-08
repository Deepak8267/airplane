import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Image, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { UserProfile } from "@airplane/shared";
import { BottomNav } from "@/components/bottom-nav";
import { getAnalyticsDashboard } from "@/features/analytics/analytics-service";
import { useSignOut } from "@/features/auth/use-sign-out";
import { getMyProfile, updateMyProfile } from "@/features/profile/profile-service";
import { getPlanUsage } from "@/features/subscriptions/subscription-service";
import { useAppTheme } from "@/stores/app-theme-store";
import { useSessionStore } from "@/stores/session-store";

const FONT = {
  regular: "Poppins_400Regular",
  medium: "Poppins_500Medium",
  semibold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold"
};

type ProfileStat = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

const MENU_ITEMS = [
  { icon: "person-outline", title: "Account Settings", subtitle: "Edit your personal information", route: "/settings" },
  { icon: "star-outline", title: "Subscription", subtitle: "Manage your plan and billing", route: "/subscription" },
  { icon: "gift-outline", title: "My Templates", subtitle: "Your favorite and saved templates", route: "/templates" },
  { icon: "download-outline", title: "Downloads", subtitle: "Access your downloaded assets", route: "/experiences" },
  { icon: "shield-checkmark-outline", title: "Privacy & Security", subtitle: "Manage privacy and security settings", route: "/settings" },
  { icon: "help-circle-outline", title: "Help & Support", subtitle: "Get help and contact support", route: "/help" },
  { icon: "information-circle-outline", title: "About Airplane", subtitle: "Version 1.2.0", route: "/themes" }
] satisfies Array<{
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  subtitle: string;
  title: string;
}>;

export default function ProfileScreen() {
  const session = useSessionStore((state) => state.session);
  const appTheme = useAppTheme();
  const queryClient = useQueryClient();
  const [editorVisible, setEditorVisible] = useState(false);
  const signOutMutation = useSignOut();
  const profileQuery = useQuery({
    queryKey: ["my-profile"],
    queryFn: getMyProfile,
    enabled: Boolean(session)
  });
  const planUsageQuery = useQuery({
    queryKey: ["plan-usage"],
    queryFn: getPlanUsage,
    enabled: Boolean(session)
  });
  const analyticsQuery = useQuery({
    queryKey: ["analytics-dashboard"],
    queryFn: getAnalyticsDashboard,
    enabled: Boolean(session)
  });
  const entrance = useRef(new Animated.Value(0)).current;
  const profile = profileQuery.data;
  const displayName = profile?.fullName?.trim() || session?.user.user_metadata?.full_name || session?.user.email?.split("@")[0] || "Airplane Creator";
  const displayEmail = profile?.email || session?.user.email || "Email not added";
  const displayPhone = profile?.phone || "";
  const initials = useMemo(() => getInitials(displayName), [displayName]);
  const stats = useMemo(
    () => getProfileStats(planUsageQuery.data?.activeExperienceCount ?? 0, analyticsQuery.data?.totals.views ?? 0, analyticsQuery.data?.totals.completions ?? 0, analyticsQuery.data?.totals.uniqueVisitors ?? 0),
    [analyticsQuery.data?.totals.completions, analyticsQuery.data?.totals.uniqueVisitors, analyticsQuery.data?.totals.views, planUsageQuery.data?.activeExperienceCount]
  );
  const profileMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(["my-profile"], updatedProfile);
      setEditorVisible(false);
    }
  });

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, [entrance]);

  return (
    <SafeAreaView edges={["top"]} style={[styles.shell, { backgroundColor: appTheme.background }]}>
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
          contentContainerStyle={[styles.screen, { backgroundColor: appTheme.background }]}
          refreshControl={<RefreshControl refreshing={profileQuery.isRefetching} onRefresh={() => profileQuery.refetch()} />}
          showsVerticalScrollIndicator={false}
        >
          <ProfileHeader />
          <ProfileCard email={displayEmail} initials={initials} name={displayName} phone={displayPhone || "Phone not added"} plan={planUsageQuery.data?.plan ?? "free"} profile={profile} stats={stats} onEdit={() => setEditorVisible(true)} />
          <PremiumBanner activeCount={planUsageQuery.data?.activeExperienceCount ?? 0} freeLimit={planUsageQuery.data?.freeExperienceLimit ?? 3} plan={planUsageQuery.data?.plan ?? "free"} />
          <MenuCard onEditProfile={() => setEditorVisible(true)} />
          {profileQuery.error instanceof Error ? <Text style={[styles.errorText, { color: appTheme.danger }]}>{profileQuery.error.message}</Text> : null}
          <LogoutButton isPending={signOutMutation.isPending} onPress={() => signOutMutation.mutate()} />
        </ScrollView>
      </Animated.View>
      <ProfileEditor
        email={displayEmail}
        error={profileMutation.error instanceof Error ? profileMutation.error.message : null}
        fullName={displayName}
        isPending={profileMutation.isPending}
        phone={displayPhone}
        visible={editorVisible}
        onClose={() => setEditorVisible(false)}
        onSave={(input) => profileMutation.mutate(input)}
      />
      <BottomNav active="profile" />
    </SafeAreaView>
  );
}

const ProfileHeader = memo(function ProfileHeader() {
  const appTheme = useAppTheme();

  return (
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        <Text adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1} style={[styles.pageTitle, { color: appTheme.text }]}>Profile</Text>
        <Text numberOfLines={2} style={[styles.pageSubtitle, { color: appTheme.secondaryText }]}>Manage your account and preferences</Text>
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
  onEdit,
  phone,
  plan,
  profile,
  stats
}: {
  email: string;
  initials: string;
  name: string;
  onEdit: () => void;
  phone: string;
  plan: "free" | "pro";
  profile: UserProfile | undefined;
  stats: ProfileStat[];
}) {
  const appTheme = useAppTheme();

  return (
    <Pressable style={[styles.profileCard, { backgroundColor: appTheme.surface, borderColor: appTheme.navBorder }]} onPress={onEdit}>
      <View style={styles.profileTop}>
        <View style={styles.avatarWrap}>
          {profile?.avatarUrl ? (
            <Image resizeMode="cover" source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <LinearGradient colors={[appTheme.primaryLight, appTheme.accent]} style={styles.avatarImage}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </LinearGradient>
          )}
          <View style={[styles.cameraBadge, { backgroundColor: appTheme.primary, borderColor: appTheme.surface }]}>
            <Ionicons color="#FFFFFF" name="camera" size={12} />
          </View>
        </View>

        <View style={styles.profileInfo}>
          <View style={styles.nameRow}>
            <Text numberOfLines={1} style={styles.userName}>
              {name}
            </Text>
            <View style={[styles.proBadge, { backgroundColor: appTheme.surfaceAlt }]}>
              <Ionicons color={appTheme.primary} name={plan === "pro" ? "diamond" : "leaf-outline"} size={14} />
              <Text style={[styles.proBadgeText, { color: appTheme.primary }]}>{plan === "pro" ? "Pro" : "Free"}</Text>
            </View>
          </View>
          <Text numberOfLines={1} style={[styles.profileBio, { color: appTheme.secondaryText }]}>
            Create beautiful experiences, share love
          </Text>
          <ContactLine icon="mail-outline" text={email} />
          <ContactLine icon="call-outline" text={phone} />
        </View>

        <Ionicons color={appTheme.text} name="chevron-forward" size={18} />
      </View>

      <View style={[styles.cardDivider, { backgroundColor: appTheme.navBorder }]} />
      <StatsRow stats={stats} />
    </Pressable>
  );
});

const StatsRow = memo(function StatsRow({ stats }: { stats: ProfileStat[] }) {
  const appTheme = useAppTheme();

  return (
    <View style={styles.statsRow}>
      {stats.map((stat, index) => (
        <View key={stat.label} style={styles.statColumn}>
          {index > 0 ? <View style={[styles.statDivider, { backgroundColor: appTheme.navBorder }]} /> : null}
          <View style={[styles.statIcon, { backgroundColor: appTheme.muted }]}>
            <Ionicons color={appTheme.primary} name={stat.icon} size={16} />
          </View>
          <Text style={[styles.statValue, { color: appTheme.text }]}>{stat.value}</Text>
          <Text numberOfLines={1} style={[styles.statLabel, { color: appTheme.secondaryText }]}>
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
});

const PremiumBanner = memo(function PremiumBanner({ activeCount, freeLimit, plan }: { activeCount: number; freeLimit: number; plan: "free" | "pro" }) {
  const appTheme = useAppTheme();
  const isPro = plan === "pro";

  return (
    <LinearGradient colors={[appTheme.surfaceAlt, appTheme.surface]} end={{ x: 1, y: 0 }} start={{ x: 0, y: 0 }} style={[styles.premiumBanner, { borderColor: appTheme.border }]}>
      <View style={[styles.premiumIcon, { backgroundColor: appTheme.surface }]}>
        <Ionicons color={appTheme.accent} name={isPro ? "diamond" : "sparkles-outline"} size={20} />
      </View>
      <View style={styles.premiumCopy}>
          <Text adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1} style={[styles.premiumTitle, { color: appTheme.text }]}>{isPro ? "You're on Pro Plan" : "Free Plan"}</Text>
        <Text numberOfLines={2} style={[styles.premiumSubtitle, { color: appTheme.secondaryText }]}>
          {isPro ? "Enjoy unlimited creativity and premium features." : `${Math.max(freeLimit - activeCount, 0)} of ${freeLimit} free experiences remaining.`}
        </Text>
      </View>
      <Pressable style={({ pressed }) => [styles.manageButton, { backgroundColor: appTheme.primary }, pressed ? styles.pressed : null]} onPress={() => router.push("/subscription" as never)}>
        <Text adjustsFontSizeToFit minimumFontScale={0.8} numberOfLines={1} style={styles.manageButtonText}>{isPro ? "Manage Plan" : "Upgrade"}</Text>
      </Pressable>
    </LinearGradient>
  );
});

const MenuCard = memo(function MenuCard({ onEditProfile }: { onEditProfile: () => void }) {
  const appTheme = useAppTheme();

  return (
    <View style={[styles.menuCard, { backgroundColor: appTheme.surface, borderColor: appTheme.navBorder }]}>
      {MENU_ITEMS.map((item, index) => (
        <MenuItem
          icon={item.icon}
          isLast={index === MENU_ITEMS.length - 1}
          key={item.title}
          onPress={() => (item.title === "Account Settings" ? onEditProfile() : router.push(item.route as never))}
          subtitle={item.subtitle}
          title={item.title}
        />
      ))}
    </View>
  );
});

function MenuItem({
  icon,
  isLast,
  onPress,
  subtitle,
  title
}: {
  icon: keyof typeof Ionicons.glyphMap;
  isLast: boolean;
  onPress: () => void;
  subtitle: string;
  title: string;
}) {
  const appTheme = useAppTheme();

  return (
    <Pressable style={({ pressed }) => [styles.menuItem, pressed ? styles.pressed : null]} onPress={onPress}>
      <View style={[styles.menuIcon, { backgroundColor: appTheme.muted }]}>
        <Ionicons color={appTheme.primary} name={icon} size={18} />
      </View>
      <View style={[styles.menuCopy, { borderBottomColor: appTheme.navBorder }, isLast ? styles.menuCopyLast : null]}>
        <View style={styles.menuTextBlock}>
          <Text numberOfLines={1} style={[styles.menuTitle, { color: appTheme.text }]}>{title}</Text>
          <Text numberOfLines={1} style={[styles.menuSubtitle, { color: appTheme.secondaryText }]}>
            {subtitle}
          </Text>
        </View>
        <Ionicons color={appTheme.secondaryText} name="chevron-forward" size={18} />
      </View>
    </Pressable>
  );
}

function ContactLine({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  const appTheme = useAppTheme();

  return (
    <View style={styles.contactLine}>
      <Ionicons color={appTheme.secondaryText} name={icon} size={14} />
      <Text numberOfLines={1} style={[styles.contactText, { color: appTheme.secondaryText }]}>
        {text}
      </Text>
    </View>
  );
}

function IconButton({ dot, icon, onPress }: { dot?: boolean; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  const appTheme = useAppTheme();

  return (
    <Pressable accessibilityRole="button" style={({ pressed }) => [styles.iconButton, pressed ? styles.pressed : null]} onPress={onPress}>
      <Ionicons color={appTheme.text} name={icon} size={20} />
      {dot ? <View style={[styles.notificationDot, { backgroundColor: appTheme.primary }]} /> : null}
    </Pressable>
  );
}

function LogoutButton({ isPending, onPress }: { isPending: boolean; onPress: () => void }) {
  const appTheme = useAppTheme();

  return (
    <Pressable disabled={isPending} style={({ pressed }) => [styles.logoutCard, { backgroundColor: appTheme.surface, borderColor: appTheme.navBorder }, pressed ? styles.pressed : null, isPending ? styles.disabled : null]} onPress={onPress}>
      <Ionicons color={appTheme.danger} name="log-out-outline" size={18} />
      <Text style={[styles.logoutText, { color: appTheme.danger }]}>{isPending ? "Logging out..." : "Log Out"}</Text>
    </Pressable>
  );
}

function ProfileEditor({
  email,
  error,
  fullName,
  isPending,
  onClose,
  onSave,
  phone,
  visible
}: {
  email: string;
  error: string | null;
  fullName: string;
  isPending: boolean;
  onClose: () => void;
  onSave: (input: { email: string; fullName: string; phone: string }) => void;
  phone: string;
  visible: boolean;
}) {
  const appTheme = useAppTheme();
  const [nameValue, setNameValue] = useState(fullName);
  const [emailValue, setEmailValue] = useState(email);
  const [phoneValue, setPhoneValue] = useState(phone);
  const [showValidation, setShowValidation] = useState(false);
  const nameError = showValidation && !nameValue.trim() ? "Full name is required." : null;
  const emailError = showValidation && !isValidEmail(emailValue.trim()) ? "Enter a valid email." : null;
  const phoneError = showValidation && !phoneValue.trim() ? "Phone number is required." : null;

  useEffect(() => {
    if (visible) {
      setNameValue(fullName);
      setEmailValue(email);
      setPhoneValue(phone);
      setShowValidation(false);
    }
  }, [email, fullName, phone, visible]);

  function submit() {
    setShowValidation(true);

    if (!nameValue.trim() || !isValidEmail(emailValue.trim()) || !phoneValue.trim()) {
      return;
    }

    onSave({ fullName: nameValue, email: emailValue, phone: phoneValue });
  }

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.editorSheet, { backgroundColor: appTheme.surface }]}>
          <View style={styles.editorHeader}>
            <View>
              <Text style={[styles.editorTitle, { color: appTheme.text }]}>Edit profile</Text>
              <Text style={[styles.editorSubtitle, { color: appTheme.secondaryText }]}>Name, email, and phone are mandatory.</Text>
            </View>
            <Pressable accessibilityLabel="Close profile editor" style={[styles.editorClose, { borderColor: appTheme.navBorder }]} onPress={onClose}>
              <Ionicons color={appTheme.text} name="close" size={18} />
            </Pressable>
          </View>

          <EditorField error={nameError} label="Full name" value={nameValue} onChangeText={setNameValue} />
          <EditorField autoCapitalize="none" error={emailError} keyboardType="email-address" label="Email" value={emailValue} onChangeText={setEmailValue} />
          <EditorField error={phoneError} keyboardType="phone-pad" label="Phone" value={phoneValue} onChangeText={setPhoneValue} />

          {error ? <Text style={[styles.editorError, { color: appTheme.danger }]}>{error}</Text> : null}

          <Pressable disabled={isPending} style={[styles.editorSave, { backgroundColor: appTheme.primary, opacity: isPending ? 0.7 : 1 }]} onPress={submit}>
            <Ionicons color="#ffffff" name={isPending ? "hourglass-outline" : "checkmark-circle-outline"} size={19} />
            <Text style={styles.editorSaveText}>{isPending ? "Saving..." : "Save profile"}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function EditorField({
  autoCapitalize,
  error,
  keyboardType,
  label,
  onChangeText,
  value
}: {
  autoCapitalize?: "none";
  error: string | null;
  keyboardType?: "default" | "email-address" | "phone-pad";
  label: string;
  onChangeText: (value: string) => void;
  value: string;
}) {
  const appTheme = useAppTheme();

  return (
    <View style={styles.editorField}>
      <Text style={[styles.editorLabel, { color: appTheme.text }]}>{label}</Text>
      <TextInput
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor={appTheme.secondaryText}
        style={[styles.editorInput, { backgroundColor: appTheme.surfaceAlt, borderColor: error ? appTheme.danger : appTheme.navBorder, color: appTheme.text }]}
        value={value}
      />
      {error ? <Text style={[styles.editorFieldError, { color: appTheme.danger }]}>{error}</Text> : null}
    </View>
  );
}

function getInitials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "A";
  const second = parts.length > 1 ? parts[1]?.[0] : parts[0]?.[1];
  return `${first}${second ?? ""}`.toUpperCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getProfileStats(experiences: number, views: number, completions: number, visitors: number): ProfileStat[] {
  return [
    { icon: "briefcase", label: "Experiences", value: formatCompactNumber(experiences) },
    { icon: "eye", label: "Total Views", value: formatCompactNumber(views) },
    { icon: "checkmark-circle", label: "Completions", value: formatCompactNumber(completions) },
    { icon: "people", label: "Visitors", value: formatCompactNumber(visitors) }
  ];
}

function formatCompactNumber(value: number) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(value >= 10000000 ? 0 : 1)}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  }

  return `${value}`;
}

const softShadow = {
  shadowColor: "#111827",
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2
};

const styles = StyleSheet.create({
  shell: { flex: 1 },
  animatedContent: { flex: 1 },
  screen: { gap: 12, paddingHorizontal: 14, paddingTop: 4, paddingBottom: 88 },
  header: { minHeight: 54, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  headerCopy: { flex: 1, minWidth: 0, gap: 2 },
  pageTitle: { fontFamily: FONT.bold, fontSize: 22, lineHeight: 25 },
  pageSubtitle: { fontFamily: FONT.medium, fontSize: 10, lineHeight: 13 },
  headerActions: { flexShrink: 0, flexDirection: "row", alignItems: "center", gap: 6, paddingTop: 0 },
  iconButton: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  notificationDot: { position: "absolute", right: 4, top: 4, width: 8, height: 8, borderRadius: 4 },
  profileCard: { borderRadius: 16, borderWidth: 1, padding: 12, ...softShadow },
  profileTop: { minHeight: 92, flexDirection: "row", alignItems: "center", gap: 10 },
  avatarWrap: { width: 68, height: 68 },
  avatarImage: { width: 68, height: 68, borderRadius: 34, alignItems: "center", justifyContent: "center" },
  avatarInitials: { color: "#FFFFFF", fontFamily: FONT.bold, fontSize: 22, lineHeight: 26 },
  cameraBadge: { position: "absolute", right: -2, bottom: 1, width: 26, height: 26, borderRadius: 13, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  profileInfo: { flex: 1, minWidth: 0, gap: 4 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  userName: { flexShrink: 1, fontFamily: FONT.bold, fontSize: 16, lineHeight: 21 },
  proBadge: { height: 24, borderRadius: 12, backgroundColor: "#FFE8F2", flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, flexShrink: 0 },
  proBadgeText: { fontFamily: FONT.semibold, fontSize: 11 },
  profileBio: { fontFamily: FONT.regular, fontSize: 11, lineHeight: 15 },
  contactLine: { flexDirection: "row", alignItems: "center", gap: 7 },
  contactText: { flex: 1, fontFamily: FONT.medium, fontSize: 11, lineHeight: 15 },
  cardDivider: { height: 1, marginTop: 10, marginBottom: 8 },
  statsRow: { height: 78, flexDirection: "row", alignItems: "stretch" },
  statColumn: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4 },
  statDivider: { position: "absolute", left: 0, top: 8, bottom: 8, width: 1 },
  statIcon: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: { fontFamily: FONT.bold, fontSize: 17, lineHeight: 21 },
  statLabel: { fontFamily: FONT.medium, fontSize: 9, lineHeight: 12 },
  premiumBanner: { minHeight: 64, borderRadius: 14, borderWidth: 1, borderColor: "#FFD4E5", flexDirection: "row", alignItems: "center", gap: 8, padding: 12, ...softShadow },
  premiumIcon: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  premiumCopy: { flex: 1, minWidth: 0, gap: 2 },
  premiumTitle: { fontFamily: FONT.semibold, fontSize: 12, lineHeight: 16 },
  premiumSubtitle: { fontFamily: FONT.regular, fontSize: 10, lineHeight: 13 },
  manageButton: { width: 92, height: 32, borderRadius: 12, alignItems: "center", justifyContent: "center", paddingHorizontal: 8, flexShrink: 0 },
  manageButtonText: { color: "#FFFFFF", fontFamily: FONT.semibold, fontSize: 10 },
  menuCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden", ...softShadow },
  menuItem: { height: 58, flexDirection: "row", alignItems: "center", gap: 10, paddingLeft: 12 },
  menuIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  menuCopy: { flex: 1, height: "100%", borderBottomWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, paddingRight: 12 },
  menuCopyLast: { borderBottomWidth: 0 },
  menuTextBlock: { flex: 1, minWidth: 0, gap: 2 },
  menuTitle: { fontFamily: FONT.semibold, fontSize: 13, lineHeight: 17 },
  menuSubtitle: { fontFamily: FONT.regular, fontSize: 10, lineHeight: 13 },
  logoutCard: { height: 52, borderRadius: 16, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, ...softShadow },
  logoutText: { fontFamily: FONT.semibold, fontSize: 13, lineHeight: 17 },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.92 },
  disabled: { opacity: 0.6 },
  errorText: { fontFamily: FONT.medium, fontSize: 12, lineHeight: 18, textAlign: "center" },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(16, 24, 40, 0.45)" },
  editorSheet: { gap: 14, padding: 16, paddingBottom: 28, borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  editorHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  editorTitle: { fontFamily: FONT.bold, fontSize: 20, lineHeight: 26 },
  editorSubtitle: { marginTop: 2, fontFamily: FONT.regular, fontSize: 12, lineHeight: 17 },
  editorClose: { width: 36, height: 36, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  editorField: { gap: 7 },
  editorLabel: { fontFamily: FONT.semibold, fontSize: 12 },
  editorInput: { height: 50, borderRadius: 16, borderWidth: 1, paddingHorizontal: 13, fontFamily: FONT.regular, fontSize: 13 },
  editorFieldError: { fontFamily: FONT.medium, fontSize: 11, lineHeight: 15 },
  editorError: { fontFamily: FONT.medium, fontSize: 12, lineHeight: 17 },
  editorSave: { height: 52, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  editorSaveText: { color: "#ffffff", fontFamily: FONT.semibold, fontSize: 14 }
});
