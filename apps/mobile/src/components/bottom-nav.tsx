import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
              <Ionicons color={selected ? "#ec0e68" : "#475467"} name={selected ? item.activeIcon : item.icon} size={23} />
              <Text style={[styles.label, selected ? styles.activeLabel : null]}>{item.label}</Text>
            </Pressable>
          );
        })}
        <Pressable accessibilityLabel="Create experience" style={styles.createButton} onPress={() => router.push("/templates" as never)}>
          <Ionicons color="#ffffff" name="add" size={38} />
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
              <Ionicons color={selected ? "#ec0e68" : "#475467"} name={selected ? item.activeIcon : item.icon} size={23} />
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
    paddingHorizontal: 12,
    paddingTop: 4
  },
  nav: {
    minHeight: 60,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#eaecf0",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 6,
    shadowColor: "#101828",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 }
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 4,
    paddingVertical: 6
  },
  createButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#ec0e68",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -25,
    borderWidth: 5,
    borderColor: "#fff7fb",
    shadowColor: "#ec0e68",
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 }
  },
  label: { color: "#475467", fontSize: 9, fontWeight: "800", textAlign: "center" },
  activeLabel: { color: "#ec0e68" }
});
