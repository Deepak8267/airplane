import { createAirplaneSupabaseClient } from "@airplane/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Next Supabase environment variables.");
}

export const supabase = createAirplaneSupabaseClient(supabaseUrl, supabaseAnonKey);
