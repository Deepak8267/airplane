import { mapUserProfile } from "@airplane/supabase";
import type { UserProfile } from "@airplane/shared";
import { supabase } from "@/lib/supabase";

export type ProfileInput = {
  fullName: string;
  email: string;
};

export async function getMyProfile(): Promise<UserProfile> {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;

  if (!user) {
    throw new Error("Sign in to manage your profile.");
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapUserProfile(data);
}

export async function updateMyProfile(input: ProfileInput): Promise<UserProfile> {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;

  if (!user) {
    throw new Error("Sign in to update your profile.");
  }

  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();

  if (!fullName) {
    throw new Error("Full name is required.");
  }

  if (!isValidEmail(email)) {
    throw new Error("Enter a valid email address.");
  }

  const { data, error } = await supabase
    .from("users")
    .update({
      full_name: fullName,
      email
    })
    .eq("id", user.id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapUserProfile(data);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
