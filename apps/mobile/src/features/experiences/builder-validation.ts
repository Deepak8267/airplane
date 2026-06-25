import type { BuilderDraft } from "@/stores/builder-store";

export type BuilderValidation = {
  isValid: boolean;
  title?: string | undefined;
  recipientName?: string | undefined;
  message?: string | undefined;
  pageErrors: Record<number, string[]>;
};

export function validateBuilderDraft(draft: BuilderDraft): BuilderValidation {
  const title = requiredText(draft.title, "Title is required.") ?? maxLength(draft.title, 120, "Title must be 120 characters or fewer.");
  const recipientName = requiredText(draft.recipientName, "Recipient name is required.") ?? maxLength(draft.recipientName, 80, "Recipient name must be 80 characters or fewer.");
  const message = maxLength(draft.message, 1200, "Message must be 1,200 characters or fewer.");
  const pageErrors: Record<number, string[]> = {};

  draft.pages.forEach((page, index) => {
    const errors: string[] = [];

    if (!page.title.trim()) {
      errors.push("Page title is required.");
    }

    if ((page.pageType === "cover" || page.pageType === "memory") && !page.content.body?.trim()) {
      errors.push("Body text is required.");
    }

    if (page.pageType === "quiz") {
      const answers = page.content.answers ?? [];

      if (!page.content.question?.trim()) {
        errors.push("Quiz question is required.");
      }

      if (answers.length < 2 || answers.some((answer) => !answer.label.trim())) {
        errors.push("Quiz needs at least two completed answers.");
      }

      if (answers.filter((answer) => answer.isCorrect).length !== 1) {
        errors.push("Select exactly one correct answer.");
      }
    }

    if (page.pageType === "countdown") {
      const targetTime = new Date(page.content.targetDate ?? "").getTime();

      if (!Number.isFinite(targetTime)) {
        errors.push("Countdown target date is invalid.");
      }
    }

    if (page.pageType === "proposal" && !page.content.question?.trim()) {
      errors.push("Proposal question is required.");
    }

    if (page.pageType === "final" && !page.content.finalMessage?.trim()) {
      errors.push("Final message is required.");
    }

    if (errors.length > 0) {
      pageErrors[index] = errors;
    }
  });

  return {
    isValid: !title && !recipientName && !message && Object.keys(pageErrors).length === 0 && draft.pages.length > 0,
    title,
    recipientName,
    message,
    pageErrors
  };
}

function requiredText(value: string, error: string) {
  return value.trim() ? undefined : error;
}

function maxLength(value: string, limit: number, error: string) {
  return value.length <= limit ? undefined : error;
}
