import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { getPlanUsage } from "@/features/subscriptions/subscription-service";

const PRO_FEATURES = ["Unlimited experiences", "Premium templates", "Remove watermark", "Advanced analytics", "Priority support"];

export default function SubscriptionScreen() {
  const planQuery = useQuery({ queryKey: ["plan-usage"], queryFn: getPlanUsage });
  const usage = planQuery.data;

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Header title="Subscription" subtitle="Choose the plan for your creator workflow." />

      <View style={styles.heroCard}>
        <View style={styles.crown}>
          <Ionicons color="#ec0e68" name="diamond-outline" size={30} />
        </View>
        <Text style={styles.heroTitle}>Unlock Pro</Text>
        <Text style={styles.heroCopy}>Create unlimited personalized experiences and remove AIRPLANE branding.</Text>
        <View style={styles.billingTabs}>
          <Text style={styles.billingActive}>Monthly</Text>
          <Text style={styles.billingInactive}>Yearly soon</Text>
        </View>
      </View>

      <View style={styles.planGrid}>
        <PlanCard
          active={usage?.plan !== "pro"}
          name="Free"
          price="₹0"
          features={["3 active experiences", "AIRPLANE watermark", "Basic templates"]}
        />
        <PlanCard active={usage?.plan === "pro"} name="Pro" price="₹199/mo" features={PRO_FEATURES} highlighted />
      </View>

      <Pressable disabled style={styles.disabledButton}>
        <Ionicons color="#ffffff" name="card-outline" size={20} />
        <Text style={styles.disabledButtonText}>Razorpay coming soon</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
        <Text style={styles.secondaryButtonText}>Back</Text>
      </Pressable>
    </ScrollView>
  );
}

function Header({ subtitle, title }: { subtitle: string; title: string }) {
  return (
    <View style={styles.header}>
      <Text style={styles.eyebrow}>AIRPLANE</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

function PlanCard({ active, features, highlighted = false, name, price }: { active?: boolean; features: string[]; highlighted?: boolean; name: string; price: string }) {
  return (
    <View style={[styles.planCard, highlighted ? styles.proCard : null]}>
      <View style={styles.planHeader}>
        <Text style={styles.planName}>{name}</Text>
        {active ? <Text style={styles.activeBadge}>Current</Text> : null}
      </View>
      <Text style={styles.price}>{price}</Text>
      {features.map((feature) => (
        <View key={feature} style={styles.featureRow}>
          <Ionicons color="#067647" name="checkmark-circle" size={18} />
          <Text style={styles.featureText}>{feature}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, gap: 16, padding: 20, backgroundColor: "#fff7fb" },
  header: { gap: 6, paddingTop: 8 },
  eyebrow: { color: "#ec0e68", fontSize: 13, fontWeight: "900", textTransform: "uppercase" },
  title: { color: "#101828", fontSize: 32, lineHeight: 38, fontWeight: "900" },
  subtitle: { color: "#667085", fontSize: 15, lineHeight: 22 },
  heroCard: { gap: 12, alignItems: "center", borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#ffffff", padding: 18 },
  crown: { width: 58, height: 58, borderRadius: 8, backgroundColor: "#fff1f7", alignItems: "center", justifyContent: "center" },
  heroTitle: { color: "#101828", fontSize: 26, fontWeight: "900" },
  heroCopy: { color: "#667085", textAlign: "center", lineHeight: 21 },
  billingTabs: { height: 40, flexDirection: "row", borderRadius: 8, borderWidth: 1, borderColor: "#fbcfe8", backgroundColor: "#fff7fb", padding: 3 },
  billingActive: { minWidth: 104, borderRadius: 6, backgroundColor: "#ec0e68", color: "#ffffff", textAlign: "center", textAlignVertical: "center", fontWeight: "900" },
  billingInactive: { minWidth: 104, color: "#667085", textAlign: "center", textAlignVertical: "center", fontWeight: "900" },
  planGrid: { gap: 12 },
  planCard: { gap: 10, borderRadius: 8, borderWidth: 1, borderColor: "#eaecf0", backgroundColor: "#ffffff", padding: 15 },
  proCard: { borderColor: "#fbcfe8", backgroundColor: "#fff1f7" },
  planHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  planName: { color: "#101828", fontSize: 18, fontWeight: "900" },
  activeBadge: { overflow: "hidden", borderRadius: 8, backgroundColor: "#dcfae6", color: "#067647", paddingHorizontal: 8, paddingVertical: 4, fontSize: 11, fontWeight: "900" },
  price: { color: "#101828", fontSize: 27, fontWeight: "900" },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  featureText: { color: "#344054", fontWeight: "800" },
  disabledButton: { height: 54, borderRadius: 8, backgroundColor: "#ec0e68", opacity: 0.65, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  disabledButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "900" },
  secondaryButton: { height: 50, borderRadius: 8, borderWidth: 1, borderColor: "#d0d5dd", backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center" },
  secondaryButtonText: { color: "#101828", fontWeight: "900" }
});
