import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export function createAirplaneSupabaseClient(url: string, anonKey: string) {
  if (!url || !anonKey) {
    throw new Error("Missing Supabase URL or anon key.");
  }

  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
}
