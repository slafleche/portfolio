import type { Messages } from '@/data/locales';
import type { Translator } from './helpers.locale';

type MessageKey = keyof Messages;

export const CONTACT_KEYS = {
	title: 'contact',
	href: 'contact-href',
	content: 'contact-content',
	github: 'contact-github',
} as const satisfies Record<string, MessageKey>;

export const buildContactCopy = (t: Translator) => ({
	title: t(CONTACT_KEYS.title),
	href: t(CONTACT_KEYS.href),
	content: t(CONTACT_KEYS.content),
	github: t(CONTACT_KEYS.github),
});
