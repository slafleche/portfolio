import type { Messages } from '@/data/locales';
import type { Translator } from './helpers.locale';

type MessageKey = keyof Messages;

export const CONTACT_KEYS = {
  title: 'contact',
  content: 'contact-content',
  emailLabel: 'contact-email-label',
  href: 'contact-href',
  systemsSnippetLabel: 'footer-systems-snippet-label',
} as const satisfies Record<string, MessageKey>;

export type ContactCopy = {
  title: string;
  content: string;
  emailLabel: string;
  href: string;
  systemsSnippetLabel: string;
};

export const buildContactCopy = (t: Translator): ContactCopy => ({
  title: t(CONTACT_KEYS.title),
  content: t(CONTACT_KEYS.content),
  emailLabel: t(CONTACT_KEYS.emailLabel),
  href: t(CONTACT_KEYS.href),
  systemsSnippetLabel: t(CONTACT_KEYS.systemsSnippetLabel),
});
