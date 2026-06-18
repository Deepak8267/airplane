import { supabase } from "@/lib/supabase";

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data.session?.user) {
    await ensureUserProfile(data.session.user.id, data.session.user.email ?? email);
  }

  return data.session;
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data.user) {
    await ensureUserProfile(data.user.id, data.user.email ?? email);
  }

  return data.session;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

async function ensureUserProfile(userId: string, email: string | null) {
  const { error } = await supabase.from("users").upsert({
    id: userId,
    email,
    provider: "email"
  });

  if (error) {
    throw new Error(error.message);
  }
}
