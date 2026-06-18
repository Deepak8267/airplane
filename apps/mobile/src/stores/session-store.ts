import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";

type SessionState = {
  hydrated: boolean;
  session: Session | null;
  setSession: (session: Session | null) => void;
  setHydrated: (hydrated: boolean) => void;
  signOut: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  hydrated: false,
  session: null,
  setSession: (session) => set({ session }),
  setHydrated: (hydrated) => set({ hydrated }),
  signOut: () => set({ session: null })
}));
