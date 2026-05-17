import type { Messages } from '@/data/locales';

import type { Translator } from './helpers.locale';

type MessageKey = keyof Messages;

export const SUMMARY_KEYS = {
  title: 'summary',
  href: 'summary-href',
  content: 'summary-content',
} as const satisfies Record<string, MessageKey>;

export const buildSummaryCopy = (t: Translator) => ({
  title: t(SUMMARY_KEYS.title),
  href: t(SUMMARY_KEYS.href),
  content: t(SUMMARY_KEYS.content),
});
