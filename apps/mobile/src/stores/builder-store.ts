import { create } from "zustand";
import type { ExperiencePageDraft, Template, Theme } from "@airplane/shared";

type BuilderDraft = {
  templateId: string;
  title: string;
  recipientName: string;
  message: string;
  theme: Theme;
  pages: ExperiencePageDraft[];
};

type BuilderState = {
  draft: BuilderDraft | null;
  startFromTemplate: (template: Template) => void;
  updateDraft: (patch: Partial<Pick<BuilderDraft, "title" | "recipientName" | "message" | "theme">>) => void;
};

export const useBuilderStore = create<BuilderState>((set) => ({
  draft: null,
  startFromTemplate: (template) =>
    set({
      draft: {
        templateId: template.id,
        title: template.name,
        recipientName: "",
        message: template.description,
        theme: template.defaultTheme,
        pages: template.defaultPages
      }
    }),
  updateDraft: (patch) =>
    set((state) => ({
      draft: state.draft ? { ...state.draft, ...patch } : null
    }))
}));
