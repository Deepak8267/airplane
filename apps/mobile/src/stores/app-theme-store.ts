import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AppThemeId =
  | "nature_soft"
  | "sunset_romance"
  | "ocean_breeze"
  | "minimal_white"
  | "pink"
  | "midnight"
  | "ocean"
  | "minimal";

export type AppThemeTokens = {
  id: AppThemeId;
  name: string;
  description: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  secondaryText: string;
  mutedText: string;
  border: string;
  muted: string;
  navBorder: string;
  accent: string;
  button: string;
  danger: string;
  success: string;
};

export const APP_THEMES: Record<AppThemeId, AppThemeTokens> = {
  nature_soft: {
    id: "nature_soft",
    name: "Nature Soft",
    description: "Calm, premium, soft, and friendly.",
    primary: "#6F8A61",
    primaryDark: "#4F6745",
    primaryLight: "#DDE8D5",
    background: "#FAF7EF",
    surface: "#FFFFFF",
    surfaceAlt: "#F5F1E8",
    text: "#2F3A2F",
    secondaryText: "#6F756A",
    mutedText: "#9A9A8F",
    border: "#E6E0D2",
    muted: "#DDE8D5",
    navBorder: "#E6E0D2",
    accent: "#E9A6A6",
    button: "#6F8A61",
    danger: "#D96B6B",
    success: "#6F8A61"
  },
  sunset_romance: {
    id: "sunset_romance",
    name: "Sunset Romance",
    description: "Warm, emotional, and expressive.",
    primary: "#FF6B57",
    primaryDark: "#D94D3D",
    primaryLight: "#FFE0D9",
    background: "#FFF3EC",
    surface: "#FFFFFF",
    surfaceAlt: "#FFE8DC",
    text: "#35231F",
    secondaryText: "#7A625C",
    mutedText: "#A9938D",
    border: "#F0D7CB",
    muted: "#FFE0D9",
    navBorder: "#F0D7CB",
    accent: "#F6A29A",
    button: "#FF6B57",
    danger: "#FF6B57",
    success: "#6F8A61"
  },
  ocean_breeze: {
    id: "ocean_breeze",
    name: "Ocean Breeze",
    description: "Fresh, light, and clean.",
    primary: "#168DBA",
    primaryDark: "#0E6F8F",
    primaryLight: "#D9F3FA",
    background: "#EFFAFF",
    surface: "#FFFFFF",
    surfaceAlt: "#E8F7F9",
    text: "#1E3440",
    secondaryText: "#607680",
    mutedText: "#9AAAB0",
    border: "#D6EDEF",
    muted: "#D9F3FA",
    navBorder: "#D6EDEF",
    accent: "#BFE8D0",
    button: "#168DBA",
    danger: "#E97878",
    success: "#68B984"
  },
  minimal_white: {
    id: "minimal_white",
    name: "Minimal White",
    description: "Simple, elegant, and timeless.",
    primary: "#111111",
    primaryDark: "#000000",
    primaryLight: "#EDEDED",
    background: "#FFFFFF",
    surface: "#FFFFFF",
    surfaceAlt: "#F7F7F7",
    text: "#111111",
    secondaryText: "#4A4A4A",
    mutedText: "#8A8A8A",
    border: "#DDDDDD",
    muted: "#EDEDED",
    navBorder: "#DDDDDD",
    accent: "#C9BFB3",
    button: "#111111",
    danger: "#D9534F",
    success: "#4F8A5B"
  },
  pink: {
    id: "pink",
    name: "Airplane Pink",
    description: "Warm, romantic, and playful.",
    primary: "#EC0E68",
    primaryDark: "#BE0B54",
    primaryLight: "#FBCFE8",
    background: "#FFF7FB",
    surface: "#FFFFFF",
    surfaceAlt: "#FFF1F7",
    text: "#101828",
    secondaryText: "#667085",
    mutedText: "#98A2B3",
    border: "#FBCFE8",
    muted: "#FFF0F6",
    navBorder: "#F3F4F6",
    accent: "#FF8AB8",
    button: "#EC0E68",
    danger: "#B42318",
    success: "#067647"
  },
  midnight: {
    id: "midnight",
    name: "Midnight",
    description: "Dark, premium, and focused.",
    primary: "#8B5CF6",
    primaryDark: "#6D28D9",
    primaryLight: "#DDD6FE",
    background: "#10111A",
    surface: "#171923",
    surfaceAlt: "#222536",
    text: "#F8FAFC",
    secondaryText: "#A7B0C0",
    mutedText: "#7D8798",
    border: "#2F3347",
    muted: "#252A3A",
    navBorder: "#2F3347",
    accent: "#C4B5FD",
    button: "#8B5CF6",
    danger: "#F97066",
    success: "#32D583"
  },
  ocean: {
    id: "ocean",
    name: "Ocean",
    description: "Clean, calm, and modern.",
    primary: "#0EA5E9",
    primaryDark: "#0369A1",
    primaryLight: "#BAE6FD",
    background: "#F2FAFF",
    surface: "#FFFFFF",
    surfaceAlt: "#E0F2FE",
    text: "#0F172A",
    secondaryText: "#64748B",
    mutedText: "#94A3B8",
    border: "#BAE6FD",
    muted: "#EAF7FF",
    navBorder: "#E2E8F0",
    accent: "#67E8F9",
    button: "#0EA5E9",
    danger: "#DC2626",
    success: "#059669"
  },
  minimal: {
    id: "minimal",
    name: "Minimal",
    description: "Neutral, simple, and crisp.",
    primary: "#111827",
    primaryDark: "#030712",
    primaryLight: "#E5E7EB",
    background: "#F8FAFC",
    surface: "#FFFFFF",
    surfaceAlt: "#F1F5F9",
    text: "#111827",
    secondaryText: "#6B7280",
    mutedText: "#9CA3AF",
    border: "#E5E7EB",
    muted: "#F3F4F6",
    navBorder: "#E5E7EB",
    accent: "#D1D5DB",
    button: "#111827",
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
      themeId: "nature_soft",
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
  return APP_THEMES[themeId] ?? APP_THEMES.nature_soft;
}
