import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Profile</Text>
          <Text style={styles.title}>Your creator account</Text>
          <Text style={styles.copy}>Complete the required fields so experiences and analytics stay attached to the right creator.</Text>
        </View>

        <View style={styles.identityCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.identityCopy}>
            <Text style={styles.identityName}>{fullName.trim() || "Add your name"}</Text>
            <Text style={styles.identityEmail}>{email.trim() || "Add your email"}</Text>
          </View>
        </View>

        {profileQuery.isLoading ? <Text style={styles.stateText}>Loading profile...</Text> : null}
        {profileQuery.error instanceof Error ? <Text style={styles.error}>{profileQuery.error.message}</Text> : null}

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
          <View style={styles.readOnlyRow}>
            <Text style={styles.readOnlyLabel}>Provider</Text>
            <Text style={styles.readOnlyValue}>{profile?.provider ?? "email"}</Text>
          </View>
          <View style={styles.readOnlyRow}>
            <Text style={styles.readOnlyLabel}>User ID</Text>
            <Text numberOfLines={1} style={styles.readOnlyValue}>{profile?.id ?? session?.user.id ?? "Not available"}</Text>
          </View>
        </View>

        {saveMutation.error instanceof Error ? <Text style={styles.error}>{saveMutation.error.message}</Text> : null}
        {saveMutation.isSuccess ? (
          <View style={styles.successRow}>
            <Ionicons color="#067647" name="checkmark-circle-outline" size={18} />
            <Text style={styles.successText}>Profile saved</Text>
          </View>
        ) : null}

        <Pressable disabled={saveMutation.isPending} style={[styles.primaryButton, saveMutation.isPending ? styles.pendingButton : null]} onPress={save}>
          <Ionicons color="#ffffff" name="save-outline" size={20} />
          <Text style={styles.primaryButtonText}>{saveMutation.isPending ? "Saving..." : "Save profile"}</Text>
        </Pressable>

        <Pressable disabled={signOutMutation.isPending} style={styles.secondaryButton} onPress={() => signOutMutation.mutate()}>
          <Ionicons color="#101828" name="log-out-outline" size={20} />
          <Text style={styles.secondaryButtonText}>{signOutMutation.isPending ? "Signing out..." : "Sign out"}</Text>
        </Pressable>
      </ScrollView>
      <BottomNav active="profile" />
    </View>
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

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: "#f6f7fb" },
  screen: { flexGrow: 1, gap: 16, padding: 20, paddingBottom: 110 },
  header: { gap: 7, paddingTop: 8 },
  eyebrow: { color: "#2563eb", fontSize: 13, fontWeight: "900", textTransform: "uppercase" },
  title: { color: "#101828", fontSize: 32, lineHeight: 38, fontWeight: "900" },
  copy: { color: "#667085", fontSize: 15, lineHeight: 22 },
  identityCard: { minHeight: 96, borderRadius: 8, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#eaecf0", padding: 14, flexDirection: "row", alignItems: "center", gap: 13 },
  avatar: { width: 62, height: 62, borderRadius: 8, backgroundColor: "#101828", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#ffffff", fontSize: 22, fontWeight: "900" },
  identityCopy: { flex: 1, gap: 3 },
  identityName: { color: "#101828", fontSize: 18, fontWeight: "900" },
  identityEmail: { color: "#667085", fontWeight: "700" },
  formCard: { gap: 14, borderRadius: 8, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#eaecf0", padding: 14 },
  field: { gap: 7 },
  labelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  label: { color: "#344054", fontWeight: "900" },
  required: { overflow: "hidden", borderRadius: 8, backgroundColor: "#fef3f2", color: "#b42318", paddingHorizontal: 8, paddingVertical: 4, fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  input: { minHeight: 50, borderWidth: 1, borderColor: "#d0d5dd", borderRadius: 8, paddingHorizontal: 13, backgroundColor: "#ffffff", color: "#101828", fontSize: 16 },
  inputError: { borderColor: "#f04438" },
  fieldError: { color: "#b42318", fontSize: 12, lineHeight: 17 },
  readOnlyRow: { minHeight: 48, borderRadius: 8, backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#eaecf0", paddingHorizontal: 12, justifyContent: "center", gap: 2 },
  readOnlyLabel: { color: "#667085", fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  readOnlyValue: { color: "#101828", fontWeight: "800" },
  stateText: { color: "#667085", textAlign: "center", paddingVertical: 8 },
  successRow: { minHeight: 42, borderRadius: 8, backgroundColor: "#ecfdf3", borderWidth: 1, borderColor: "#abefc6", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  successText: { color: "#067647", fontWeight: "900" },
  primaryButton: { height: 54, borderRadius: 8, backgroundColor: "#101828", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  primaryButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "900" },
  secondaryButton: { height: 52, borderRadius: 8, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#d0d5dd", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  secondaryButtonText: { color: "#101828", fontWeight: "900" },
  pendingButton: { opacity: 0.65 },
  error: { color: "#b42318", lineHeight: 20 }
});
