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
      <Text style={styles.title}>{mode === "sign-in" ? "Welcome back" : "Create your account"}</Text>
      <Text style={styles.copy}>Use email and password to save experiences to your AIRPLANE account.</Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="you@example.com"
        style={styles.input}
        value={email}
      />
      <TextInput
        autoCapitalize="none"
        onChangeText={setPassword}
        placeholder="Password"
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
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 24, justifyContent: "center", gap: 14 },
  title: { fontSize: 32, fontWeight: "800", color: "#101828" },
  copy: { fontSize: 16, lineHeight: 23, color: "#667085" },
  input: { height: 52, borderWidth: 1, borderColor: "#d0d5dd", borderRadius: 8, paddingHorizontal: 14, backgroundColor: "#ffffff", fontSize: 16 },
  primaryButton: { height: 52, borderRadius: 8, backgroundColor: "#101828", justifyContent: "center", alignItems: "center" },
  primaryButtonText: { color: "#ffffff", fontWeight: "700", fontSize: 16 },
  oauthButton: { height: 52, borderRadius: 8, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#d0d5dd", justifyContent: "center", alignItems: "center" },
  oauthButtonText: { color: "#101828", fontWeight: "700", fontSize: 16 },
  error: { color: "#b42318", lineHeight: 20 }
});
