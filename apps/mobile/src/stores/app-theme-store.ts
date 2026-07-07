import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AppThemeId = "pink" | "midnight" | "ocean" | "minimal";

export type AppThemeTokens = {
  id: AppThemeId;
  name: string;
  description: string;
  primary: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  secondaryText: string;
  border: string;
  muted: string;
  navBorder: string;
  danger: string;
  success: string;
};

export const APP_THEMES: Record<AppThemeId, AppThemeTokens> = {
  pink: {
    id: "pink",
    name: "Airplane Pink",
    description: "Warm, romantic, and playful.",
    primary: "#EC0E68",
    background: "#FFF7FB",
    surface: "#FFFFFF",
    surfaceAlt: "#FFF1F7",
    text: "#101828",
    secondaryText: "#667085",
    border: "#FBCFE8",
    muted: "#FFF0F6",
    navBorder: "#F3F4F6",
    danger: "#B42318",
    success: "#067647"
  },
  midnight: {
    id: "midnight",
    name: "Midnight",
    description: "Dark, premium, and focused.",
    primary: "#8B5CF6",
    background: "#10111A",
    surface: "#171923",
    surfaceAlt: "#222536",
    text: "#F8FAFC",
    secondaryText: "#A7B0C0",
    border: "#2F3347",
    muted: "#252A3A",
    navBorder: "#2F3347",
    danger: "#F97066",
    success: "#32D583"
  },
  ocean: {
    id: "ocean",
    name: "Ocean",
    description: "Clean, calm, and modern.",
    primary: "#0EA5E9",
    background: "#F2FAFF",
    surface: "#FFFFFF",
    surfaceAlt: "#E0F2FE",
    text: "#0F172A",
    secondaryText: "#64748B",
    border: "#BAE6FD",
    muted: "#EAF7FF",
    navBorder: "#E2E8F0",
    danger: "#DC2626",
    success: "#059669"
  },
  minimal: {
    id: "minimal",
    name: "Minimal",
    description: "Neutral, simple, and crisp.",
    primary: "#111827",
    background: "#F8FAFC",
    surface: "#FFFFFF",
    surfaceAlt: "#F1F5F9",
    text: "#111827",
    secondaryText: "#6B7280",
    border: "#E5E7EB",
    muted: "#F3F4F6",
    navBorder: "#E5E7EB",
    danger: "#EF4444",
    success: "#16A34A"
  }
};

export const APP_THEME_OPTIONS = Object.values(APP_THEMES);

type AppThemeState = {
  themeId: AppThemeId;
  setTheme: (themeId: AppThemeId) => void;
};

export const useAppThemeStore = create<AppThemeState>()(
  persist(
    (set) => ({
      themeId: "pink",
      setTheme: (themeId) => set({ themeId })
    }),
    {
      name: "airplane-app-theme",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);

export function useAppTheme() {
  const themeId = useAppThemeStore((state) => state.themeId);
  return APP_THEMES[themeId] ?? APP_THEMES.pink;
}
