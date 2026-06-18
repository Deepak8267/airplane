import type { ExperiencePage, PublicExperiencePayload } from "@airplane/shared";
import { mapExperience, mapExperiencePage } from "@airplane/supabase";
import { supabase } from "@/lib/supabase";
import { templateFixtures } from "@/features/templates/template-fixtures";

export async function getPublicExperienceBySlug(slug: string): Promise<PublicExperiencePayload | null> {
  if (slug.toUpperCase() === "DEMO01") {
    return buildFixturePayload("DEMO01");
  }

  const { data: experienceRow, error: experienceError } = await supabase
    .from("experiences")
    .select("*")
    .eq("slug", slug.toUpperCase())
    .eq("is_published", true)
    .single();

  if (experienceError || !experienceRow) {
    return null;
  }

  const { data: pageRows, error: pagesError } = await supabase
    .from("experience_pages")
    .select("*")
    .eq("experience_id", experienceRow.id)
    .order("position", { ascending: true });

  if (pagesError) {
    throw new Error(pagesError.message);
  }

  return {
    experience: mapExperience(experienceRow),
    pages: (pageRows ?? []).map(mapExperiencePage)
  };
}

export async function getPreviewExperienceById(id: string): Promise<PublicExperiencePayload> {
  return buildFixturePayload(id);
}

function buildFixturePayload(slug: string): PublicExperiencePayload {
  const template = templateFixtures.find((item) => item.templateType === "marriage_proposal") ?? getFallbackTemplate();

  return {
    experience: {
      id: "00000000-0000-4000-8000-000000000001",
      userId: "00000000-0000-4000-8000-000000000002",
      templateId: template.id,
      title: "For the person I choose every day",
      recipientName: "Avery",
      message: "A small experience for a very big question.",
      theme: template.defaultTheme,
      coverPhotoUrl: null,
      slug,
      status: "published",
      isPublished: true,
      publishedAt: new Date().toISOString(),
      watermarkEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    pages: template.defaultPages.map(
      (page, index): ExperiencePage => ({
        ...page,
        id: `00000000-0000-4000-8000-00000000010${index}`,
        experienceId: "00000000-0000-4000-8000-000000000001",
        position: index,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    )
  };
}

function getFallbackTemplate() {
  const template = templateFixtures[0];

  if (!template) {
    throw new Error("Template fixtures are empty.");
  }

  return template;
}
