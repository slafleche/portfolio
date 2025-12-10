import { AVAILABLE_LOCALES } from '@/data/locales';

type Locale = (typeof AVAILABLE_LOCALES)[number];

type SlugMap = Partial<Record<Locale, Record<string, string>>>;

export const canonicalToLocalizedSlugs: SlugMap = {
  fr: {
    systems: 'systemes',
    privacy: 'confidentialite',
  },
} as const;

export const localizedToCanonicalSlugs: SlugMap =
  AVAILABLE_LOCALES.reduce((acc, locale) => {
    const overrides = canonicalToLocalizedSlugs[locale];
    if (!overrides) return acc;
    acc[locale] = Object.fromEntries(
      Object.entries(overrides).map(
        ([
          canonical,
          localized,
        ]) => [
          localized,
          canonical,
        ],
      ),
    ) as Record<string, string>;
    return acc;
  }, {} as SlugMap);
