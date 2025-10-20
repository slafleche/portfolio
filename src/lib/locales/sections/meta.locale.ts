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

export const buildMetaCopy = (t: Translator) => ({
	label: t(META_KEYS.label),
	abbreviatedLabel: t(META_KEYS.abbreviatedLabel),
	redirecting: t(META_KEYS.redirecting),
	title: t(META_KEYS.title),
	description: t(META_KEYS.description),
	scrollCue: t(META_KEYS.scrollCue),
});
