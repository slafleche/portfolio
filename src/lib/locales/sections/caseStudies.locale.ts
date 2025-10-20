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

type CaseStudyEntry = {
	title?: string;
	subTitle?: string;
	content?: string;
};

export const buildCaseStudiesCopy = (t: Translator) => {
	const rawList = t.raw(CASE_STUDY_KEYS.list);
	if (!Array.isArray(rawList)) {
		throw new Error(
			`Expected "${CASE_STUDY_KEYS.list}" to be an array, received ${typeof rawList}.`,
		);
	}

	const list = rawList.map((item, index) => {
		const entry = item as CaseStudyEntry | undefined;
		if (
			!entry ||
			typeof entry.title !== 'string' ||
			typeof entry.content !== 'string'
		) {
			throw new Error(
				`Invalid entry in "${CASE_STUDY_KEYS.list}" at index ${index}.`,
			);
		}

		return {
			title: entry.title,
			subTitle:
				typeof entry.subTitle === 'string' ? entry.subTitle : undefined,
			content: entry.content,
		};
	});

	return {
		title: t(CASE_STUDY_KEYS.title),
		href: t(CASE_STUDY_KEYS.href),
		list,
	};
};
