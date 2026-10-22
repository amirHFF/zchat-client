import React from "react";
import "./LanguageSwitch.css";
import { useT } from "../i18n/useT";
import type { Locale } from "../i18n/translations";
import { useLanguageStore } from "../i18n/languageStore";

interface LanguageSwitchProps {
  className?: string;
}

const options: Locale[] = ["en", "fa"];

export default function LanguageSwitch({ className }: LanguageSwitchProps) {
  const locale = useLanguageStore((state) => state.locale);
  const setLocale = useLanguageStore((state) => state.setLocale);
  const t = useT();

  return (
    <div
      className={["language-switch", className].filter(Boolean).join(" ")}
      role="group"
      aria-label={t("profile.language")}
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={
            option === locale
              ? "language-switch__btn is-active"
              : "language-switch__btn"
          }
          onClick={() => setLocale(option)}
          aria-pressed={option === locale}
        >
          {t(option === "en" ? "language.en" : "language.fa")}
        </button>
      ))}
    </div>
  );
}
