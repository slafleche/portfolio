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

type ProjectEntry = {
	title?: string;
	content?: string;
};

export const buildProjectsCopy = (t: Translator) => {
	const rawList = t.raw(PROJECTS_KEYS.list);
	if (!rawList || typeof rawList !== 'object' || Array.isArray(rawList)) {
		throw new Error(
			`Expected "${PROJECTS_KEYS.list}" to be an object map, received ${Array.isArray(rawList) ? 'array' : typeof rawList}.`,
		);
	}

	const entries = rawList as Record<string, ProjectEntry | undefined>;
	const list = Object.entries(entries).map(([key, value]) => {
		if (!value || typeof value.title !== 'string' || typeof value.content !== 'string') {
			throw new Error(
				`Invalid entry in "${PROJECTS_KEYS.list}" for key "${key}".`,
			);
		}
		return {
			id: key,
			title: value.title,
			content: value.content,
		};
	});

	return {
		title: t(PROJECTS_KEYS.title),
		href: t(PROJECTS_KEYS.href),
		list,
	};
};
