import type { Messages } from '@/data/locales';
import type { Translator } from './helpers.locale';

type MessageKey = keyof Messages;

export const PRIVACY_KEYS = {
  title: 'privacy-title',
  href: 'privacy-href',
  content: 'privacy-content',
} as const satisfies Record<string, MessageKey>;

export type PrivacyCopy = {
  title: string;
  href: string;
  updated: string;
  content: string;
};

export const buildPrivacyCopy = (t: Translator): PrivacyCopy => ({
  title: t(PRIVACY_KEYS.title),
  href: t(PRIVACY_KEYS.href),
  updated: t(PRIVACY_KEYS.updated),
  content: t(PRIVACY_KEYS.content),
});
