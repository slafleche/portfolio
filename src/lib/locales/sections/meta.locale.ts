import type { Messages } from '@/data/locales';

import type { Translator } from './helpers.locale';

type MessageKey = keyof Messages;

export const META_KEYS = {
  label: 'label',
  abbreviatedLabel: 'abbreviated-label',
  redirecting: 'redirecting',
  title: 'title',
  description: 'description',
  scrollCue: 'scroll-cue',
} as const satisfies Record<string, MessageKey>;

export const META_TAG_KEYS = {
  description: 'meta-description',
  keywords: 'meta-keywords',
  author: 'meta-author',
} as const satisfies Record<string, MessageKey>;

export const buildMetaCopy = (t: Translator) => ({
  label: t(META_KEYS.label),
  abbreviatedLabel: t(META_KEYS.abbreviatedLabel),
  redirecting: t(META_KEYS.redirecting),
  title: t(META_KEYS.title),
  description: t(META_KEYS.description),
  scrollCue: t(META_KEYS.scrollCue),
});

const resolveMetaAuthor = (t: Translator) => {
  const raw = t.raw(META_TAG_KEYS.author);
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    throw new Error(
      '[locales] Missing meta author string for current locale.',
    );
  }
  return raw;
};

export const buildMetaTagBundle = (t: Translator) => ({
  description: t(META_TAG_KEYS.description),
  keywords: t(META_TAG_KEYS.keywords),
  author: resolveMetaAuthor(t),
});

export type MetaTagBundle = ReturnType<typeof buildMetaTagBundle>;
