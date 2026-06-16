import { router } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useState } from "react";
import { useSessionStore } from "@/stores/session-store";

export default function SignInScreen() {
  const setDemoSession = useSessionStore((state) => state.setDemoSession);
  const [email, setEmail] = useState("");

  function continueWithDemo() {
    setDemoSession(email || "founder@airplane.app");
    router.replace("/home");
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.copy}>Email, Google, and Apple auth are wired to Supabase in the service layer.</Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="you@example.com"
        style={styles.input}
        value={email}
      />
      <Pressable style={styles.primaryButton} onPress={continueWithDemo}>
        <Text style={styles.primaryButtonText}>Continue with email</Text>
      </Pressable>
      <Pressable style={styles.oauthButton} onPress={continueWithDemo}>
        <Text style={styles.oauthButtonText}>Continue with Google</Text>
      </Pressable>
      <Pressable style={styles.oauthButton} onPress={continueWithDemo}>
        <Text style={styles.oauthButtonText}>Continue with Apple</Text>
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
  oauthButtonText: { color: "#101828", fontWeight: "700", fontSize: 16 }
});
