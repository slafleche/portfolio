import { MARKDOWN_MESSAGES } from '../generated/markdown.gen';
import type { LocaleMessagesShape } from '../localeTypes';
import { frData } from './fr.data';
import { resolveMarkdownPlaceholders } from './markdownRefs';
import { resolveAbbrShortcodes } from './resolveAbbrShortcodes';

const frResolved = resolveAbbrShortcodes(
  resolveMarkdownPlaceholders(frData, MARKDOWN_MESSAGES.fr, 'fr'),
  'fr',
);

export const fr = (frResolved satisfies LocaleMessagesShape)
  ? frResolved
  : frResolved;

export type FrMessages = typeof fr;

export default fr;
