import type { Messages } from '@/data/locales';

import type { Translator } from './helpers.locale';

type MessageKey = keyof Messages;

export const HERO_KEYS = {
  title: 'hero-title',
  subtitle: 'hero-subtitle',
  cta: 'hero-cta',
} as const satisfies Record<string, MessageKey>;

export const buildHeroCopy = (t: Translator) => ({
  title: t(HERO_KEYS.title),
  subTitle: t(HERO_KEYS.subtitle),
  ctaLabel: t(HERO_KEYS.cta),
});
