import type { Messages } from '@/data/locales';

import type { Translator } from './helpers.locale';

type MessageKey = keyof Messages;

export const HERO_KEYS = {
  title: 'hero-title',
  subtitle: 'hero-subtitle',
  ctaLabel: 'contact-label-hero',
  ctaText: 'contact-cta',
} as const satisfies Record<string, MessageKey>;

export const buildHeroCopy = (t: Translator) => ({
  title: t(HERO_KEYS.title),
  subtitle: t(HERO_KEYS.subtitle),
  ctaLabel: t(HERO_KEYS.ctaLabel),
  ctaText: t(HERO_KEYS.ctaText),
});
