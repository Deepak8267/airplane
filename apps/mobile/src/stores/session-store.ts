import { create } from "zustand";

type DemoSession = {
  email: string;
};

type SessionState = {
  session: DemoSession | null;
  setDemoSession: (email: string) => void;
  signOut: () => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  setDemoSession: (email) => set({ session: { email } }),
  signOut: () => set({ session: null })
}));
