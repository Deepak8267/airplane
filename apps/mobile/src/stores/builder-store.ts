import { create } from "zustand";
import type { Experience, ExperiencePage, ExperiencePageDraft, ExperiencePageType, Template, Theme } from "@airplane/shared";

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
  addPage: (pageType: ExperiencePageType) => void;
  removePage: (index: number) => void;
  movePage: (index: number, direction: -1 | 1) => void;
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
    }),
  addPage: (pageType) =>
    set((state) => ({
      draft: state.draft
        ? { ...state.draft, pages: [...state.draft.pages, createPage(pageType)] }
        : null
    })),
  removePage: (index) =>
    set((state) => {
      if (!state.draft || state.draft.pages.length <= 1) {
        return state;
      }

      return {
        draft: {
          ...state.draft,
          pages: state.draft.pages.filter((_, pageIndex) => pageIndex !== index)
        }
      };
    }),
  movePage: (index, direction) =>
    set((state) => {
      if (!state.draft) {
        return state;
      }

      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= state.draft.pages.length) {
        return state;
      }

      const pages = [...state.draft.pages];
      const currentPage = pages[index];
      const targetPage = pages[targetIndex];

      if (!currentPage || !targetPage) {
        return state;
      }

      pages[index] = targetPage;
      pages[targetIndex] = currentPage;

      return { draft: { ...state.draft, pages } };
    })
}));

function createPage(pageType: ExperiencePageType): ExperiencePageDraft {
  const base = { pageType, mediaUrls: [], settings: {} };

  switch (pageType) {
    case "cover":
      return { ...base, title: "A new beginning", content: { body: "Add your opening message.", ctaLabel: "Continue" } };
    case "memory":
      return { ...base, title: "A favorite memory", content: { body: "Tell the story behind this moment.", ctaLabel: "Next memory" } };
    case "quiz": {
      const id = Date.now().toString(36);
      return {
        ...base,
        title: "A question for you",
        content: {
          question: "What is your answer?",
          answers: [
            { id: `${id}-a`, label: "First answer" },
            { id: `${id}-b`, label: "Second answer" }
          ],
          ctaLabel: "Continue"
        }
      };
    }
    case "countdown":
      return {
        ...base,
        title: "Counting down",
        content: {
          body: "Something special is coming.",
          targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          ctaLabel: "Continue"
        }
      };
    case "proposal":
      return { ...base, title: "A special question", content: { question: "Will you say yes?" }, settings: { moveNoButton: true } };
    case "final":
      return { ...base, title: "The end", content: { finalMessage: "Thank you for being part of this." } };
  }
}
