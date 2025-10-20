import type { Messages } from '@/data/locales';
import type { Translator } from './helpers.locale';

type MessageKey = keyof Messages;

export const CASE_STUDY_KEYS = {
	title: 'case_study',
	href: 'case_study-href',
	list: 'case_study-list',
} as const satisfies {
	title: MessageKey;
	href: Extract<MessageKey, `${string}-href`>;
	list: Extract<MessageKey, `${string}-list`>;
};

export const buildCaseStudiesCopy = (t: Translator) => ({
	title: t(CASE_STUDY_KEYS.title),
	href: t(CASE_STUDY_KEYS.href),
	list: t(CASE_STUDY_KEYS.list),
});
