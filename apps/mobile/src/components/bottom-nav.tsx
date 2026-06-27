import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type BottomNavKey = "home" | "library";

const NAV_ITEMS: Array<{
  key: BottomNavKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  route: "/home" | "/experiences";
}> = [
  { key: "home", label: "Home", icon: "home-outline", activeIcon: "home", route: "/home" },
  { key: "library", label: "Library", icon: "albums-outline", activeIcon: "albums", route: "/experiences" }
];

export function BottomNav({ active }: { active: BottomNavKey }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.shell, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const selected = item.key === active;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected }}
              key={item.key}
              onPress={() => router.push(item.route as never)}
              style={[styles.item, selected ? styles.activeItem : null]}
            >
              <Ionicons color={selected ? "#ffffff" : "#667085"} name={selected ? item.activeIcon : item.icon} size={21} />
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
    borderTopWidth: 1,
    borderTopColor: "#eaecf0",
    backgroundColor: "#ffffff",
    paddingHorizontal: 18,
    paddingTop: 10
  },
  nav: {
    minHeight: 58,
    borderRadius: 8,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#eaecf0",
    flexDirection: "row",
    gap: 8,
    padding: 6
  },
  item: {
    flex: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 10
  },
  activeItem: { backgroundColor: "#101828" },
  label: { color: "#667085", fontSize: 13, fontWeight: "900" },
  activeLabel: { color: "#ffffff" }
});
