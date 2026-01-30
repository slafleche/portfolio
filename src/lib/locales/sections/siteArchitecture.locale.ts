import type { Messages } from '@/data/locales';

import type { Translator } from './helpers.locale';

type MessageKey = keyof Messages;

export const SITE_ARCHITECTURE_KEYS = {
  title: 'architecture',
  href: 'architecture-href',
  content: 'home-architecture-content',
} as const satisfies Record<string, MessageKey>;

export const buildArchitectureCopy = (t: Translator) => ({
  title: t(SITE_ARCHITECTURE_KEYS.title),
  href: t(SITE_ARCHITECTURE_KEYS.href),
  content: t(SITE_ARCHITECTURE_KEYS.content),
});
