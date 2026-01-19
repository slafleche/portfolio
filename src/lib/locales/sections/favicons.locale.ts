import type {
  MessageKey,
  Translator,
} from './helpers.locale';

export const FAVICONS_META_KEYS = {
  description: 'favicon-meta-description',
  author: 'favicon-meta-author',
} as const satisfies Record<string, MessageKey>;

const resolveAuthor = (t: Translator) => {
  const raw = t.raw(FAVICONS_META_KEYS.author);
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    throw new Error(
      '[locales] Missing favicon meta author string for current locale.',
    );
  }
  return raw;
};

export const buildFaviconMetaBundle = (t: Translator) => ({
  description: t(FAVICONS_META_KEYS.description),
  author: resolveAuthor(t),
});

export type FaviconMetaBundle = ReturnType<
  typeof buildFaviconMetaBundle
>;
