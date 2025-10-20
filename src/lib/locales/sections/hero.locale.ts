import type { Messages } from '@/data/locales';
import type { Translator } from './helpers.locale';

type MessageKey = keyof Messages;

export const HERO_KEYS = {
	videoTitle: 'hero-title',
	videoLabel: 'hero-alt',
	headingFirstLine: 'hero-title_a',
	headingLastLine: 'hero-title_b',
	subtitle: 'hero-subtitle',
	cta: 'hero-cta',
	consoleDescription: 'hero-console_description',
	videoErrorMessage: 'error-video',
} as const satisfies Record<string, MessageKey>;

export const buildHeroCopy = (t: Translator) => ({
	videoTitle: t(HERO_KEYS.videoTitle),
	videoLabel: t(HERO_KEYS.videoLabel),
	headingFirstLine: t(HERO_KEYS.headingFirstLine),
	headingLastLine: t(HERO_KEYS.headingLastLine),
	subtitle: t(HERO_KEYS.subtitle),
	ctaLabel: t(HERO_KEYS.cta),
	consoleDescription: t(HERO_KEYS.consoleDescription),
	videoErrorMessage: t(HERO_KEYS.videoErrorMessage),
});
