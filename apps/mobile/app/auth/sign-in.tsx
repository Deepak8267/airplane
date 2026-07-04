import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { signInWithEmail, signUpWithEmail } from "@/features/auth/auth-service";

export default function SignInScreen() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showValidation, setShowValidation] = useState(false);
  const authMutation = useMutation({
    mutationFn: () => (mode === "sign-in" ? signInWithEmail(email.trim(), password) : signUpWithEmail(email.trim(), password)),
    onSuccess: () => router.replace("/home")
  });
  const emailError = showValidation && !isValidEmail(email.trim()) ? "Enter a valid email." : undefined;
  const passwordError = showValidation && password.length < 6 ? "Password must be at least 6 characters." : undefined;

  function submit() {
    setShowValidation(true);

    if (!isValidEmail(email.trim()) || password.length < 6) {
      return;
    }

    authMutation.mutate();
  }

  function showProviderComingSoon(provider: string) {
    Alert.alert(`${provider} login`, "This login method is part of the planned auth setup. Use email for now.");
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboard}>
        <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.brandRow}>
            <View style={styles.logoMark}>
              <Ionicons color="#ffffff" name="paper-plane" size={20} />
            </View>
            <View style={styles.brandCopy}>
              <Text adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1} style={styles.logo}>AIRPLANE</Text>
              <Text numberOfLines={1} style={styles.tagline}>Premium - Personal - Interactive</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.heroIcon}>
              <Ionicons color="#ec0e68" name={mode === "sign-in" ? "lock-open-outline" : "person-add-outline"} size={28} />
            </View>
            <Text adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={2} style={styles.title}>{mode === "sign-in" ? "Welcome back" : "Create account"}</Text>
            <Text numberOfLines={3} style={styles.copy}>
              {mode === "sign-in" ? "Sign in to keep building and publishing shareable moments." : "Create your creator account to save experiences."}
            </Text>

            <View style={styles.socialStack}>
              <AuthProvider icon="logo-google" label="Continue with Google" onPress={() => showProviderComingSoon("Google")} />
              <AuthProvider icon="logo-apple" label="Continue with Apple" onPress={() => showProviderComingSoon("Apple")} />
            </View>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or use email</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#98a2b3"
                style={[styles.input, emailError ? styles.inputError : null]}
                value={email}
              />
              {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                autoCapitalize="none"
                onChangeText={setPassword}
                placeholder="Minimum 6 characters"
                placeholderTextColor="#98a2b3"
                secureTextEntry
                style={[styles.input, passwordError ? styles.inputError : null]}
                value={password}
              />
              {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}
            </View>

            {authMutation.error instanceof Error ? <Text style={styles.error}>{authMutation.error.message}</Text> : null}
            <Pressable style={[styles.primaryButton, { opacity: authMutation.isPending ? 0.7 : 1 }]} onPress={submit} disabled={authMutation.isPending}>
              <Ionicons color="#ffffff" name={authMutation.isPending ? "hourglass-outline" : "arrow-forward"} size={20} />
              <Text adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1} style={styles.primaryButtonText}>
                {authMutation.isPending ? "Please wait..." : mode === "sign-in" ? "Sign in" : "Create account"}
              </Text>
            </Pressable>
            <Pressable style={styles.oauthButton} onPress={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}>
              <Text adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1} style={styles.oauthButtonText}>
                {mode === "sign-in" ? "Need an account? Sign up" : "Already have an account? Sign in"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function AuthProvider({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.providerButton} onPress={onPress}>
      <Ionicons color="#101828" name={icon} size={20} />
      <Text adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1} style={styles.providerText}>{label}</Text>
      <Text style={styles.soonBadge}>Soon</Text>
    </Pressable>
  );
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff7fb" },
  keyboard: { flex: 1 },
  screen: { flexGrow: 1, justifyContent: "center", gap: 18, paddingHorizontal: 16, paddingVertical: 24, backgroundColor: "#fff7fb" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 11 },
  brandCopy: { flex: 1, minWidth: 0 },
  logoMark: { width: 42, height: 42, borderRadius: 16, backgroundColor: "#ec0e68", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  logo: { fontSize: 19, fontWeight: "900", letterSpacing: 0, color: "#101828" },
  tagline: { color: "#667085", fontSize: 11, fontWeight: "900" },
  card: { gap: 14, borderRadius: 20, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", padding: 16 },
  heroIcon: { alignSelf: "center", width: 58, height: 58, borderRadius: 18, backgroundColor: "#fff0f6", alignItems: "center", justifyContent: "center" },
  title: { fontSize: 26, lineHeight: 32, fontWeight: "900", color: "#101828", textAlign: "center" },
  copy: { fontSize: 13, lineHeight: 20, color: "#667085", textAlign: "center" },
  socialStack: { gap: 10 },
  providerButton: { height: 50, borderRadius: 16, borderWidth: 1, borderColor: "#eaecf0", backgroundColor: "#ffffff", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 12 },
  providerText: { flex: 1, minWidth: 0, color: "#101828", fontWeight: "900", textAlign: "center" },
  soonBadge: { overflow: "hidden", borderRadius: 12, backgroundColor: "#f2f4f7", color: "#667085", paddingHorizontal: 7, paddingVertical: 3, fontSize: 10, fontWeight: "900", textTransform: "uppercase", flexShrink: 0 },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  divider: { flex: 1, height: 1, backgroundColor: "#eaecf0" },
  dividerText: { color: "#98a2b3", fontSize: 12, fontWeight: "800" },
  field: { gap: 7 },
  label: { color: "#344054", fontWeight: "900" },
  input: { height: 52, borderWidth: 1, borderColor: "#eaecf0", borderRadius: 16, paddingHorizontal: 14, backgroundColor: "#f9fafb", fontSize: 15, color: "#101828" },
  inputError: { borderColor: "#f04438" },
  fieldError: { color: "#b42318", fontSize: 12, lineHeight: 17 },
  primaryButton: { height: 52, borderRadius: 16, backgroundColor: "#ec0e68", justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 8, paddingHorizontal: 16 },
  primaryButtonText: { color: "#ffffff", fontWeight: "900", fontSize: 15 },
  oauthButton: { height: 48, borderRadius: 16, backgroundColor: "#fff1f7", justifyContent: "center", alignItems: "center", paddingHorizontal: 14 },
  oauthButtonText: { color: "#ec0e68", fontWeight: "900", fontSize: 14 },
  error: { color: "#b42318", lineHeight: 20 }
});
