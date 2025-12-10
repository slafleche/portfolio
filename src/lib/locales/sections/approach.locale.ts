import type { Messages } from '@/data/locales';
import type { Translator } from './helpers.locale';

type MessageKey = keyof Messages;

export const APPROACH_KEYS = {
  title: 'approach',
  href: 'approach-href',
  content: 'approach-content',
} as const satisfies Record<string, MessageKey>;

export const buildApproachCopy = (t: Translator) => ({
  title: t(APPROACH_KEYS.title),
  href: t(APPROACH_KEYS.href),
  content: t(APPROACH_KEYS.content),
});
