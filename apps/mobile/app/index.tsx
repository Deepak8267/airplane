import { Link, Redirect } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSessionStore } from "@/stores/session-store";

export default function IndexScreen() {
  const hydrated = useSessionStore((state) => state.hydrated);
  const session = useSessionStore((state) => state.session);

  if (!hydrated) {
    return (
      <View style={styles.screen}>
        <Text style={styles.logo}>AIRPLANE</Text>
        <Text style={styles.copy}>Loading your session...</Text>
      </View>
    );
  }

  if (session) {
    return <Redirect href="/home" />;
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.logo}>AIRPLANE</Text>
      <Text style={styles.title}>Create a link they will actually remember.</Text>
      <Text style={styles.copy}>
        Build proposals, birthday surprises, friendship quizzes, and memory pages from your phone.
      </Text>
      <Link href="/auth/sign-in" asChild>
        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Sign in</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: "center", padding: 24, gap: 18 },
  logo: { fontSize: 15, fontWeight: "800", letterSpacing: 0, color: "#2563eb" },
  title: { fontSize: 36, lineHeight: 42, fontWeight: "800", color: "#101828" },
  copy: { fontSize: 17, lineHeight: 25, color: "#475467" },
  primaryButton: { height: 54, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: "#101828" },
  primaryButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
  secondaryButton: { height: 54, borderRadius: 8, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#d0d5dd" },
  secondaryButtonText: { color: "#101828", fontSize: 16, fontWeight: "700" }
});
