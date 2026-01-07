import type { MarkdownMessageKey } from './generated/markdown.gen';
import { MARKDOWN_MESSAGE_KEYS } from './generated/markdown.gen';
import type { MarkdownContent } from './markdownTypes';
import type { EnData } from './translations/en.data';

type DeepWiden<T> = T extends MarkdownContent
  ? MarkdownContent
  : T extends string
    ? string
    : T extends readonly (infer U)[]
      ? readonly DeepWiden<U>[]
      : T extends Record<string, unknown>
        ? { [K in keyof T]: DeepWiden<T[K]> }
        : T;

export type LocaleMessagesShape = DeepWiden<EnData>;

export type { MarkdownContent } from './markdownTypes';
export { MARKDOWN_MESSAGE_KEYS };
export type { MarkdownMessageKey };
