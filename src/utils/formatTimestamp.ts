// UI is still English; switch these locales to fa-IR when the theme is localized.
const TIME_LOCALE = "en-US";

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

function formatClock(date: Date): string {
  return date.toLocaleTimeString(TIME_LOCALE, {
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

  const now = new Date();
  if (isSameDay(date, now)) {
    return formatClock(date);
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) {
    return "Yesterday";
  }

  return date.toLocaleDateString(TIME_LOCALE, {
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

  const time = formatClock(date);
  if (isSameDay(date, new Date())) {
    return time;
  }

  const dateLabel = date.toLocaleDateString(TIME_LOCALE, {
    month: "short",
    day: "numeric",
  });

  return `${dateLabel} ${time}`;
}
