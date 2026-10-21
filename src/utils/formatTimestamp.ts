import { translate, useLanguageStore } from "../i18n/languageStore";
import type { Locale } from "../i18n/translations";

function timeLocale(locale: Locale): string {
  return locale === "fa" ? "fa-IR" : "en-US";
}

function currentLocale(): Locale {
  return useLanguageStore.getState().locale;
}

export function parseTimestamp(
  value: string | number | undefined | null,
): Date | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  // API may send seconds or milliseconds
  const numeric = typeof value === "number" ? value : Number(value);
  const date = Number.isFinite(numeric)
    ? new Date(numeric < 1e12 ? numeric * 1000 : numeric)
    : new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatClock(date: Date, locale = currentLocale()): string {
  return date.toLocaleTimeString(timeLocale(locale), {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** Sidebar: today = HH:mm, yesterday, otherwise short date */
export function formatConversationTime(
  value: string | number | undefined | null,
): string {
  const date = parseTimestamp(value);
  if (!date) {
    return "";
  }

  const locale = currentLocale();
  const now = new Date();
  if (isSameDay(date, now)) {
    return formatClock(date, locale);
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) {
    return translate("time.yesterday", undefined, locale);
  }

  return date.toLocaleDateString(timeLocale(locale), {
    month: "short",
    day: "numeric",
  });
}

/** Message bubble: today = HH:mm, otherwise "Oct 6, 14:32" */
export function formatMessageTime(
  value: string | number | undefined | null,
): string {
  const date = parseTimestamp(value);
  if (!date) {
    return "";
  }

  const locale = currentLocale();
  const time = formatClock(date, locale);
  if (isSameDay(date, new Date())) {
    return time;
  }

  const dateLabel = date.toLocaleDateString(timeLocale(locale), {
    month: "short",
    day: "numeric",
  });

  return `${dateLabel} ${time}`;
}
