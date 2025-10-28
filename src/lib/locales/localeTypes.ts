import type { EnData } from './translations/en.data';
import type { MarkdownContent } from './markdownTypes';

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

export const MARKDOWN_FILE_MAP = {
  'systems-content': 'systems',
} as const;

export const MARKDOWN_MESSAGE_KEYS = Object.keys(
  MARKDOWN_FILE_MAP,
) as (keyof typeof MARKDOWN_FILE_MAP)[];

export type MarkdownMessageKey =
  (typeof MARKDOWN_MESSAGE_KEYS)[number];

export type { MarkdownContent } from './markdownTypes';
