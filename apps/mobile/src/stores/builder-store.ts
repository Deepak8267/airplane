import { create } from "zustand";
import type { Experience, ExperiencePage, ExperiencePageDraft, Template, Theme } from "@airplane/shared";

type BuilderDraft = {
  experienceId: string | null;
  templateId: string;
  title: string;
  recipientName: string;
  message: string;
  coverPhotoUrl: string | null;
  theme: Theme;
  pages: ExperiencePageDraft[];
};

type BuilderState = {
  draft: BuilderDraft | null;
  startFromTemplate: (template: Template) => void;
  startFromExperience: (experience: Experience, pages: ExperiencePage[]) => void;
  updateDraft: (patch: Partial<Pick<BuilderDraft, "title" | "recipientName" | "message" | "coverPhotoUrl" | "theme">>) => void;
  updatePage: (index: number, patch: Partial<ExperiencePageDraft>) => void;
};

export const useBuilderStore = create<BuilderState>((set) => ({
  draft: null,
  startFromTemplate: (template) =>
    set({
      draft: {
        experienceId: null,
        templateId: template.id,
        title: template.name,
        recipientName: "",
        message: template.description,
        coverPhotoUrl: null,
        theme: template.defaultTheme,
        pages: template.defaultPages
      }
    }),
  startFromExperience: (experience, pages) =>
    set({
      draft: {
        experienceId: experience.id,
        templateId: experience.templateId,
        title: experience.title,
        recipientName: experience.recipientName,
        message: experience.message,
        coverPhotoUrl: experience.coverPhotoUrl,
        theme: experience.theme,
        pages: pages.map((page) => ({
          pageType: page.pageType,
          title: page.title,
          content: page.content,
          mediaUrls: page.mediaUrls,
          settings: page.settings
        }))
      }
    }),
  updateDraft: (patch) =>
    set((state) => ({
      draft: state.draft ? { ...state.draft, ...patch } : null
    })),
  updatePage: (index, patch) =>
    set((state) => {
      const currentPage = state.draft?.pages[index];

      if (!state.draft || !currentPage) {
        return state;
      }

      const pages = [...state.draft.pages];
      pages[index] = { ...currentPage, ...patch };

      return { draft: { ...state.draft, pages } };
    })
}));
