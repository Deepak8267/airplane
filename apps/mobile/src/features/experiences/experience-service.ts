import { mapExperience, mapExperiencePage } from "@airplane/supabase";
import type { Json } from "@airplane/supabase";
import type { Experience, ExperiencePage, ExperiencePageDraft, Template } from "@airplane/shared";
import { supabase } from "@/lib/supabase";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export type ExperienceDraftInput = {
  id: string;
  title: string;
  recipientName: string;
  message: string;
  coverPhotoUrl: string | null;
  theme: Template["defaultTheme"];
  pages: ExperiencePageDraft[];
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

export async function getExperienceForEditing(experienceId: string): Promise<{ experience: Experience; pages: ExperiencePage[] }> {
  const [experienceResult, pagesResult] = await Promise.all([
    supabase.from("experiences").select("*").eq("id", experienceId).single(),
    supabase
      .from("experience_pages")
      .select("*")
      .eq("experience_id", experienceId)
      .order("position", { ascending: true })
  ]);

  if (experienceResult.error) {
    throw new Error(experienceResult.error.message);
  }

  if (pagesResult.error) {
    throw new Error(pagesResult.error.message);
  }

  const pages = (pagesResult.data ?? []).map(mapExperiencePage);

  if (pages.length === 0) {
    throw new Error("This experience has no pages to edit.");
  }

  return {
    experience: mapExperience(experienceResult.data),
    pages
  };
}

export async function duplicateExperience(experienceId: string): Promise<{ experience: Experience; pages: ExperiencePage[] }> {
  const userId = await ensureCreatorUserId();
  const source = await getExperienceForEditing(experienceId);
  const title = `${source.experience.title} Copy`.slice(0, 120);
  const { data: experienceRow, error: experienceError } = await supabase
    .from("experiences")
    .insert({
      user_id: userId,
      template_id: source.experience.templateId,
      title,
      recipient_name: source.experience.recipientName,
      message: source.experience.message,
      theme: source.experience.theme,
      cover_photo_url: source.experience.coverPhotoUrl,
      watermark_enabled: source.experience.watermarkEnabled
    })
    .select("*")
    .single();

  if (experienceError) {
    throw new Error(experienceError.message);
  }

  const pageRows = source.pages.map((page, position) => ({
    experience_id: experienceRow.id,
    page_type: page.pageType,
    position,
    title: page.title,
    content: page.content as Json,
    media_urls: page.mediaUrls,
    settings: page.settings as Json
  }));
  const { data: duplicatedPages, error: pagesError } = await supabase
    .from("experience_pages")
    .insert(pageRows)
    .select("*")
    .order("position", { ascending: true });

  if (pagesError) {
    await supabase.from("experiences").delete().eq("id", experienceRow.id);
    throw new Error(pagesError.message);
  }

  return {
    experience: mapExperience(experienceRow),
    pages: (duplicatedPages ?? []).map(mapExperiencePage)
  };
}

export async function setExperienceArchived({ experienceId, archived }: { experienceId: string; archived: boolean }): Promise<Experience> {
  const { data, error } = await supabase
    .from("experiences")
    .update({
      status: archived ? "archived" : "draft",
      is_published: false
    })
    .eq("id", experienceId)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapExperience(data);
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
      cover_photo_url: null,
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
      cover_photo_url: input.coverPhotoUrl,
      theme: input.theme
    })
    .eq("id", input.id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const pageRows = input.pages.map((page, position) => ({
    experience_id: input.id,
    page_type: page.pageType,
    position,
    title: page.title,
    content: page.content as Json,
    media_urls: page.mediaUrls,
    settings: page.settings as Json
  }));

  const { error: pagesError } = await supabase.from("experience_pages").upsert(pageRows, {
    onConflict: "experience_id,position"
  });

  if (pagesError) {
    throw new Error(pagesError.message);
  }

  const { error: stalePagesError } = await supabase
    .from("experience_pages")
    .delete()
    .eq("experience_id", input.id)
    .gte("position", input.pages.length);

  if (stalePagesError) {
    throw new Error(stalePagesError.message);
  }

  return mapExperience(data);
}

export async function uploadCoverPhoto(experienceId: string, uri: string): Promise<string> {
  const userId = await ensureCreatorUserId();
  return uploadExperienceImage("covers", `${userId}/${experienceId}/cover`, uri);
}

export async function uploadPagePhoto(experienceId: string, pageIndex: number, uri: string): Promise<string> {
  const userId = await ensureCreatorUserId();
  return uploadExperienceImage("photos", `${userId}/${experienceId}/page-${pageIndex}`, uri);
}

async function uploadExperienceImage(bucket: "covers" | "photos", pathWithoutExtension: string, uri: string) {
  const response = await fetch(uri);

  if (!response.ok) {
    throw new Error("Could not read the selected image. Please choose another photo.");
  }

  const blob = await response.blob();

  if (blob.size > MAX_UPLOAD_BYTES) {
    throw new Error("Photo is too large. Please choose an image under 8 MB.");
  }

  const contentType = blob.type || "image/jpeg";
  const extension = getImageExtension(contentType);
  const path = `${pathWithoutExtension}.${extension}`;

  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    cacheControl: "31536000",
    contentType,
    upsert: true
  });

  if (error) {
    throw new Error(`Photo upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
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
    await ensureUserProfile(sessionData.session.user.id, sessionData.session.user.email ?? null);
    return sessionData.session.user.id;
  }

  const { data, error } = await supabase.auth.signInAnonymously();

  if (error || !data.user) {
    throw new Error(
      "Creator session is required. Enable Anonymous sign-ins in Supabase Auth or wire email login before creating experiences."
    );
  }

  await ensureUserProfile(data.user.id, data.user.email ?? null);
  return data.user.id;
}

async function ensureUserProfile(userId: string, email: string | null) {
  const { error } = await supabase.from("users").upsert({
    id: userId,
    email,
    provider: email ? "email" : "anonymous"
  });

  if (error) {
    throw new Error(error.message);
  }
}

function getImageExtension(contentType: string) {
  if (contentType.includes("png")) {
    return "png";
  }

  if (contentType.includes("webp")) {
    return "webp";
  }

  return "jpg";
}
