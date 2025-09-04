// src/lib/locale.ts
import { AVAILABLE_LOCALES, TRANSLATIONS, type Locale } from "../data/locales";

export function resolveLocale(LOCALE?: string): Locale {
  const defaultLocale: Locale = "en";
  return AVAILABLE_LOCALES.includes(LOCALE as Locale)
    ? (LOCALE as Locale)
    : defaultLocale;
}

export function getTranslator(locale: Locale) {
  return (key: keyof (typeof TRANSLATIONS)[Locale]) =>
    TRANSLATIONS[locale]?.[key] ?? key;
}
