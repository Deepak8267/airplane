import { mapExperience, mapExperiencePage } from "@airplane/supabase";
import type { Json } from "@airplane/supabase";
import type { Experience, ExperiencePage, Template } from "@airplane/shared";
import { supabase } from "@/lib/supabase";

export type ExperienceDraftInput = {
  id: string;
  title: string;
  recipientName: string;
  message: string;
  theme: Template["defaultTheme"];
};

export async function getMyExperiences(): Promise<Experience[]> {
  const { data, error } = await supabase
    .from("experiences")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapExperience);
}

export async function createDraftExperience(template: Template): Promise<{ experience: Experience; pages: ExperiencePage[] }> {
  const userId = await ensureCreatorUserId();

  const { data: experienceRow, error: experienceError } = await supabase
    .from("experiences")
    .insert({
      user_id: userId,
      template_id: template.id,
      title: template.name,
      recipient_name: "",
      message: template.description,
      theme: template.defaultTheme,
      watermark_enabled: true
    })
    .select("*")
    .single();

  if (experienceError) {
    throw new Error(experienceError.message);
  }

  const pageRows = template.defaultPages.map((page, index) => ({
    experience_id: experienceRow.id,
    page_type: page.pageType,
      position: index,
      title: page.title,
      content: page.content as Json,
      media_urls: page.mediaUrls,
      settings: page.settings as Json
  }));

  const { data: pages, error: pagesError } = await supabase
    .from("experience_pages")
    .insert(pageRows)
    .select("*")
    .order("position", { ascending: true });

  if (pagesError) {
    throw new Error(pagesError.message);
  }

  return {
    experience: mapExperience(experienceRow),
    pages: (pages ?? []).map(mapExperiencePage)
  };
}

export async function updateDraftExperience(input: ExperienceDraftInput): Promise<Experience> {
  const { data, error } = await supabase
    .from("experiences")
    .update({
      title: input.title,
      recipient_name: input.recipientName,
      message: input.message,
      theme: input.theme
    })
    .eq("id", input.id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapExperience(data);
}

export async function publishExperience(experienceId: string): Promise<string> {
  const { data, error } = await supabase.rpc("publish_experience", {
    input_experience_id: experienceId
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function ensureCreatorUserId() {
  const { data: sessionData } = await supabase.auth.getSession();

  if (sessionData.session?.user.id) {
    return sessionData.session.user.id;
  }

  const { data, error } = await supabase.auth.signInAnonymously();

  if (error || !data.user) {
    throw new Error(
      "Creator session is required. Enable Anonymous sign-ins in Supabase Auth or wire email login before creating experiences."
    );
  }

  return data.user.id;
}
