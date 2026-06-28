import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { BottomNav } from "@/components/bottom-nav";
import { useSignOut } from "@/features/auth/use-sign-out";
import { getMyProfile, updateMyProfile } from "@/features/profile/profile-service";
import { useSessionStore } from "@/stores/session-store";

export default function ProfileScreen() {
  const queryClient = useQueryClient();
  const session = useSessionStore((state) => state.session);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(session?.user.email ?? "");
  const [showValidation, setShowValidation] = useState(false);
  const profileQuery = useQuery({
    queryKey: ["my-profile"],
    queryFn: getMyProfile
  });
  const saveMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (profile) => {
      setFullName(profile.fullName ?? "");
      setEmail(profile.email ?? "");
      setShowValidation(false);
      void queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    }
  });
  const signOutMutation = useSignOut();

  useEffect(() => {
    if (!profileQuery.data) {
      return;
    }

    setFullName(profileQuery.data.fullName ?? "");
    setEmail(profileQuery.data.email ?? session?.user.email ?? "");
  }, [profileQuery.data, session?.user.email]);

  const fullNameError = showValidation && !fullName.trim() ? "Full name is required." : undefined;
  const emailError = showValidation && !isValidEmail(email.trim()) ? "Valid email is required." : undefined;
  const profile = profileQuery.data;
  const initials = getInitials(fullName || email || "A");
  const completedFields = [Boolean(fullName.trim()), isValidEmail(email.trim())].filter(Boolean).length;
  const completionPercent = (completedFields / 2) * 100;
  const isComplete = completedFields === 2;

  function save() {
    setShowValidation(true);

    if (!fullName.trim() || !isValidEmail(email.trim())) {
      return;
    }

    saveMutation.mutate({ fullName, email });
  }

  return (
    <View style={styles.shell}>
      <ScrollView
        contentContainerStyle={styles.screen}
        refreshControl={<RefreshControl refreshing={profileQuery.isRefetching} onRefresh={() => profileQuery.refetch()} />}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.identityCopy}>
              <Text style={styles.eyebrow}>Profile</Text>
              <Text style={styles.identityName}>{fullName.trim() || "Add your name"}</Text>
              <Text style={styles.identityEmail} numberOfLines={1}>{email.trim() || "Add your email"}</Text>
            </View>
          </View>
          <View style={styles.completionCard}>
            <View style={styles.completionHeading}>
              <Text style={styles.completionTitle}>{isComplete ? "Profile complete" : "Profile needs attention"}</Text>
              <Text style={[styles.completionBadge, isComplete ? styles.completeBadge : styles.incompleteBadge]}>
                {completedFields}/2
              </Text>
            </View>
            <View style={styles.completionTrack}>
              <View style={[styles.completionValue, { width: `${completionPercent}%` }]} />
            </View>
            <View style={styles.checklist}>
              <ChecklistItem complete={Boolean(fullName.trim())} label="Full name added" />
              <ChecklistItem complete={isValidEmail(email.trim())} label="Valid email added" />
            </View>
          </View>
        </View>

        {profileQuery.isLoading ? <Text style={styles.stateText}>Loading profile...</Text> : null}
        {profileQuery.error instanceof Error ? <Text style={styles.error}>{profileQuery.error.message}</Text> : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Required fields</Text>
          <Text style={styles.sectionHint}>Used for ownership and account recovery.</Text>
        </View>

        <View style={styles.formCard}>
          <Field
            error={fullNameError}
            label="Full name"
            required
            value={fullName}
            onChangeText={setFullName}
          />
          <Field
            autoCapitalize="none"
            error={emailError}
            keyboardType="email-address"
            label="Email"
            required
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Account details</Text>
          <Text style={styles.sectionHint}>Read-only technical account information.</Text>
        </View>

        <View style={styles.detailsCard}>
          <DetailRow icon="key-outline" label="Provider" value={profile?.provider ?? "email"} />
          <DetailRow icon="finger-print-outline" label="User ID" value={profile?.id ?? session?.user.id ?? "Not available"} />
          <DetailRow icon="calendar-outline" label="Created" value={formatDate(profile?.createdAt)} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>More</Text>
          <Text style={styles.sectionHint}>Manage plan, support, and app preferences.</Text>
        </View>

        <View style={styles.detailsCard}>
          <MenuRow icon="diamond-outline" label="My subscription" onPress={() => router.push("/subscription" as never)} />
          <MenuRow icon="settings-outline" label="Account settings" onPress={() => router.push("/settings" as never)} />
          <MenuRow icon="help-circle-outline" label="Help & support" onPress={() => router.push("/help" as never)} />
          <MenuRow icon="information-circle-outline" label="About AIRPLANE" onPress={() => router.push("/themes" as never)} />
        </View>

        {saveMutation.error instanceof Error ? <Text style={styles.error}>{saveMutation.error.message}</Text> : null}
        {saveMutation.isSuccess ? (
          <View style={styles.successRow}>
            <Ionicons color="#067647" name="checkmark-circle-outline" size={18} />
            <Text style={styles.successText}>Profile saved</Text>
          </View>
        ) : null}

        <View style={styles.actionsCard}>
          <Pressable disabled={saveMutation.isPending} style={[styles.primaryButton, saveMutation.isPending ? styles.pendingButton : null]} onPress={save}>
            <Ionicons color="#ffffff" name="save-outline" size={20} />
            <Text style={styles.primaryButtonText}>{saveMutation.isPending ? "Saving..." : "Save profile"}</Text>
          </Pressable>

          <Pressable disabled={signOutMutation.isPending} style={styles.secondaryButton} onPress={() => signOutMutation.mutate()}>
            <Ionicons color="#101828" name="log-out-outline" size={20} />
            <Text style={styles.secondaryButtonText}>{signOutMutation.isPending ? "Signing out..." : "Sign out"}</Text>
          </Pressable>
        </View>
      </ScrollView>
      <BottomNav active="profile" />
    </View>
  );
}

function ChecklistItem({ complete, label }: { complete: boolean; label: string }) {
  return (
    <View style={styles.checklistItem}>
      <Ionicons color={complete ? "#067647" : "#b54708"} name={complete ? "checkmark-circle" : "alert-circle-outline"} size={18} />
      <Text style={[styles.checklistText, complete ? styles.checklistComplete : null]}>{label}</Text>
    </View>
  );
}

function DetailRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Ionicons color="#175cd3" name={icon} size={18} />
      </View>
      <View style={styles.detailCopy}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text numberOfLines={1} style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

function MenuRow({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.detailRow} onPress={onPress}>
      <View style={styles.detailIcon}>
        <Ionicons color="#ec0e68" name={icon} size={18} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons color="#98a2b3" name="chevron-forward" size={19} />
    </Pressable>
  );
}

function Field({
  autoCapitalize,
  error,
  keyboardType,
  label,
  onChangeText,
  required,
  value
}: {
  autoCapitalize?: "none" | undefined;
  error?: string | undefined;
  keyboardType?: "email-address" | undefined;
  label: string;
  onChangeText: (value: string) => void;
  required?: boolean;
  value: string;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required ? <Text style={styles.required}>Required</Text> : null}
      </View>
      <TextInput
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        style={[styles.input, error ? styles.inputError : null]}
        value={value}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
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

function formatDate(value: string | undefined) {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: "#f6f7fb" },
  screen: { flexGrow: 1, gap: 16, padding: 20, paddingBottom: 110 },
  eyebrow: { color: "#ec0e68", fontSize: 13, fontWeight: "900", textTransform: "uppercase" },
  heroCard: { gap: 14, borderRadius: 8, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#eaecf0", padding: 16, marginTop: 8 },
  heroTopRow: { flexDirection: "row", alignItems: "center", gap: 13 },
  avatar: { width: 66, height: 66, borderRadius: 8, backgroundColor: "#101828", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#ffffff", fontSize: 23, fontWeight: "900" },
  identityCopy: { flex: 1, gap: 3 },
  identityName: { color: "#101828", fontSize: 22, lineHeight: 27, fontWeight: "900" },
  identityEmail: { color: "#667085", fontWeight: "700" },
  completionCard: { gap: 10, borderRadius: 8, backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#eaecf0", padding: 12 },
  completionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  completionTitle: { color: "#101828", fontWeight: "900" },
  completionBadge: { overflow: "hidden", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, fontSize: 12, fontWeight: "900" },
  completeBadge: { color: "#067647", backgroundColor: "#dcfae6" },
  incompleteBadge: { color: "#b54708", backgroundColor: "#fef0c7" },
  completionTrack: { height: 8, borderRadius: 4, overflow: "hidden", backgroundColor: "#eaecf0" },
  completionValue: { height: "100%", borderRadius: 4, backgroundColor: "#ec0e68" },
  checklist: { gap: 8 },
  checklistItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  checklistText: { color: "#7a2e0e", fontWeight: "800" },
  checklistComplete: { color: "#067647" },
  sectionHeader: { gap: 3 },
  sectionTitle: { color: "#101828", fontSize: 18, fontWeight: "900" },
  sectionHint: { color: "#667085", fontSize: 13, lineHeight: 18 },
  formCard: { gap: 14, borderRadius: 8, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#eaecf0", padding: 14 },
  field: { gap: 7 },
  labelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  label: { color: "#344054", fontWeight: "900" },
  required: { overflow: "hidden", borderRadius: 8, backgroundColor: "#fef3f2", color: "#b42318", paddingHorizontal: 8, paddingVertical: 4, fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  input: { minHeight: 50, borderWidth: 1, borderColor: "#d0d5dd", borderRadius: 8, paddingHorizontal: 13, backgroundColor: "#ffffff", color: "#101828", fontSize: 16 },
  inputError: { borderColor: "#f04438" },
  fieldError: { color: "#b42318", fontSize: 12, lineHeight: 17 },
  detailsCard: { borderRadius: 8, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#eaecf0", overflow: "hidden" },
  detailRow: { minHeight: 64, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: "#eaecf0" },
  detailIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: "#fff1f7", alignItems: "center", justifyContent: "center" },
  detailCopy: { flex: 1, gap: 2 },
  detailLabel: { color: "#667085", fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  detailValue: { color: "#101828", fontWeight: "800" },
  menuLabel: { flex: 1, color: "#101828", fontWeight: "900" },
  stateText: { color: "#667085", textAlign: "center", paddingVertical: 8 },
  successRow: { minHeight: 42, borderRadius: 8, backgroundColor: "#ecfdf3", borderWidth: 1, borderColor: "#abefc6", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  successText: { color: "#067647", fontWeight: "900" },
  actionsCard: { gap: 10 },
  primaryButton: { height: 54, borderRadius: 8, backgroundColor: "#ec0e68", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  primaryButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "900" },
  secondaryButton: { height: 52, borderRadius: 8, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#d0d5dd", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  secondaryButtonText: { color: "#101828", fontWeight: "900" },
  pendingButton: { opacity: 0.65 },
  error: { color: "#b42318", lineHeight: 20 }
});
