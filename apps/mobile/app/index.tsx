import { Ionicons } from "@expo/vector-icons";
import { Link, Redirect } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSessionStore } from "@/stores/session-store";
import { useAppTheme } from "@/stores/app-theme-store";

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
  const appTheme = useAppTheme();
  const hydrated = useSessionStore((state) => state.hydrated);
  const session = useSessionStore((state) => state.session);
  const [index, setIndex] = useState(0);
  const slide = ONBOARDING_SLIDES[index] ?? ONBOARDING_SLIDES[0]!;
  const isLast = index === ONBOARDING_SLIDES.length - 1;
  const progress = Math.round(((index + 1) / ONBOARDING_SLIDES.length) * 100);

  if (!hydrated) {
    return (
      <View style={[styles.screen, { backgroundColor: appTheme.background }]}>
        <Text style={[styles.logo, { color: appTheme.text }]}>AIRPLANE</Text>
        <Text style={[styles.copy, { color: appTheme.secondaryText }]}>Loading your session...</Text>
      </View>
    );
  }

  if (session) {
    return <Redirect href="/home" />;
  }

  return (
    <SafeAreaView edges={["top"]} style={[styles.root, { backgroundColor: appTheme.background }]}>
      <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
        <View style={styles.brandRow}>
          <View style={[styles.logoMark, { backgroundColor: appTheme.primary }]}>
            <Ionicons color="#ffffff" name="paper-plane" size={21} />
          </View>
          <View style={styles.brandCopy}>
            <Text style={[styles.logo, { color: appTheme.text }]}>AIRPLANE</Text>
            <Text style={[styles.tagline, { color: appTheme.secondaryText }]}>Create moments that fly</Text>
          </View>
          <Text style={[styles.stepBadge, { backgroundColor: appTheme.surface, borderColor: appTheme.border, color: appTheme.primary }]}>{index + 1}/{ONBOARDING_SLIDES.length}</Text>
        </View>

        <View style={[styles.progressTrack, { backgroundColor: appTheme.border }]}>
          <View style={[styles.progressValue, { backgroundColor: appTheme.primary, width: `${progress}%` }]} />
        </View>

        <View style={[styles.heroArt, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]}>
          <View style={styles.flightPath} />
          <View style={[styles.paperPlaneLarge, { backgroundColor: appTheme.surfaceAlt }]}>
            <Ionicons color={appTheme.primary} name={slide.icon} size={52} />
          </View>
          <View style={styles.floatingHeart}>
            <Text style={[styles.heartText, { color: appTheme.primary }]}>{index === 1 ? "LINK" : index === 2 ? "DATA" : "LOVE"}</Text>
          </View>
          <View style={styles.floatingSpark}>
            <Ionicons color="#f97316" name="sparkles" size={20} />
          </View>
          <View style={[styles.floatingCard, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]}>
            <Ionicons color={appTheme.primary} name="heart-circle-outline" size={18} />
            <Text style={[styles.floatingCardText, { color: appTheme.text }]}>Personal</Text>
          </View>
        </View>

        <View style={styles.copyBlock}>
          <Text style={[styles.title, { color: appTheme.text }]}>{slide.title}</Text>
          <Text style={[styles.copy, { color: appTheme.secondaryText }]}>{slide.copy}</Text>
        </View>

        <View style={styles.dots}>
          {ONBOARDING_SLIDES.map((item, dotIndex) => (
            <Pressable key={item.title} accessibilityLabel={`Go to onboarding slide ${dotIndex + 1}`} onPress={() => setIndex(dotIndex)}>
              <View style={[styles.dot, { backgroundColor: appTheme.border }, dotIndex === index ? { backgroundColor: appTheme.primary } : null]} />
            </Pressable>
          ))}
        </View>

        <View style={styles.actions}>
          {isLast ? (
            <Link href="/auth/sign-in" asChild>
              <Pressable style={[styles.primaryButton, { backgroundColor: appTheme.primary }]}>
                <Text style={styles.primaryButtonText}>Let's go</Text>
                <Ionicons color="#ffffff" name="arrow-forward" size={20} />
              </Pressable>
            </Link>
          ) : (
            <Pressable style={[styles.primaryButton, { backgroundColor: appTheme.primary }]} onPress={() => setIndex((value) => Math.min(value + 1, ONBOARDING_SLIDES.length - 1))}>
              <Text style={styles.primaryButtonText}>Next</Text>
              <Ionicons color="#ffffff" name="chevron-forward" size={20} />
            </Pressable>
          )}
          <Link href="/auth/sign-in" asChild>
            <Pressable style={[styles.secondaryButton, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]}>
              <Text style={[styles.secondaryButtonText, { color: appTheme.primary }]}>Skip onboarding</Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.featureGrid}>
          <Feature icon="heart-outline" title="Personal" copy="Made for one special recipient." />
          <Feature icon="sparkles-outline" title="Interactive" copy="Pages, quizzes, and surprises." />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Feature({ copy, icon, title }: { copy: string; icon: keyof typeof Ionicons.glyphMap; title: string }) {
  const appTheme = useAppTheme();

  return (
    <View style={[styles.featureCard, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]}>
      <Ionicons color={appTheme.primary} name={icon} size={22} />
      <Text style={[styles.featureTitle, { color: appTheme.text }]}>{title}</Text>
      <Text style={[styles.featureCopy, { color: appTheme.secondaryText }]}>{copy}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff7fb" },
  screen: { flexGrow: 1, justifyContent: "center", padding: 16, gap: 20 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 11 },
  logoMark: { width: 42, height: 42, borderRadius: 18, backgroundColor: "#ec0e68", alignItems: "center", justifyContent: "center" },
  brandCopy: { flex: 1 },
  logo: { fontSize: 19, fontWeight: "900", letterSpacing: 0, color: "#101828" },
  tagline: { color: "#667085", fontSize: 11, fontWeight: "900", textTransform: "uppercase" },
  stepBadge: { overflow: "hidden", borderRadius: 14, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#fbcfe8", color: "#ec0e68", paddingHorizontal: 9, paddingVertical: 5, fontSize: 12, fontWeight: "900" },
  progressTrack: { height: 8, borderRadius: 4, overflow: "hidden", backgroundColor: "#fbcfe8" },
  progressValue: { height: "100%", borderRadius: 4, backgroundColor: "#ec0e68" },
  heroArt: { height: 230, borderRadius: 22, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#fbcfe8", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  flightPath: { position: "absolute", width: 180, height: 180, borderRadius: 90, borderWidth: 2, borderStyle: "dashed", borderColor: "#f9a8d4", transform: [{ rotate: "-28deg" }] },
  paperPlaneLarge: { width: 108, height: 108, borderRadius: 22, backgroundColor: "#fff1f7", alignItems: "center", justifyContent: "center" },
  floatingHeart: { position: "absolute", right: 34, top: 38, minWidth: 48, height: 34, borderRadius: 16, backgroundColor: "#ffe4ef", alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  heartText: { color: "#ec0e68", fontSize: 12, fontWeight: "900" },
  floatingSpark: { position: "absolute", left: 36, bottom: 38, width: 36, height: 36, borderRadius: 18, backgroundColor: "#fff7ed", alignItems: "center", justifyContent: "center" },
  floatingCard: { position: "absolute", left: 24, top: 34, minHeight: 34, borderRadius: 16, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#fbcfe8", flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8 },
  floatingCardText: { color: "#101828", fontSize: 11, fontWeight: "900" },
  copyBlock: { gap: 8 },
  title: { fontSize: 34, lineHeight: 40, fontWeight: "900", color: "#101828" },
  copy: { fontSize: 13, lineHeight: 20, color: "#475467" },
  dots: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#f9a8d4" },
  activeDot: { width: 24, backgroundColor: "#ec0e68" },
  actions: { gap: 10 },
  featureGrid: { flexDirection: "row", gap: 10 },
  featureCard: { flex: 1, minHeight: 118, borderRadius: 20, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", padding: 12, justifyContent: "space-between" },
  featureTitle: { color: "#101828", fontWeight: "900" },
  featureCopy: { color: "#667085", fontSize: 12, lineHeight: 17 },
  primaryButton: { height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "#ec0e68", flexDirection: "row", gap: 8 },
  primaryButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "900" },
  secondaryButton: { height: 50, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff" },
  secondaryButtonText: { color: "#ec0e68", fontSize: 15, fontWeight: "900" }
});
