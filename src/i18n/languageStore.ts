import { create } from "zustand";
import {
  interpolate,
  messages,
  type Direction,
  type Locale,
  type MessageKey,
} from "./translations";

export const LOCALE_STORAGE_KEY = "zchat.locale";

function readStoredLocale(): Locale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === "fa" || stored === "en") return stored;
  } catch {
    /* ignore quota / private mode */
  }
  return "fa";
}

export function localeDirection(locale: Locale): Direction {
  return locale === "fa" ? "rtl" : "ltr";
}

export function applyDocumentLocale(locale: Locale) {
  const dir = localeDirection(locale);
  document.documentElement.lang = locale;
  document.documentElement.dir = dir;
}

export function translate(
  key: MessageKey,
  params?: Record<string, string | number>,
  locale: Locale = useLanguageStore.getState().locale,
): string {
  return interpolate(messages[key][locale], params);
}

interface LanguageState {
  locale: Locale;
  dir: Direction;
  setLocale: (locale: Locale) => void;
}

const initialLocale = readStoredLocale();
if (typeof document !== "undefined") {
  applyDocumentLocale(initialLocale);
}

export const useLanguageStore = create<LanguageState>((set) => ({
  locale: initialLocale,
  dir: localeDirection(initialLocale),
  setLocale: (locale) => {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      /* ignore quota / private mode */
    }
    applyDocumentLocale(locale);
    set({ locale, dir: localeDirection(locale) });
  },
}));
