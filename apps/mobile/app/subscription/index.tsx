import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FLOW_SIZE, MOBILE_FONT } from "@/design/tokens";
import { getPlanUsage } from "@/features/subscriptions/subscription-service";
import { useAppTheme } from "@/stores/app-theme-store";

const FREE_FEATURES = ["3 active experiences", "AIRPLANE watermark", "Basic templates", "Basic sharing"];
const PRO_FEATURES = ["Unlimited experiences", "Premium templates", "Remove watermark", "Advanced analytics", "Priority support"];

export default function SubscriptionScreen() {
  const appTheme = useAppTheme();
  const planQuery = useQuery({ queryKey: ["plan-usage"], queryFn: getPlanUsage });
  const usage = planQuery.data;
  const isPro = usage?.plan === "pro";

  return (
    <SafeAreaView edges={["top"]} style={[styles.root, { backgroundColor: appTheme.background }]}>
      <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable accessibilityLabel="Go back" style={[styles.iconButton, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]} onPress={() => router.back()}>
            <Ionicons color={appTheme.text} name="chevron-back" size={22} />
          </Pressable>
          <View style={[styles.badge, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]}>
            <Ionicons color={appTheme.primary} name="diamond-outline" size={17} />
            <Text style={[styles.badgeText, { color: appTheme.primary }]}>Plan</Text>
          </View>
        </View>

        <View style={[styles.heroCard, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]}>
          <View style={[styles.crown, { backgroundColor: appTheme.muted }]}>
            <Ionicons color={appTheme.primary} name="diamond-outline" size={32} />
          </View>
          <Text adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={2} style={[styles.heroTitle, { color: appTheme.text }]}>{isPro ? "You are on Pro." : "Unlock Pro"}</Text>
          <Text style={[styles.heroCopy, { color: appTheme.secondaryText }]}>Create unlimited personalized experiences, remove AIRPLANE branding, and unlock deeper analytics.</Text>
          <View style={[styles.usageCard, { backgroundColor: appTheme.surfaceAlt, borderColor: appTheme.border }]}>
            <Text style={[styles.usageLabel, { color: appTheme.secondaryText }]}>Free usage</Text>
            <Text style={[styles.usageValue, { color: appTheme.text }]}>
              {usage ? `${usage.activeExperienceCount}/${usage.freeExperienceLimit} active experiences` : "Loading usage..."}
            </Text>
          </View>
        </View>

        <View style={[styles.billingTabs, { backgroundColor: appTheme.surface, borderColor: appTheme.border }]}>
          <Text style={[styles.billingActive, { backgroundColor: appTheme.primary }]}>Monthly</Text>
          <Text style={[styles.billingInactive, { color: appTheme.secondaryText }]}>Yearly later</Text>
        </View>

        {planQuery.error instanceof Error ? <Text style={styles.error}>{planQuery.error.message}</Text> : null}

        <View style={styles.planGrid}>
          <PlanCard active={!isPro} name="Free" price="Rs 0" features={FREE_FEATURES} />
          <PlanCard active={isPro} name="Pro" price="Rs 199/mo" features={PRO_FEATURES} highlighted />
        </View>

        <View style={styles.noticeCard}>
          <Ionicons color="#b54708" name="information-circle-outline" size={22} />
          <View style={styles.noticeCopy}>
            <Text numberOfLines={1} style={styles.noticeTitle}>Payments later</Text>
            <Text numberOfLines={3} style={styles.noticeText}>Razorpay integration is planned, but payment activation is intentionally paused for now.</Text>
          </View>
        </View>

        <Pressable disabled style={[styles.disabledButton, { backgroundColor: appTheme.primary }]}>
          <Ionicons color="#ffffff" name="card-outline" size={20} />
          <Text adjustsFontSizeToFit minimumFontScale={0.82} numberOfLines={1} style={styles.disabledButtonText}>Razorpay coming soon</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function PlanCard({ active, features, highlighted = false, name, price }: { active?: boolean; features: string[]; highlighted?: boolean; name: string; price: string }) {
  const appTheme = useAppTheme();

  return (
    <View style={[styles.planCard, { backgroundColor: highlighted ? appTheme.surfaceAlt : appTheme.surface, borderColor: highlighted ? appTheme.border : appTheme.navBorder }]}>
      <View style={styles.planHeader}>
        <View>
          <Text numberOfLines={1} style={[styles.planName, { color: appTheme.text }]}>{name}</Text>
          <Text adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={1} style={[styles.price, { color: appTheme.text }]}>{price}</Text>
        </View>
        {active ? <Text style={styles.activeBadge}>Current</Text> : null}
      </View>
      <View style={styles.featureList}>
        {features.map((feature) => (
          <View key={feature} style={styles.featureRow}>
            <Ionicons color="#067647" name="checkmark-circle" size={18} />
            <Text numberOfLines={2} style={[styles.featureText, { color: appTheme.secondaryText }]}>{feature}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff7fb" },
  screen: { flexGrow: 1, gap: FLOW_SIZE.sectionGap, paddingHorizontal: FLOW_SIZE.screenPadding, paddingTop: 10, paddingBottom: 30 },
  topBar: { paddingTop: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconButton: { width: 42, height: 42, borderRadius: 16, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  badge: { minHeight: 36, borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", paddingHorizontal: 11, flexDirection: "row", alignItems: "center", gap: 7 },
  badgeText: { color: "#ec0e68", fontFamily: MOBILE_FONT.semibold, fontSize: FLOW_SIZE.caption, textTransform: "uppercase" },
  heroCard: { gap: 10, alignItems: "center", borderRadius: FLOW_SIZE.cardRadius, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", padding: FLOW_SIZE.cardPadding },
  crown: { width: 50, height: 50, borderRadius: 18, backgroundColor: "#fff0f6", alignItems: "center", justifyContent: "center" },
  heroTitle: { color: "#101828", fontFamily: MOBILE_FONT.bold, fontSize: FLOW_SIZE.headerTitle, lineHeight: FLOW_SIZE.headerTitleLine, textAlign: "center" },
  heroCopy: { color: "#667085", fontFamily: MOBILE_FONT.regular, textAlign: "center", fontSize: FLOW_SIZE.body, lineHeight: FLOW_SIZE.bodyLine },
  usageCard: { alignSelf: "stretch", minHeight: 56, borderRadius: 18, backgroundColor: "#fff7fb", borderWidth: 1, borderColor: "#fbcfe8", padding: 11, justifyContent: "center", gap: 3 },
  usageLabel: { color: "#667085", fontFamily: MOBILE_FONT.medium, fontSize: FLOW_SIZE.caption, textTransform: "uppercase" },
  usageValue: { color: "#101828", fontFamily: MOBILE_FONT.semibold, fontSize: FLOW_SIZE.body },
  billingTabs: { height: 42, flexDirection: "row", borderRadius: 16, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", padding: 3 },
  billingActive: { flex: 1, borderRadius: 6, backgroundColor: "#ec0e68", color: "#ffffff", textAlign: "center", textAlignVertical: "center", fontFamily: MOBILE_FONT.semibold, fontSize: FLOW_SIZE.body },
  billingInactive: { flex: 1, color: "#667085", textAlign: "center", textAlignVertical: "center", fontFamily: MOBILE_FONT.semibold, fontSize: FLOW_SIZE.body },
  planGrid: { gap: 12 },
  planCard: { gap: 12, borderRadius: FLOW_SIZE.cardRadius, borderWidth: 1, borderColor: "#eaecf0", backgroundColor: "#ffffff", padding: FLOW_SIZE.cardPadding },
  proCard: { borderColor: "#fbcfe8", backgroundColor: "#fff1f7" },
  planHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  planName: { color: "#101828", fontFamily: MOBILE_FONT.semibold, fontSize: FLOW_SIZE.sectionTitle },
  activeBadge: { overflow: "hidden", borderRadius: 12, backgroundColor: "#dcfae6", color: "#067647", paddingHorizontal: 8, paddingVertical: 4, fontFamily: MOBILE_FONT.semibold, fontSize: FLOW_SIZE.caption, flexShrink: 0 },
  price: { color: "#101828", fontFamily: MOBILE_FONT.bold, fontSize: 22, lineHeight: 27, marginTop: 3 },
  featureList: { gap: 9 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  featureText: { flex: 1, minWidth: 0, color: "#344054", fontFamily: MOBILE_FONT.medium, fontSize: FLOW_SIZE.body, lineHeight: FLOW_SIZE.bodyLine },
  noticeCard: { minHeight: 78, borderRadius: 18, borderWidth: 1, borderColor: "#fedf89", backgroundColor: "#fffaeb", padding: 13, flexDirection: "row", gap: 10 },
  noticeCopy: { flex: 1, minWidth: 0, gap: 3 },
  noticeTitle: { color: "#7a2e0e", fontFamily: MOBILE_FONT.semibold, fontSize: FLOW_SIZE.sectionTitle },
  noticeText: { color: "#7a2e0e", fontFamily: MOBILE_FONT.regular, fontSize: FLOW_SIZE.body, lineHeight: FLOW_SIZE.bodyLine },
  disabledButton: { height: FLOW_SIZE.buttonHeight, borderRadius: FLOW_SIZE.compactRadius, backgroundColor: "#ec0e68", opacity: 0.65, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 16 },
  disabledButtonText: { color: "#ffffff", fontFamily: MOBILE_FONT.semibold, fontSize: 13 },
  error: { color: "#b42318", fontFamily: MOBILE_FONT.regular, lineHeight: 20 }
});
