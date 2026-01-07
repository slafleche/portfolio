import type { Messages } from '@/data/locales';

import type { Translator } from './helpers.locale';

type MessageKey = keyof Messages;

export const ABOUT_KEYS = {
  title: 'about',
  href: 'about-href',
  content: 'about-content',
} as const satisfies Record<string, MessageKey>;

export const buildAboutCopy = (t: Translator) => ({
  title: t(ABOUT_KEYS.title),
  href: t(ABOUT_KEYS.href),
  content: t(ABOUT_KEYS.content),
});
