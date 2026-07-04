import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PRIMARY = "#FF3D81";
const TEXT_MUTED = "#6B7280";
const BORDER = "#F3F4F6";
const FONT_MEDIUM = "Poppins_500Medium";

type BottomNavKey = "home" | "library" | "analytics" | "profile";

const NAV_ITEMS: Array<{
  key: BottomNavKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  route: "/home" | "/experiences" | "/analytics" | "/profile";
}> = [
  { key: "home", label: "Home", icon: "home-outline", activeIcon: "home", route: "/home" },
  { key: "library", label: "My Creations", icon: "folder-open-outline", activeIcon: "folder-open", route: "/experiences" },
  { key: "analytics", label: "Analytics", icon: "bar-chart-outline", activeIcon: "bar-chart", route: "/analytics" },
  { key: "profile", label: "Profile", icon: "person-outline", activeIcon: "person", route: "/profile" }
];

export function BottomNav({ active, variant = "compact" }: { active: BottomNavKey; variant?: "compact" | "main" }) {
  const insets = useSafeAreaInsets();
  const isMain = variant === "main";

  return (
    <View style={[styles.shell, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={[styles.nav, isMain ? styles.navMain : null]}>
        {NAV_ITEMS.slice(0, 2).map((item) => {
          const selected = item.key === active;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={item.key}
              onPress={() => router.push(item.route as never)}
              style={styles.item}
            >
              <Ionicons color={selected ? PRIMARY : TEXT_MUTED} name={selected ? item.activeIcon : item.icon} size={21} />
              <Text adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={1} style={[styles.label, selected ? styles.activeLabel : null]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
        <Pressable accessibilityLabel="Create experience" style={[styles.createButton, isMain ? styles.createButtonMain : null]} onPress={() => router.push("/templates" as never)}>
          <Ionicons color="#ffffff" name="add" size={isMain ? 36 : 32} />
        </Pressable>
        {NAV_ITEMS.slice(2).map((item) => {
          const selected = item.key === active;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={item.key}
              onPress={() => router.push(item.route as never)}
              style={styles.item}
            >
              <Ionicons color={selected ? PRIMARY : TEXT_MUTED} name={selected ? item.activeIcon : item.icon} size={21} />
              <Text adjustsFontSizeToFit minimumFontScale={0.78} numberOfLines={1} style={[styles.label, selected ? styles.activeLabel : null]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: "transparent",
    paddingHorizontal: 12,
    paddingTop: 0
  },
  nav: {
    height: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 6,
    shadowColor: "#111827",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  navMain: {
    height: 66,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22
  },
  item: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: 4,
    paddingVertical: 4
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -24,
    flexShrink: 0,
    borderWidth: 5,
    borderColor: "#fff7fb",
    shadowColor: PRIMARY,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  createButtonMain: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginTop: -28
  },
  label: { color: TEXT_MUTED, fontFamily: FONT_MEDIUM, fontSize: 9, lineHeight: 12, textAlign: "center" },
  activeLabel: { color: PRIMARY }
});
