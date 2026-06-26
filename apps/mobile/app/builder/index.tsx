import { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useMutation } from "@tanstack/react-query";
import { EXPERIENCE_THEMES } from "@airplane/shared";
import type { ExperiencePageDraft, ExperiencePageType, PageContent, Theme } from "@airplane/shared";
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { validateBuilderDraft } from "@/features/experiences/builder-validation";
import { updateDraftExperience, uploadCoverPhoto, uploadPagePhoto } from "@/features/experiences/experience-service";
import type { ExperienceDraftInput } from "@/features/experiences/experience-service";
import { useBuilderStore } from "@/stores/builder-store";
import type { BuilderDraft } from "@/stores/builder-store";

type AutosaveState = { status: "saved" | "pending" | "saving" | "error"; error?: string };
type PickedImage = { contentType?: string | undefined; uri: string };

export default function BuilderScreen() {
  const [pagePickerVisible, setPagePickerVisible] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [autosaveState, setAutosaveState] = useState<AutosaveState>({ status: "saved" });
  const autosaveQueue = useRef<Promise<void>>(Promise.resolve());
  const autosaveRevision = useRef(0);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedExperience = useRef<string | null>(null);
  const draft = useBuilderStore((state) => state.draft);
  const updateDraft = useBuilderStore((state) => state.updateDraft);
  const updatePage = useBuilderStore((state) => state.updatePage);
  const addPage = useBuilderStore((state) => state.addPage);
  const removePage = useBuilderStore((state) => state.removePage);
  const movePage = useBuilderStore((state) => state.movePage);
  const saveMutation = useMutation({
    mutationFn: async (input: ExperienceDraftInput) => {
      await autosaveQueue.current.catch(() => undefined);
      return updateDraftExperience(input);
    },
    onSuccess: () => router.push("/publish")
  });
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!draft?.experienceId) {
        throw new Error("Create the draft before uploading a cover photo.");
      }

      const image = await pickImage({ aspect: [4, 5] });
      if (!image) {
        return null;
      }

      return uploadCoverPhoto(draft.experienceId, image.uri, image.contentType);
    },
    onSuccess: (coverPhotoUrl) => {
      if (coverPhotoUrl) {
        updateDraft({ coverPhotoUrl });
      }
    }
  });
  const pagePhotoMutation = useMutation({
    mutationFn: async ({ contentType, pageIndex, uri }: { contentType?: string | undefined; pageIndex: number; uri: string }) => {
      if (!draft?.experienceId) {
        throw new Error("Create the draft before uploading a page photo.");
      }

      const publicUrl = await uploadPagePhoto(draft.experienceId, pageIndex, uri, contentType);
      return { pageIndex, publicUrl };
    },
    onSuccess: ({ pageIndex, publicUrl }) => updatePage(pageIndex, { mediaUrls: [publicUrl] })
  });
  const validation = draft ? validateBuilderDraft(draft) : null;
  const visibleValidation = showValidation ? validation : null;

  useEffect(() => {
    if (!draft?.experienceId) {
      return;
    }

    if (initializedExperience.current !== draft.experienceId) {
      initializedExperience.current = draft.experienceId;
      setAutosaveState({ status: "saved" });
      return;
    }

    const revision = ++autosaveRevision.current;
    const input = toDraftInput(draft);
    setAutosaveState({ status: "pending" });
    autosaveTimer.current = setTimeout(() => {
      setAutosaveState({ status: "saving" });
      const save = autosaveQueue.current
        .catch(() => undefined)
        .then(async () => {
          await updateDraftExperience(input);
        });
      autosaveQueue.current = save.catch(() => undefined);
      void save
        .then(() => {
          if (autosaveRevision.current === revision) {
            setAutosaveState({ status: "saved" });
          }
        })
        .catch((error: unknown) => {
          if (autosaveRevision.current === revision) {
            setAutosaveState({ status: "error", error: error instanceof Error ? error.message : "Autosave failed." });
          }
        });
    }, 1200);

    return () => {
      if (autosaveTimer.current) {
        clearTimeout(autosaveTimer.current);
        autosaveTimer.current = null;
      }
    };
  }, [draft]);

  function openPreview() {
    if (!validation?.isValid) {
      setShowValidation(true);
      return;
    }

    router.push("/preview/current");
  }

  function saveAndContinue() {
    if (!draft?.experienceId || !validation?.isValid) {
      setShowValidation(true);
      return;
    }

    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current);
      autosaveTimer.current = null;
    }

    autosaveRevision.current += 1;
    saveMutation.mutate(toDraftInput(draft));
  }

  async function choosePagePhoto(pageIndex: number) {
    const image = await pickImage({ aspect: [4, 3] });
    if (!image) {
      return;
    }

    pagePhotoMutation.mutate({ contentType: image.contentType, pageIndex, uri: image.uri });
  }

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
      <View style={styles.builderMeta}>
        <Text style={styles.eyebrow}>Builder</Text>
        <AutosaveStatus state={autosaveState} />
      </View>
      <Text style={styles.title}>Personalize the experience.</Text>
      <Field error={visibleValidation?.title} label="Title" value={draft.title} onChangeText={(title) => updateDraft({ title })} />
      <Field error={visibleValidation?.recipientName} label="Recipient name" value={draft.recipientName} onChangeText={(recipientName) => updateDraft({ recipientName })} />
      <Field error={visibleValidation?.message} label="Message" value={draft.message} onChangeText={(message) => updateDraft({ message })} multiline />
      <ThemePicker selectedTheme={draft.theme} onSelect={(theme) => updateDraft({ theme })} />

      <View style={styles.coverPanel}>
        <View style={styles.coverPreview}>
          {draft.coverPhotoUrl ? (
            <Image source={{ uri: draft.coverPhotoUrl }} style={styles.coverImage} />
          ) : (
            <View style={styles.coverEmptyState}>
              <Ionicons color="#667085" name="image-outline" size={32} />
              <Text style={styles.coverPlaceholder}>Cover photo</Text>
            </View>
          )}
        </View>
        <View style={styles.photoActionRow}>
          <Pressable
            disabled={uploadMutation.isPending}
            style={[styles.secondaryButton, { opacity: uploadMutation.isPending ? 0.7 : 1 }]}
            onPress={() => uploadMutation.mutate()}
          >
            <Ionicons color="#101828" name="image-outline" size={19} />
            <Text style={styles.secondaryButtonText}>{uploadMutation.isPending ? "Uploading..." : draft.coverPhotoUrl ? "Replace cover" : "Choose cover"}</Text>
          </Pressable>
          {draft.coverPhotoUrl ? (
            <Pressable accessibilityLabel="Remove cover photo" disabled={uploadMutation.isPending} style={styles.smallIconButton} onPress={() => updateDraft({ coverPhotoUrl: null })}>
              <Ionicons color="#b42318" name="trash-outline" size={19} />
            </Pressable>
          ) : null}
        </View>
        {uploadMutation.error instanceof Error ? <Text style={styles.error}>{uploadMutation.error.message}</Text> : null}
      </View>

      <View style={styles.pages}>
        <Text style={styles.sectionTitle}>Pages</Text>
        {draft.pages.map((page, index) => (
          <PageEditor
            index={index}
            key={`${page.pageType}-${index}`}
            canMoveDown={index < draft.pages.length - 1}
            canMoveUp={index > 0}
            canRemove={draft.pages.length > 1}
            onChange={(patch) => updatePage(index, patch)}
            onMoveDown={() => movePage(index, 1)}
            onMoveUp={() => movePage(index, -1)}
            onChoosePhoto={() => choosePagePhoto(index)}
            onRemove={() => removePage(index)}
            onRemovePhoto={() => updatePage(index, { mediaUrls: [] })}
            page={page}
            validationErrors={visibleValidation?.pageErrors[index] ?? []}
            photoError={pagePhotoMutation.variables?.pageIndex === index && pagePhotoMutation.error instanceof Error ? pagePhotoMutation.error.message : null}
            photoUploading={pagePhotoMutation.isPending && pagePhotoMutation.variables?.pageIndex === index}
          />
        ))}
        <Pressable style={styles.addPageButton} onPress={() => setPagePickerVisible(true)}>
          <Ionicons color="#2563eb" name="add-circle-outline" size={22} />
          <Text style={styles.addPageText}>Add page</Text>
        </Pressable>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.secondaryButton} onPress={openPreview}>
          <Text style={styles.secondaryButtonText}>Preview</Text>
        </Pressable>
        <Pressable
          style={[styles.button, { opacity: saveMutation.isPending ? 0.7 : 1 }]}
          onPress={saveAndContinue}
          disabled={saveMutation.isPending || autosaveState.status === "saving"}
        >
          <Text style={styles.buttonText}>{saveMutation.isPending || autosaveState.status === "saving" ? "Saving..." : "Publish"}</Text>
        </Pressable>
      </View>
      {saveMutation.error instanceof Error ? <Text style={styles.error}>{saveMutation.error.message}</Text> : null}
      {autosaveState.status === "error" ? <Text style={styles.error}>{autosaveState.error}</Text> : null}

      <Modal
        animationType="slide"
        onRequestClose={() => setPagePickerVisible(false)}
        transparent
        visible={pagePickerVisible}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pagePicker}>
            <View style={styles.pagePickerHeader}>
              <Text style={styles.pagePickerTitle}>Add a page</Text>
              <Pressable accessibilityLabel="Close page picker" style={styles.smallIconButton} onPress={() => setPagePickerVisible(false)}>
                <Ionicons color="#101828" name="close" size={22} />
              </Pressable>
            </View>
            {PAGE_TYPES.map((option) => (
              <Pressable
                key={option.type}
                style={styles.pageOption}
                onPress={() => {
                  addPage(option.type);
                  setPagePickerVisible(false);
                }}
              >
                <View style={styles.pageOptionIcon}>
                  <Ionicons color="#2563eb" name="document-text-outline" size={21} />
                </View>
                <View style={styles.pageOptionCopy}>
                  <Text style={styles.pageOptionTitle}>{option.label}</Text>
                  <Text style={styles.pageOptionDescription}>{option.description}</Text>
                </View>
                <Ionicons color="#667085" name="chevron-forward" size={20} />
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function ThemePicker({ onSelect, selectedTheme }: { onSelect: (theme: Theme) => void; selectedTheme: Theme }) {
  const themes = EXPERIENCE_THEMES.some((theme) => theme.id === selectedTheme.id)
    ? EXPERIENCE_THEMES
    : [selectedTheme, ...EXPERIENCE_THEMES];

  return (
    <View style={styles.themeSection}>
      <Text style={styles.sectionTitle}>Theme</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.themeList}>
        {themes.map((theme) => {
          const selected = theme.id === selectedTheme.id;

          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              key={theme.id}
              onPress={() => onSelect(theme)}
              style={[styles.themeOption, { backgroundColor: theme.background, borderColor: selected ? theme.accent : "#d0d5dd" }]}
            >
              <View style={styles.themeOptionHeader}>
                <Text numberOfLines={1} style={[styles.themeName, { color: theme.foreground }]}>{theme.name}</Text>
                {selected ? <Ionicons color={theme.accent} name="checkmark-circle" size={20} /> : null}
              </View>
              <View style={styles.themeSwatches}>
                <View style={[styles.themeSwatch, { backgroundColor: theme.accent }]} />
                <View style={[styles.themeSwatch, { backgroundColor: theme.muted }]} />
                <View style={[styles.themeSwatch, { backgroundColor: theme.foreground }]} />
              </View>
              <Text style={[styles.themeFont, { color: theme.foreground }]}>{formatFontName(theme.fontFamily)}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

async function pickImage({ aspect }: { aspect: [number, number] }): Promise<PickedImage | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert("Photo access needed", "Allow photo library access to add photos to this experience.");
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    aspect,
    mediaTypes: ["images"],
    quality: 0.82
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  return { contentType: result.assets[0].mimeType, uri: result.assets[0].uri };
}

function PageEditor({
  canMoveDown,
  canMoveUp,
  canRemove,
  index,
  onChange,
  onChoosePhoto,
  onMoveDown,
  onMoveUp,
  onRemove,
  onRemovePhoto,
  page,
  photoError,
  photoUploading,
  validationErrors
}: {
  canMoveDown: boolean;
  canMoveUp: boolean;
  canRemove: boolean;
  index: number;
  onChange: (patch: Partial<ExperiencePageDraft>) => void;
  onChoosePhoto: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onRemove: () => void;
  onRemovePhoto: () => void;
  page: ExperiencePageDraft;
  photoError: string | null;
  photoUploading: boolean;
  validationErrors: string[];
}) {
  const updateContent = (patch: Partial<PageContent>) => onChange({ content: { ...page.content, ...patch } });
  const quizAnswers = page.content.answers ?? [];

  function addQuizAnswer() {
    const nextIndex = quizAnswers.length + 1;
    updateContent({
      answers: [
        ...quizAnswers,
        {
          id: `${Date.now().toString(36)}-${nextIndex}`,
          label: `Answer ${nextIndex}`,
          isCorrect: quizAnswers.length === 0
        }
      ]
    });
  }

  function removeQuizAnswer(answerIndex: number) {
    if (quizAnswers.length <= 2) {
      return;
    }

    const removedAnswer = quizAnswers[answerIndex];
    const nextAnswers = quizAnswers.filter((_, indexToKeep) => indexToKeep !== answerIndex);

    updateContent({
      answers: nextAnswers.map((answer, indexToSet) => ({
        ...answer,
        isCorrect: removedAnswer?.isCorrect ? indexToSet === 0 : Boolean(answer.isCorrect)
      }))
    });
  }

  function setCountdownPreset(daysFromNow: number) {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(18, 0, 0, 0);
    updateContent({ targetDate: date.toISOString() });
  }

  return (
    <View style={[styles.pageEditor, validationErrors.length > 0 ? styles.pageEditorError : null]}>
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.pageNumber}>Page {index + 1}</Text>
          <Text style={styles.pageType}>{formatPageType(page.pageType)}</Text>
        </View>
        <View style={styles.pageControls}>
          <Pressable accessibilityLabel="Move page up" disabled={!canMoveUp} style={[styles.smallIconButton, !canMoveUp && styles.disabledControl]} onPress={onMoveUp}>
            <Ionicons color="#344054" name="chevron-up" size={20} />
          </Pressable>
          <Pressable accessibilityLabel="Move page down" disabled={!canMoveDown} style={[styles.smallIconButton, !canMoveDown && styles.disabledControl]} onPress={onMoveDown}>
            <Ionicons color="#344054" name="chevron-down" size={20} />
          </Pressable>
          <Pressable accessibilityLabel="Remove page" disabled={!canRemove} style={[styles.smallIconButton, !canRemove && styles.disabledControl]} onPress={onRemove}>
            <Ionicons color="#b42318" name="trash-outline" size={19} />
          </Pressable>
        </View>
      </View>
      <Field label="Page title" value={page.title} onChangeText={(title) => onChange({ title })} />

      {page.pageType === "memory" ? (
        <View style={styles.pagePhotoSection}>
          {page.mediaUrls[0] ? (
            <Image source={{ uri: page.mediaUrls[0] }} style={styles.pagePhoto} />
          ) : (
            <View style={styles.pagePhotoPlaceholder}>
              <Ionicons color="#667085" name="image-outline" size={28} />
              <Text style={styles.coverPlaceholder}>Memory photo</Text>
            </View>
          )}
          <View style={styles.pagePhotoActions}>
            <Pressable disabled={photoUploading} style={styles.photoButton} onPress={onChoosePhoto}>
              <Ionicons color="#175cd3" name="image-outline" size={19} />
              <Text style={styles.photoButtonText}>{photoUploading ? "Uploading..." : page.mediaUrls[0] ? "Replace" : "Choose photo"}</Text>
            </Pressable>
            {page.mediaUrls[0] ? (
              <Pressable accessibilityLabel="Remove page photo" style={styles.smallIconButton} onPress={onRemovePhoto}>
                <Ionicons color="#b42318" name="trash-outline" size={19} />
              </Pressable>
            ) : null}
          </View>
          {photoError ? <Text style={styles.error}>{photoError}</Text> : null}
        </View>
      ) : null}

      {page.pageType === "quiz" ? (
        <>
          <Field label="Question" value={page.content.question ?? ""} onChangeText={(question) => updateContent({ question })} multiline />
          {quizAnswers.map((answer, answerIndex) => (
            <View key={answer.id} style={styles.answerEditor}>
              <View style={styles.answerHeader}>
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ selected: Boolean(answer.isCorrect) }}
                  style={[styles.correctAnswerButton, answer.isCorrect ? styles.correctAnswerSelected : null]}
                  onPress={() =>
                    updateContent({
                      answers: quizAnswers.map((item, itemIndex) => ({
                        ...item,
                        isCorrect: itemIndex === answerIndex
                      }))
                    })
                  }
                >
                  <Ionicons color={answer.isCorrect ? "#067647" : "#667085"} name={answer.isCorrect ? "radio-button-on" : "radio-button-off"} size={20} />
                  <Text style={[styles.correctAnswerText, answer.isCorrect ? styles.correctAnswerTextSelected : null]}>Correct</Text>
                </Pressable>
                <Pressable
                  accessibilityLabel={`Remove answer ${answerIndex + 1}`}
                  disabled={quizAnswers.length <= 2}
                  style={[styles.smallIconButton, quizAnswers.length <= 2 ? styles.disabledControl : null]}
                  onPress={() => removeQuizAnswer(answerIndex)}
                >
                  <Ionicons color="#b42318" name="remove-circle-outline" size={20} />
                </Pressable>
              </View>
              <Field
                label={`Answer ${answerIndex + 1}`}
                value={answer.label}
                onChangeText={(label) =>
                  updateContent({
                    answers: quizAnswers.map((item, itemIndex) =>
                      itemIndex === answerIndex ? { ...item, label } : item
                    )
                  })
                }
              />
            </View>
          ))}
          <Pressable style={styles.inlineAddButton} onPress={addQuizAnswer}>
            <Ionicons color="#175cd3" name="add-circle-outline" size={20} />
            <Text style={styles.inlineAddText}>Add answer</Text>
          </Pressable>
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
          <Field label="Target date and time" value={page.content.targetDate ?? ""} onChangeText={(targetDate) => updateContent({ targetDate })} />
          <Text style={styles.helperText}>{formatTargetDate(page.content.targetDate)}</Text>
          <View style={styles.presetRow}>
            <PresetButton label="Tomorrow" onPress={() => setCountdownPreset(1)} />
            <PresetButton label="1 week" onPress={() => setCountdownPreset(7)} />
            <PresetButton label="1 month" onPress={() => setCountdownPreset(30)} />
          </View>
        </>
      ) : null}

      {page.pageType === "cover" || page.pageType === "memory" ? (
        <Field label="Body" value={page.content.body ?? ""} onChangeText={(body) => updateContent({ body })} multiline />
      ) : null}

      {page.pageType !== "proposal" && page.pageType !== "final" ? (
        <Field label="Button label" value={page.content.ctaLabel ?? ""} onChangeText={(ctaLabel) => updateContent({ ctaLabel })} />
      ) : null}
      {validationErrors.length > 0 ? (
        <View style={styles.validationList}>
          {validationErrors.map((error) => <Text key={error} style={styles.error}>{error}</Text>)}
        </View>
      ) : null}
    </View>
  );
}

function PresetButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.presetButton} onPress={onPress}>
      <Text style={styles.presetButtonText}>{label}</Text>
    </Pressable>
  );
}

function Field(props: { error?: string | undefined; label: string; value: string; onChangeText: (value: string) => void; multiline?: boolean }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        multiline={props.multiline}
        onChangeText={props.onChangeText}
        style={[styles.input, props.multiline ? styles.textarea : null, props.error ? styles.inputError : null]}
        value={props.value}
      />
      {props.error ? <Text style={styles.fieldError}>{props.error}</Text> : null}
    </View>
  );
}

function AutosaveStatus({ state }: { state: AutosaveState }) {
  const config = {
    saved: { color: "#067647", icon: "cloud-done-outline" as const, label: "Saved" },
    pending: { color: "#b54708", icon: "cloud-upload-outline" as const, label: "Unsaved" },
    saving: { color: "#175cd3", icon: "sync-outline" as const, label: "Saving..." },
    error: { color: "#b42318", icon: "alert-circle-outline" as const, label: "Save failed" }
  }[state.status];

  return (
    <View style={styles.autosaveStatus}>
      <Ionicons color={config.color} name={config.icon} size={17} />
      <Text style={[styles.autosaveText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

function toDraftInput(draft: BuilderDraft): ExperienceDraftInput {
  if (!draft.experienceId) {
    throw new Error("Draft has not been created yet.");
  }

  return {
    id: draft.experienceId,
    title: draft.title,
    recipientName: draft.recipientName,
    message: draft.message,
    coverPhotoUrl: draft.coverPhotoUrl,
    theme: draft.theme,
    pages: draft.pages
  };
}

function formatPageType(pageType: ExperiencePageDraft["pageType"]) {
  return pageType.charAt(0).toUpperCase() + pageType.slice(1);
}

function formatFontName(fontFamily: Theme["fontFamily"]) {
  return fontFamily.charAt(0).toUpperCase() + fontFamily.slice(1);
}

function formatTargetDate(value: string | undefined) {
  if (!value) {
    return "Choose when this countdown should finish.";
  }

  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return "Enter a valid date, for example 2026-07-01T18:00:00.000Z.";
  }

  return `Countdown ends ${date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  })}`;
}

const PAGE_TYPES: Array<{ type: ExperiencePageType; label: string; description: string }> = [
  { type: "cover", label: "Cover", description: "Opening title and message" },
  { type: "memory", label: "Memory", description: "Share a meaningful moment" },
  { type: "quiz", label: "Quiz", description: "Ask a multiple-choice question" },
  { type: "countdown", label: "Countdown", description: "Build anticipation for a date" },
  { type: "proposal", label: "Proposal", description: "Ask the big yes-or-no question" },
  { type: "final", label: "Final", description: "Close with a personal message" }
];

const styles = StyleSheet.create({
  screen: { padding: 20, gap: 16 },
  empty: { flex: 1, padding: 20, justifyContent: "center", gap: 16 },
  builderMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  eyebrow: { color: "#2563eb", fontSize: 13, fontWeight: "800", textTransform: "uppercase" },
  autosaveStatus: { minHeight: 28, flexDirection: "row", alignItems: "center", gap: 5 },
  autosaveText: { fontSize: 12, fontWeight: "900" },
  title: { fontSize: 30, lineHeight: 36, fontWeight: "900", color: "#101828" },
  field: { gap: 7 },
  label: { color: "#344054", fontWeight: "800" },
  input: { minHeight: 50, borderWidth: 1, borderColor: "#d0d5dd", borderRadius: 8, paddingHorizontal: 13, backgroundColor: "#ffffff", fontSize: 16, color: "#101828" },
  inputError: { borderColor: "#f04438" },
  fieldError: { color: "#b42318", fontSize: 12, lineHeight: 17 },
  textarea: { minHeight: 112, paddingTop: 12, textAlignVertical: "top" },
  themeSection: { gap: 10 },
  themeList: { gap: 10, paddingRight: 4 },
  themeOption: { width: 148, height: 112, borderRadius: 8, borderWidth: 2, padding: 12, justifyContent: "space-between" },
  themeOptionHeader: { minHeight: 22, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6 },
  themeName: { flex: 1, fontSize: 15, fontWeight: "900" },
  themeSwatches: { flexDirection: "row", gap: 6 },
  themeSwatch: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: "rgba(16, 24, 40, 0.12)" },
  themeFont: { fontSize: 11, fontWeight: "800", opacity: 0.65 },
  coverPanel: { gap: 10 },
  coverPreview: { height: 220, borderRadius: 8, borderWidth: 1, borderColor: "#eaecf0", overflow: "hidden", backgroundColor: "#f2f4f7", alignItems: "center", justifyContent: "center" },
  coverImage: { width: "100%", height: "100%" },
  coverEmptyState: { alignItems: "center", justifyContent: "center", gap: 8 },
  coverPlaceholder: { color: "#667085", fontWeight: "800" },
  photoActionRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  pages: { gap: 10 },
  sectionTitle: { color: "#101828", fontSize: 18, fontWeight: "900" },
  pageEditor: { padding: 14, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#eaecf0", borderRadius: 8, gap: 12 },
  pageEditorError: { borderColor: "#f04438" },
  validationList: { gap: 3 },
  pageHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  pageNumber: { color: "#101828", fontWeight: "900", fontSize: 16 },
  pageType: { color: "#2563eb", fontSize: 12, fontWeight: "900", textTransform: "uppercase" },
  pagePhotoSection: { gap: 8 },
  pagePhoto: { width: "100%", aspectRatio: 4 / 3, borderRadius: 8 },
  pagePhotoPlaceholder: { width: "100%", aspectRatio: 4 / 3, borderRadius: 8, borderWidth: 1, borderStyle: "dashed", borderColor: "#d0d5dd", backgroundColor: "#f9fafb", alignItems: "center", justifyContent: "center", gap: 8 },
  pagePhotoActions: { flexDirection: "row", gap: 8 },
  photoButton: { flex: 1, height: 42, borderRadius: 8, borderWidth: 1, borderColor: "#84adff", backgroundColor: "#eff4ff", flexDirection: "row", gap: 7, alignItems: "center", justifyContent: "center" },
  photoButtonText: { color: "#175cd3", fontWeight: "900" },
  answerEditor: { gap: 8, paddingBottom: 4 },
  answerHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  correctAnswerButton: { alignSelf: "flex-start", minHeight: 36, borderRadius: 8, borderWidth: 1, borderColor: "#d0d5dd", paddingHorizontal: 10, flexDirection: "row", gap: 6, alignItems: "center" },
  correctAnswerSelected: { borderColor: "#75e0a7", backgroundColor: "#ecfdf3" },
  correctAnswerText: { color: "#667085", fontSize: 13, fontWeight: "800" },
  correctAnswerTextSelected: { color: "#067647" },
  inlineAddButton: { height: 44, borderRadius: 8, borderWidth: 1, borderStyle: "dashed", borderColor: "#84adff", backgroundColor: "#eff4ff", flexDirection: "row", gap: 7, alignItems: "center", justifyContent: "center" },
  inlineAddText: { color: "#175cd3", fontWeight: "900" },
  helperText: { color: "#667085", fontSize: 13, lineHeight: 18 },
  presetRow: { flexDirection: "row", gap: 8 },
  presetButton: { flex: 1, minHeight: 40, borderRadius: 8, borderWidth: 1, borderColor: "#d0d5dd", backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  presetButtonText: { color: "#344054", fontSize: 13, fontWeight: "900" },
  pageControls: { flexDirection: "row", gap: 6 },
  smallIconButton: { width: 38, height: 38, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#d0d5dd" },
  disabledControl: { opacity: 0.3 },
  addPageButton: { height: 52, borderRadius: 8, borderWidth: 1, borderStyle: "dashed", borderColor: "#84adff", backgroundColor: "#eff4ff", flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center" },
  addPageText: { color: "#175cd3", fontWeight: "900" },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(16, 24, 40, 0.45)" },
  pagePicker: { backgroundColor: "#ffffff", padding: 20, paddingBottom: 32, gap: 8, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  pagePickerHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  pagePickerTitle: { color: "#101828", fontSize: 22, fontWeight: "900" },
  pageOption: { minHeight: 62, borderBottomWidth: 1, borderBottomColor: "#eaecf0", flexDirection: "row", alignItems: "center", gap: 12 },
  pageOptionIcon: { width: 38, height: 38, borderRadius: 8, backgroundColor: "#eff4ff", alignItems: "center", justifyContent: "center" },
  pageOptionCopy: { flex: 1, gap: 2 },
  pageOptionTitle: { color: "#101828", fontSize: 16, fontWeight: "900" },
  pageOptionDescription: { color: "#667085", fontSize: 13 },
  actions: { flexDirection: "row", gap: 10 },
  button: { flex: 1, height: 52, borderRadius: 8, backgroundColor: "#101828", justifyContent: "center", alignItems: "center" },
  buttonText: { color: "#ffffff", fontWeight: "800" },
  secondaryButton: { flex: 1, height: 52, borderRadius: 8, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#d0d5dd", justifyContent: "center", alignItems: "center", flexDirection: "row", gap: 7 },
  secondaryButtonText: { color: "#101828", fontWeight: "800" },
  error: { color: "#b42318", lineHeight: 20 }
});
