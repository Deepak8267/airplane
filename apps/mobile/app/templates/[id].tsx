import { router, useLocalSearchParams } from "expo-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { createDraftExperience } from "@/features/experiences/experience-service";
import { getTemplateById } from "@/features/templates/template-service";
import { useBuilderStore } from "@/stores/builder-store";

export default function TemplateDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const templateQuery = useQuery({
    queryKey: ["template", id],
    queryFn: () => getTemplateById(id),
    enabled: Boolean(id)
  });
  const startFromExperience = useBuilderStore((state) => state.startFromExperience);
  const createDraftMutation = useMutation({
    mutationFn: createDraftExperience,
    onSuccess: ({ experience, pages }) => {
      startFromExperience(experience, pages);
      router.push("/builder");
    }
  });

  function start() {
    if (templateQuery.data) {
      createDraftMutation.mutate(templateQuery.data);
    }
  }

  if (templateQuery.isLoading) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>Loading template...</Text>
      </View>
    );
  }

  if (!templateQuery.data) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>Template unavailable</Text>
        <Text style={styles.copy}>{templateQuery.error instanceof Error ? templateQuery.error.message : "Try another template."}</Text>
      </View>
    );
  }

  const template = templateQuery.data;
  const disabled = createDraftMutation.isPending;

  return (
    <View style={[styles.screen, { backgroundColor: template.defaultTheme.background }]}>
      <View style={styles.panel}>
        <Text style={styles.category}>{template.category}</Text>
        <Text style={styles.title}>{template.name}</Text>
        <Text style={styles.copy}>{template.description}</Text>
        <Text style={styles.meta}>{template.defaultPages.length} pages included</Text>
        {createDraftMutation.error instanceof Error ? <Text style={styles.error}>{createDraftMutation.error.message}</Text> : null}
        <Pressable style={[styles.button, { backgroundColor: template.defaultTheme.accent, opacity: disabled ? 0.7 : 1 }]} onPress={start} disabled={disabled}>
          <Text style={styles.buttonText}>{disabled ? "Creating draft..." : "Use template"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20, justifyContent: "center" },
  panel: { gap: 14, padding: 20, backgroundColor: "#ffffff", borderRadius: 8, borderWidth: 1, borderColor: "#eaecf0" },
  category: { fontSize: 13, color: "#2563eb", fontWeight: "800", textTransform: "uppercase" },
  title: { fontSize: 32, lineHeight: 38, color: "#101828", fontWeight: "900" },
  copy: { fontSize: 16, lineHeight: 23, color: "#475467" },
  meta: { color: "#667085", fontWeight: "700" },
  error: { color: "#b42318", lineHeight: 20 },
  button: { height: 52, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  buttonText: { color: "#ffffff", fontSize: 16, fontWeight: "800" }
});
