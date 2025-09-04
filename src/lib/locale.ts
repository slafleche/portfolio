// src/lib/locale.ts
import { AVAILABLE_LOCALES, TRANSLATIONS, type Locale } from "@/data/locales";

export function resolveLocale(candidate?: string): Locale {
  const defaultLocale: Locale = "en";

  // 1. if a candidate param matches, use it
  if (candidate && (AVAILABLE_LOCALES as readonly string[]).includes(candidate)) {
    return candidate as Locale;
  }

  // 2. if in browser, check navigator.language
  if (typeof navigator !== "undefined") {
    const browserLang = navigator.language?.slice(0, 2);
    if ((AVAILABLE_LOCALES as readonly string[]).includes(browserLang)) {
      return browserLang as Locale;
    }
  }

  // 3. fallback
  return defaultLocale;
}

export function getTranslator(locale: Locale) {
  return (key: keyof (typeof TRANSLATIONS)[Locale]) =>
    TRANSLATIONS[locale]?.[key] ?? key;
}
