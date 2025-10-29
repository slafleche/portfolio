import { MARKDOWN_MESSAGES } from '../generated/markdown.gen';
import type { LocaleMessagesShape } from '../localeTypes';
import { resolveMarkdownPlaceholders } from './markdownRefs';
import { enData } from './en.data';

const enResolved = resolveMarkdownPlaceholders(
	enData,
	MARKDOWN_MESSAGES.en,
	'en',
);

export const en =
	enResolved satisfies LocaleMessagesShape ? enResolved : enResolved;

export type EnMessages = typeof en;

export default en;
