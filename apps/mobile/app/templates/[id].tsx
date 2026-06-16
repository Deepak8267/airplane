import { router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { templateFixtures } from "@/features/templates/template-fixtures";
import { useBuilderStore } from "@/stores/builder-store";

export default function TemplateDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const template = templateFixtures.find((item) => item.id === id) ?? getFallbackTemplate();
  const startFromTemplate = useBuilderStore((state) => state.startFromTemplate);

  function start() {
    startFromTemplate(template);
    router.push("/builder");
  }

  return (
    <View style={[styles.screen, { backgroundColor: template.defaultTheme.background }]}>
      <View style={styles.panel}>
        <Text style={styles.category}>{template.category}</Text>
        <Text style={styles.title}>{template.name}</Text>
        <Text style={styles.copy}>{template.description}</Text>
        <Text style={styles.meta}>{template.defaultPages.length} pages included</Text>
        <Pressable style={[styles.button, { backgroundColor: template.defaultTheme.accent }]} onPress={start}>
          <Text style={styles.buttonText}>Use template</Text>
        </Pressable>
      </View>
    </View>
  );
}

function getFallbackTemplate() {
  const template = templateFixtures[0];

  if (!template) {
    throw new Error("Template fixtures are empty.");
  }

  return template;
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20, justifyContent: "center" },
  panel: { gap: 14, padding: 20, backgroundColor: "#ffffff", borderRadius: 8, borderWidth: 1, borderColor: "#eaecf0" },
  category: { fontSize: 13, color: "#2563eb", fontWeight: "800", textTransform: "uppercase" },
  title: { fontSize: 32, lineHeight: 38, color: "#101828", fontWeight: "900" },
  copy: { fontSize: 16, lineHeight: 23, color: "#475467" },
  meta: { color: "#667085", fontWeight: "700" },
  button: { height: 52, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  buttonText: { color: "#ffffff", fontSize: 16, fontWeight: "800" }
});
