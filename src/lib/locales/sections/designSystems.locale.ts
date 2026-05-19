import type { Messages } from '@/data/locales';

import type { Translator } from './helpers.locale';

type MessageKey = keyof Messages;

export const DESIGN_SYSTEMS_KEYS = {
  title: 'design_systems',
  href: 'design_systems-href',
  content: 'design-systems-content',
} as const satisfies Record<string, MessageKey>;

export const buildDesignSystemsCopy = (t: Translator) => ({
  title: t(DESIGN_SYSTEMS_KEYS.title),
  href: t(DESIGN_SYSTEMS_KEYS.href),
  content: t(DESIGN_SYSTEMS_KEYS.content),
});
