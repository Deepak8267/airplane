import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useMutation } from "@tanstack/react-query";
import type { ExperiencePageDraft, PageContent } from "@airplane/shared";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { updateDraftExperience, uploadCoverPhoto } from "@/features/experiences/experience-service";
import { useBuilderStore } from "@/stores/builder-store";

export default function BuilderScreen() {
  const draft = useBuilderStore((state) => state.draft);
  const updateDraft = useBuilderStore((state) => state.updateDraft);
  const updatePage = useBuilderStore((state) => state.updatePage);
  const saveMutation = useMutation({
    mutationFn: updateDraftExperience,
    onSuccess: () => router.push("/publish")
  });
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!draft?.experienceId) {
        throw new Error("Create the draft before uploading a cover photo.");
      }

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        throw new Error("Photo library permission is required to choose a cover photo.");
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 5],
        mediaTypes: ["images"],
        quality: 0.85
      });

      if (result.canceled || !result.assets[0]) {
        return null;
      }

      return uploadCoverPhoto(draft.experienceId, result.assets[0].uri);
    },
    onSuccess: (coverPhotoUrl) => {
      if (coverPhotoUrl) {
        updateDraft({ coverPhotoUrl });
      }
    }
  });

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

      <View style={styles.coverPanel}>
        <View style={styles.coverPreview}>
          {draft.coverPhotoUrl ? (
            <Image source={{ uri: draft.coverPhotoUrl }} style={styles.coverImage} />
          ) : (
            <Text style={styles.coverPlaceholder}>Cover photo</Text>
          )}
        </View>
        <Pressable
          disabled={uploadMutation.isPending}
          style={[styles.secondaryButton, { opacity: uploadMutation.isPending ? 0.7 : 1 }]}
          onPress={() => uploadMutation.mutate()}
        >
          <Text style={styles.secondaryButtonText}>{uploadMutation.isPending ? "Uploading..." : "Choose photo"}</Text>
        </Pressable>
        {uploadMutation.error instanceof Error ? <Text style={styles.error}>{uploadMutation.error.message}</Text> : null}
      </View>

      <View style={styles.pages}>
        <Text style={styles.sectionTitle}>Pages</Text>
        {draft.pages.map((page, index) => (
          <PageEditor
            index={index}
            key={`${page.pageType}-${index}`}
            onChange={(patch) => updatePage(index, patch)}
            page={page}
          />
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.secondaryButton} onPress={() => router.push("/preview/current")}>
          <Text style={styles.secondaryButtonText}>Preview</Text>
        </Pressable>
        <Pressable
          style={[styles.button, { opacity: saveMutation.isPending ? 0.7 : 1 }]}
          onPress={() => {
            if (!draft.experienceId) {
              return;
            }

            saveMutation.mutate({
              id: draft.experienceId,
              title: draft.title,
              recipientName: draft.recipientName,
              message: draft.message,
              coverPhotoUrl: draft.coverPhotoUrl,
              theme: draft.theme,
              pages: draft.pages
            });
          }}
          disabled={saveMutation.isPending}
        >
          <Text style={styles.buttonText}>{saveMutation.isPending ? "Saving..." : "Publish"}</Text>
        </Pressable>
      </View>
      {saveMutation.error instanceof Error ? <Text style={styles.error}>{saveMutation.error.message}</Text> : null}
    </ScrollView>
  );
}

function PageEditor({
  index,
  onChange,
  page
}: {
  index: number;
  onChange: (patch: Partial<ExperiencePageDraft>) => void;
  page: ExperiencePageDraft;
}) {
  const updateContent = (patch: Partial<PageContent>) => onChange({ content: { ...page.content, ...patch } });

  return (
    <View style={styles.pageEditor}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageNumber}>Page {index + 1}</Text>
        <Text style={styles.pageType}>{formatPageType(page.pageType)}</Text>
      </View>
      <Field label="Page title" value={page.title} onChangeText={(title) => onChange({ title })} />

      {page.pageType === "quiz" ? (
        <>
          <Field label="Question" value={page.content.question ?? ""} onChangeText={(question) => updateContent({ question })} multiline />
          {(page.content.answers ?? []).map((answer, answerIndex) => (
            <Field
              key={answer.id}
              label={`Answer ${answerIndex + 1}`}
              value={answer.label}
              onChangeText={(label) =>
                updateContent({
                  answers: (page.content.answers ?? []).map((item, itemIndex) =>
                    itemIndex === answerIndex ? { ...item, label } : item
                  )
                })
              }
            />
          ))}
        </>
      ) : null}

      {page.pageType === "proposal" ? (
        <Field label="Question" value={page.content.question ?? ""} onChangeText={(question) => updateContent({ question })} multiline />
      ) : null}

      {page.pageType === "final" ? (
        <Field label="Final message" value={page.content.finalMessage ?? ""} onChangeText={(finalMessage) => updateContent({ finalMessage })} multiline />
      ) : null}

      {page.pageType === "countdown" ? (
        <>
          <Field label="Message" value={page.content.body ?? ""} onChangeText={(body) => updateContent({ body })} multiline />
          <Field label="Target date (ISO)" value={page.content.targetDate ?? ""} onChangeText={(targetDate) => updateContent({ targetDate })} />
        </>
      ) : null}

      {page.pageType === "cover" || page.pageType === "memory" ? (
        <Field label="Body" value={page.content.body ?? ""} onChangeText={(body) => updateContent({ body })} multiline />
      ) : null}

      {page.pageType !== "proposal" && page.pageType !== "final" ? (
        <Field label="Button label" value={page.content.ctaLabel ?? ""} onChangeText={(ctaLabel) => updateContent({ ctaLabel })} />
      ) : null}
    </View>
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

function formatPageType(pageType: ExperiencePageDraft["pageType"]) {
  return pageType.charAt(0).toUpperCase() + pageType.slice(1);
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
  coverPanel: { gap: 10 },
  coverPreview: { height: 220, borderRadius: 8, borderWidth: 1, borderColor: "#eaecf0", overflow: "hidden", backgroundColor: "#f2f4f7", alignItems: "center", justifyContent: "center" },
  coverImage: { width: "100%", height: "100%" },
  coverPlaceholder: { color: "#667085", fontWeight: "800" },
  pages: { gap: 10 },
  sectionTitle: { color: "#101828", fontSize: 18, fontWeight: "900" },
  pageEditor: { padding: 14, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#eaecf0", borderRadius: 8, gap: 12 },
  pageHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pageNumber: { color: "#101828", fontWeight: "900", fontSize: 16 },
  pageType: { color: "#2563eb", fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  actions: { flexDirection: "row", gap: 10 },
  button: { flex: 1, height: 52, borderRadius: 8, backgroundColor: "#101828", justifyContent: "center", alignItems: "center" },
  buttonText: { color: "#ffffff", fontWeight: "800" },
  secondaryButton: { flex: 1, height: 52, borderRadius: 8, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#d0d5dd", justifyContent: "center", alignItems: "center" },
  secondaryButtonText: { color: "#101828", fontWeight: "800" },
  error: { color: "#b42318", lineHeight: 20 }
});
