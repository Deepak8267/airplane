import { mapUserProfile } from "@airplane/supabase";
import type { UserProfile } from "@airplane/shared";
import { supabase } from "@/lib/supabase";

export type ProfileInput = {
  fullName: string;
  email: string;
  phone: string;
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
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (data) {
    return mapUserProfile(data);
  }

  return ensureUserProfile(user.id, user.email ?? null);
}

export async function updateMyProfile(input: ProfileInput): Promise<UserProfile> {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;

  if (!user) {
    throw new Error("Sign in to update your profile.");
  }

  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone.trim();

  if (!fullName) {
    throw new Error("Full name is required.");
  }

  if (!isValidEmail(email)) {
    throw new Error("Enter a valid email address.");
  }

  if (!phone) {
    throw new Error("Phone number is required.");
  }

  const { data, error } = await supabase
    .from("users")
    .upsert({
      id: user.id,
      full_name: fullName,
      email,
      phone,
      provider: user.app_metadata.provider ?? "email"
    })
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

async function ensureUserProfile(userId: string, email: string | null): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("users")
    .upsert({
      id: userId,
      email,
      provider: email ? "email" : "anonymous"
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapUserProfile(data);
}
