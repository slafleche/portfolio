import type { Messages } from '@/data/locales';
import type { Translator } from './helpers.locale';

type MessageKey = keyof Messages;

export const HERO_KEYS = {
  title: 'hero-title',
  subtitle: 'hero-subtitle',
  videoTitle: 'hero-video-title',
  videoLabel: 'hero-video-alt',
  cta: 'hero-cta',
  consoleDescription: 'hero-console_description',
  videoErrorMessage: 'error-video',
} as const satisfies Record<string, MessageKey>;

export const buildHeroCopy = (t: Translator) => ({
  title: t(HERO_KEYS.title),
  subTitle: t(HERO_KEYS.subtitle),
  videoTitle: t(HERO_KEYS.videoTitle),
  videoLabel: t(HERO_KEYS.videoLabel),
  ctaLabel: t(HERO_KEYS.cta),
  consoleDescription: t(HERO_KEYS.consoleDescription),
  videoErrorMessage: t(HERO_KEYS.videoErrorMessage),
});
