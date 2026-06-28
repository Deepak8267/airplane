import { Ionicons } from "@expo/vector-icons";
import { Link, Redirect } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSessionStore } from "@/stores/session-store";

const ONBOARDING_SLIDES: Array<{
  copy: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
}> = [
  {
    icon: "paper-plane",
    title: "Create magical experiences that fly.",
    copy: "Build proposals, birthday surprises, friendship quizzes, and memory pages from your phone."
  },
  {
    icon: "link-outline",
    title: "Share instantly with anyone.",
    copy: "Every experience becomes one web link. Recipients do not need to install the app."
  },
  {
    icon: "bar-chart-outline",
    title: "Track reactions that matter.",
    copy: "See views, completions, answers, button clicks, and proposal NO attempts."
  }
];

export default function IndexScreen() {
  const hydrated = useSessionStore((state) => state.hydrated);
  const session = useSessionStore((state) => state.session);
  const [index, setIndex] = useState(0);
  const slide = ONBOARDING_SLIDES[index] ?? ONBOARDING_SLIDES[0]!;
  const isLast = index === ONBOARDING_SLIDES.length - 1;

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
      <View style={styles.brandRow}>
        <View style={styles.logoMark}>
          <Ionicons color="#ffffff" name="paper-plane" size={21} />
        </View>
        <View>
          <Text style={styles.logo}>AIRPLANE</Text>
          <Text style={styles.tagline}>Create moments that fly</Text>
        </View>
      </View>

      <View style={styles.heroArt}>
        <View style={styles.flightPath} />
        <View style={styles.paperPlaneLarge}>
          <Ionicons color="#ec0e68" name={slide.icon} size={52} />
        </View>
        <View style={styles.floatingHeart}>
          <Text style={styles.heartText}>LOVE</Text>
        </View>
        <View style={styles.floatingSpark}>
          <Ionicons color="#f97316" name="sparkles" size={20} />
        </View>
      </View>

      <View style={styles.copyBlock}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.copy}>{slide.copy}</Text>
      </View>

      <View style={styles.dots}>
        {ONBOARDING_SLIDES.map((item, dotIndex) => (
          <View key={item.title} style={[styles.dot, dotIndex === index ? styles.activeDot : null]} />
        ))}
      </View>

      <View style={styles.actions}>
        {isLast ? (
          <Link href="/auth/sign-in" asChild>
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Let's go</Text>
            </Pressable>
          </Link>
        ) : (
          <Pressable style={styles.primaryButton} onPress={() => setIndex((value) => Math.min(value + 1, ONBOARDING_SLIDES.length - 1))}>
            <Text style={styles.primaryButtonText}>Next</Text>
          </Pressable>
        )}
        <Link href="/auth/sign-in" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Skip</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.featureGrid}>
        <Feature icon="heart-outline" title="Personal" copy="Made for one special recipient." />
        <Feature icon="sparkles-outline" title="Interactive" copy="Pages, quizzes, and surprises." />
      </View>
    </View>
  );
}

function Feature({ copy, icon, title }: { copy: string; icon: keyof typeof Ionicons.glyphMap; title: string }) {
  return (
    <View style={styles.featureCard}>
      <Ionicons color="#ec0e68" name={icon} size={22} />
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureCopy}>{copy}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: "center", padding: 24, gap: 18, backgroundColor: "#fff7fb" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 11 },
  logoMark: { width: 42, height: 42, borderRadius: 8, backgroundColor: "#ec0e68", alignItems: "center", justifyContent: "center" },
  logo: { fontSize: 19, fontWeight: "900", letterSpacing: 0, color: "#101828" },
  tagline: { color: "#667085", fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  heroArt: { height: 212, borderRadius: 8, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#fbcfe8", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  flightPath: { position: "absolute", width: 180, height: 180, borderRadius: 90, borderWidth: 2, borderStyle: "dashed", borderColor: "#f9a8d4", transform: [{ rotate: "-28deg" }] },
  paperPlaneLarge: { width: 108, height: 108, borderRadius: 8, backgroundColor: "#fff1f7", alignItems: "center", justifyContent: "center" },
  floatingHeart: { position: "absolute", right: 34, top: 38, minWidth: 48, height: 34, borderRadius: 8, backgroundColor: "#ffe4ef", alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  heartText: { color: "#ec0e68", fontSize: 12, fontWeight: "900" },
  floatingSpark: { position: "absolute", left: 36, bottom: 38, width: 36, height: 36, borderRadius: 8, backgroundColor: "#fff7ed", alignItems: "center", justifyContent: "center" },
  copyBlock: { gap: 8 },
  title: { fontSize: 34, lineHeight: 40, fontWeight: "900", color: "#101828" },
  copy: { fontSize: 16, lineHeight: 24, color: "#475467" },
  dots: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#f9a8d4" },
  activeDot: { width: 24, backgroundColor: "#ec0e68" },
  actions: { gap: 10 },
  featureGrid: { flexDirection: "row", gap: 10 },
  featureCard: { flex: 1, minHeight: 118, borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", padding: 12, justifyContent: "space-between" },
  featureTitle: { color: "#101828", fontWeight: "900" },
  featureCopy: { color: "#667085", fontSize: 12, lineHeight: 17 },
  primaryButton: { height: 54, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: "#ec0e68" },
  primaryButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "900" },
  secondaryButton: { height: 50, borderRadius: 8, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff" },
  secondaryButtonText: { color: "#ec0e68", fontSize: 15, fontWeight: "900" }
});
