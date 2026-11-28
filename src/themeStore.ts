import { create } from "zustand";
import { persist } from "zustand/middleware";

export const colorThemes = [
  { id: "classic", mode: "light", name: { en: "Classic", fa: "کلاسیک" }, colors: ["#356AE6", "#20AFA3", "#FFC857", "#FF7A70"] },
  { id: "rose", mode: "light", name: { en: "Rose", fa: "رز" }, colors: ["#8E4A62", "#D39AA7", "#F6E9DE", "#D7B56D"] },
  { id: "forest", mode: "light", name: { en: "Forest", fa: "جنگلی" }, colors: ["#092328", "#12544F", "#2A835F", "#8BBB92"] },
  { id: "playful", mode: "light", name: { en: "Playful", fa: "بچگانه" }, colors: ["#426B5A", "#E79A73", "#FFF0D8", "#AEC987"] },
  { id: "warm", mode: "light", name: { en: "Warm", fa: "گرم" }, colors: ["#F7F1DE", "#B0BA99", "#9D6638", "#4E220F"] },
  { id: "dark", mode: "dark", name: { en: "Dark", fa: "تیره" }, colors: ["#0F1724", "#172131", "#4D7EF0", "#1F9A8F"] },
] as const;

export type ColorThemeMode = (typeof colorThemes)[number]["mode"];

export type ColorThemeId = (typeof colorThemes)[number]["id"];

interface ThemeState {
  themeId: ColorThemeId;
  setTheme: (themeId: ColorThemeId) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({ themeId: "classic", setTheme: (themeId) => set({ themeId }) }),
    { name: "simorq-color-theme" },
  ),
);
