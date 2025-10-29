import { MARKDOWN_MESSAGES } from '../generated/markdown.gen';
import type { LocaleMessagesShape } from '../localeTypes';
import { resolveMarkdownPlaceholders } from './markdownRefs';
import { frData } from './fr.data';

const frResolved = resolveMarkdownPlaceholders(
	frData,
	MARKDOWN_MESSAGES.fr,
	'fr',
);

export const fr =
	frResolved satisfies LocaleMessagesShape ? frResolved : frResolved;

export type FrMessages = typeof fr;

export default fr;
