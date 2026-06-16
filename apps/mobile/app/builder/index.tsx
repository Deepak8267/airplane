import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useBuilderStore } from "@/stores/builder-store";

export default function BuilderScreen() {
  const draft = useBuilderStore((state) => state.draft);
  const updateDraft = useBuilderStore((state) => state.updateDraft);

  if (!draft) {
    return (
      <View style={styles.empty}>
        <Text style={styles.title}>Pick a template first.</Text>
        <Pressable style={styles.button} onPress={() => router.replace("/home")}>
          <Text style={styles.buttonText}>Go to templates</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.eyebrow}>Builder</Text>
      <Text style={styles.title}>Personalize the experience.</Text>
      <Field label="Title" value={draft.title} onChangeText={(title) => updateDraft({ title })} />
      <Field label="Recipient name" value={draft.recipientName} onChangeText={(recipientName) => updateDraft({ recipientName })} />
      <Field label="Message" value={draft.message} onChangeText={(message) => updateDraft({ message })} multiline />

      <View style={styles.pages}>
        <Text style={styles.sectionTitle}>Pages</Text>
        {draft.pages.map((page, index) => (
          <View key={`${page.pageType}-${index}`} style={styles.pageRow}>
            <Text style={styles.pageType}>{page.pageType}</Text>
            <Text style={styles.pageTitle}>{page.title}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.secondaryButton} onPress={() => router.push("/preview/current")}>
          <Text style={styles.secondaryButtonText}>Preview</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => router.push("/publish")}>
          <Text style={styles.buttonText}>Publish</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Field(props: { label: string; value: string; onChangeText: (value: string) => void; multiline?: boolean }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        multiline={props.multiline}
        onChangeText={props.onChangeText}
        style={[styles.input, props.multiline ? styles.textarea : null]}
        value={props.value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 20, gap: 16 },
  empty: { flex: 1, padding: 20, justifyContent: "center", gap: 16 },
  eyebrow: { color: "#2563eb", fontSize: 13, fontWeight: "800", textTransform: "uppercase" },
  title: { fontSize: 30, lineHeight: 36, fontWeight: "900", color: "#101828" },
  field: { gap: 7 },
  label: { color: "#344054", fontWeight: "800" },
  input: { minHeight: 50, borderWidth: 1, borderColor: "#d0d5dd", borderRadius: 8, paddingHorizontal: 13, backgroundColor: "#ffffff", fontSize: 16, color: "#101828" },
  textarea: { minHeight: 112, paddingTop: 12, textAlignVertical: "top" },
  pages: { gap: 10 },
  sectionTitle: { color: "#101828", fontSize: 18, fontWeight: "900" },
  pageRow: { padding: 14, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#eaecf0", borderRadius: 8, gap: 4 },
  pageType: { color: "#2563eb", fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  pageTitle: { color: "#101828", fontWeight: "800", fontSize: 16 },
  actions: { flexDirection: "row", gap: 10 },
  button: { flex: 1, height: 52, borderRadius: 8, backgroundColor: "#101828", justifyContent: "center", alignItems: "center" },
  buttonText: { color: "#ffffff", fontWeight: "800" },
  secondaryButton: { flex: 1, height: 52, borderRadius: 8, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#d0d5dd", justifyContent: "center", alignItems: "center" },
  secondaryButtonText: { color: "#101828", fontWeight: "800" }
});
