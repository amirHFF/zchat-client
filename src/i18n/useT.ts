import { useLanguageStore, translate } from "./languageStore";
import type { MessageKey } from "./translations";

export function useT() {
  const locale = useLanguageStore((state) => state.locale);

  return (
    key: MessageKey,
    params?: Record<string, string | number>,
  ): string => translate(key, params, locale);
}
