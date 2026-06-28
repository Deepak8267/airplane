import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useState } from "react";
import { signInWithEmail, signUpWithEmail } from "@/features/auth/auth-service";

export default function SignInScreen() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const authMutation = useMutation({
    mutationFn: () => (mode === "sign-in" ? signInWithEmail(email.trim(), password) : signUpWithEmail(email.trim(), password)),
    onSuccess: () => router.replace("/home")
  });

  function submit() {
    authMutation.mutate();
  }

  return (
    <View style={styles.screen}>
      <View style={styles.brandRow}>
        <View style={styles.logoMark}>
          <Ionicons color="#ffffff" name="paper-plane" size={20} />
        </View>
        <View>
          <Text style={styles.logo}>AIRPLANE</Text>
          <Text style={styles.tagline}>Premium · Personal · Interactive</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>{mode === "sign-in" ? "Welcome back 👋" : "Create account"}</Text>
        <Text style={styles.copy}>Login to continue building shareable moments.</Text>

        <View style={styles.socialStack}>
          <AuthProvider icon="logo-google" label="Continue with Google" />
          <AuthProvider icon="logo-apple" label="Continue with Apple" />
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>

        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Email address"
          placeholderTextColor="#98a2b3"
          style={styles.input}
          value={email}
        />
        <TextInput
          autoCapitalize="none"
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#98a2b3"
          secureTextEntry
          style={styles.input}
          value={password}
        />
        {authMutation.error instanceof Error ? <Text style={styles.error}>{authMutation.error.message}</Text> : null}
        <Pressable style={[styles.primaryButton, { opacity: authMutation.isPending ? 0.7 : 1 }]} onPress={submit} disabled={authMutation.isPending}>
          <Text style={styles.primaryButtonText}>
            {authMutation.isPending ? "Please wait..." : mode === "sign-in" ? "Sign in" : "Create account"}
          </Text>
        </Pressable>
        <Pressable style={styles.oauthButton} onPress={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}>
          <Text style={styles.oauthButtonText}>
            {mode === "sign-in" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function AuthProvider({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.providerButton}>
      <Ionicons color="#101828" name={icon} size={20} />
      <Text style={styles.providerText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 24, justifyContent: "center", gap: 18, backgroundColor: "#fff7fb" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 11 },
  logoMark: { width: 42, height: 42, borderRadius: 8, backgroundColor: "#ec0e68", alignItems: "center", justifyContent: "center" },
  logo: { fontSize: 19, fontWeight: "900", letterSpacing: 0, color: "#101828" },
  tagline: { color: "#667085", fontSize: 11, fontWeight: "900" },
  card: { gap: 14, borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", padding: 18 },
  title: { fontSize: 30, lineHeight: 36, fontWeight: "900", color: "#101828", textAlign: "center" },
  copy: { fontSize: 15, lineHeight: 22, color: "#667085", textAlign: "center" },
  socialStack: { gap: 10 },
  providerButton: { height: 50, borderRadius: 8, borderWidth: 1, borderColor: "#eaecf0", backgroundColor: "#ffffff", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  providerText: { color: "#101828", fontWeight: "900" },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  divider: { flex: 1, height: 1, backgroundColor: "#eaecf0" },
  dividerText: { color: "#98a2b3", fontSize: 12, fontWeight: "800" },
  input: { height: 52, borderWidth: 1, borderColor: "#eaecf0", borderRadius: 8, paddingHorizontal: 14, backgroundColor: "#f9fafb", fontSize: 16, color: "#101828" },
  primaryButton: { height: 52, borderRadius: 8, backgroundColor: "#ec0e68", justifyContent: "center", alignItems: "center" },
  primaryButtonText: { color: "#ffffff", fontWeight: "900", fontSize: 16 },
  oauthButton: { height: 48, borderRadius: 8, backgroundColor: "#fff1f7", justifyContent: "center", alignItems: "center" },
  oauthButtonText: { color: "#ec0e68", fontWeight: "900", fontSize: 15 },
  error: { color: "#b42318", lineHeight: 20 }
});
