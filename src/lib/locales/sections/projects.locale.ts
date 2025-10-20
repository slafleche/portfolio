import type { Messages } from '@/data/locales';
import type { Translator } from './helpers.locale';

type MessageKey = keyof Messages;

export const PROJECTS_KEYS = {
	title: 'projects',
	href: 'projects-href',
	list: 'projects-list',
} as const satisfies {
	title: MessageKey;
	href: Extract<MessageKey, `${string}-href`>;
	list: Extract<MessageKey, `${string}-list`>;
};

export const buildProjectsCopy = (t: Translator) => ({
	title: t(PROJECTS_KEYS.title),
	href: t(PROJECTS_KEYS.href),
	list: t(PROJECTS_KEYS.list),
});
