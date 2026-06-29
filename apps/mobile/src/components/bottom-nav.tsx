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

export function BottomNav({ active }: { active: BottomNavKey }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.shell, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.nav}>
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
              <Text style={[styles.label, selected ? styles.activeLabel : null]}>{item.label}</Text>
            </Pressable>
          );
        })}
        <Pressable accessibilityLabel="Create experience" style={styles.createButton} onPress={() => router.push("/templates" as never)}>
          <Ionicons color="#ffffff" name="add" size={32} />
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
              <Text style={[styles.label, selected ? styles.activeLabel : null]}>{item.label}</Text>
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
    paddingHorizontal: 14,
    paddingTop: 0
  },
  nav: {
    height: 80,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: BORDER,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 8,
    shadowColor: "#111827",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 4,
    paddingVertical: 4
  },
  createButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -30,
    borderWidth: 5,
    borderColor: "#fff7fb",
    shadowColor: PRIMARY,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  label: { color: TEXT_MUTED, fontFamily: FONT_MEDIUM, fontSize: 11, lineHeight: 14, textAlign: "center" },
  activeLabel: { color: PRIMARY }
});
