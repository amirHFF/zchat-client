import type { NavigateFunction } from "react-router-dom";

const MOBILE_CHAT_HISTORY_KEY = "zchatMobileChatEntry";
const MOBILE_CHAT_MEDIA_QUERY = "(max-width: 426px)";

type MobileHistoryState = Record<string, unknown> | null;

function toState(state: unknown): Record<string, unknown> {
  return state && typeof state === "object"
    ? (state as Record<string, unknown>)
    : {};
}

export function isMobileChatHistoryEntry(state: unknown): boolean {
  return Boolean(toState(state)[MOBILE_CHAT_HISTORY_KEY]);
}

/** Use React Router to add a same-route entry for the phone's Back button. */
export function enterMobileChatHistory(
  navigate: NavigateFunction,
  pathname: string,
  search: string,
  hash: string,
  state: MobileHistoryState,
): void {
  if (!window.matchMedia(MOBILE_CHAT_MEDIA_QUERY).matches) return;
  if (isMobileChatHistoryEntry(state)) return;

  navigate(`${pathname}${search}${hash}`, {
    state: { ...toState(state), [MOBILE_CHAT_HISTORY_KEY]: true },
  });
}

/** Pop the chat entry so Back returns to the list without leaving the route. */
export function leaveMobileChatHistory(
  navigate: NavigateFunction,
  state: MobileHistoryState,
): boolean {
  if (!isMobileChatHistoryEntry(state)) return false;

  navigate(-1);
  return true;
}
