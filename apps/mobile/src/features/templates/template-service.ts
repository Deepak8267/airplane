import { mapTemplate } from "@airplane/supabase";
import type { Template } from "@airplane/shared";
import { supabase } from "@/lib/supabase";

export async function getTemplates(): Promise<Template[]> {
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("is_active", true)
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(mapTemplate);
}

export async function getTemplateById(id: string): Promise<Template> {
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .or(`id.eq.${id},slug.eq.${id}`)
    .eq("is_active", true)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapTemplate(data);
}
