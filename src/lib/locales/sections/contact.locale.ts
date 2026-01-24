import type { Messages } from '@/data/locales';

import type { Translator } from './helpers.locale';

type MessageKey = keyof Messages;

export const CONTACT_KEYS = {
  title: 'contact',
  labelFloating: 'contact-label-floating',
  labelHero: 'contact-label-hero',
  content: 'contact-content',
  emailLabel: 'contact-email-label',
  linkedInLabel: 'links-linkedin-label',
  githubLabel: 'links-github-label',
  href: 'contact-href',
  mockHtmlAlt: 'systems-mock-html-alt',
  bgDescription: 'contact-bg-description',
  bgTitle: 'contact-bg-title',
} as const satisfies Record<string, MessageKey>;

export type ContactCopy = {
  title: string;
  labelFloating: string;
  labelHero: string;
  content: string;
  emailLabel: string;
  linkedInLabel: string;
  githubLabel: string;
  href: string;
  mockHtmlAlt: string;
};

export const buildContactCopy = (t: Translator): ContactCopy => ({
  title: t(CONTACT_KEYS.title),
  labelFloating: t(CONTACT_KEYS.labelFloating),
  labelHero: t(CONTACT_KEYS.labelHero),
  content: t(CONTACT_KEYS.content),
  emailLabel: t(CONTACT_KEYS.emailLabel),
  linkedInLabel: t(CONTACT_KEYS.linkedInLabel),
  githubLabel: t(CONTACT_KEYS.githubLabel),
  href: t(CONTACT_KEYS.href),
  mockHtmlAlt: t(CONTACT_KEYS.mockHtmlAlt),
});
