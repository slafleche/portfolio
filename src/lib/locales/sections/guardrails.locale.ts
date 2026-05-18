import type { MessageKey, Translator } from './helpers.locale';

export const GUARDRAILS_KEYS = {
  title: 'guardrails',
  href: 'guardrails-href',
  intro: 'guardrails-intro',
  outro: 'guardrails-outro',
} as const satisfies {
  title: MessageKey;
  href: MessageKey;
  intro: MessageKey;
  outro: MessageKey;
};

type GuardrailDefinition = {
  titleKey: MessageKey;
  markdownKey: MessageKey;
};

const HERO_DEFINITION: GuardrailDefinition = {
  titleKey: 'guardrails-01-title',
  markdownKey: 'guardrails-01-content',
};

const ITEM_DEFINITIONS = {
  item2: {
    titleKey: 'guardrails-02-title',
    markdownKey: 'guardrails-02-content',
  },
  item3: {
    titleKey: 'guardrails-03-title',
    markdownKey: 'guardrails-03-content',
  },
  item4: {
    titleKey: 'guardrails-04-title',
    markdownKey: 'guardrails-04-content',
  },
  item5: {
    titleKey: 'guardrails-05-title',
    markdownKey: 'guardrails-05-content',
  },
} as const satisfies Record<string, GuardrailDefinition>;

export type GuardrailItemId = keyof typeof ITEM_DEFINITIONS;

export type GuardrailListItem = {
  id: GuardrailItemId | 'hero';
  title: string;
  content: string;
};

export type GuardrailsItems = {
  [Key in GuardrailItemId]: GuardrailListItem;
};

export type GuardrailsCopy = {
  title: string;
  href: string;
  intro: string;
  outro: string;
  hero: GuardrailListItem;
  items: GuardrailsItems;
};

const buildGuardrailItems = (t: Translator): GuardrailsItems => {
  return (
    Object.entries(ITEM_DEFINITIONS) as [
      GuardrailItemId,
      GuardrailDefinition,
    ][]
  ).reduce<GuardrailsItems>((acc, [id, definition]) => {
    acc[id] = {
      id,
      title: t(definition.titleKey),
      content: t(definition.markdownKey),
    };
    return acc;
  }, {} as GuardrailsItems);
};

export const buildGuardrailsCopy = (
  t: Translator,
): GuardrailsCopy => {
  return {
    title: t(GUARDRAILS_KEYS.title),
    href: t(GUARDRAILS_KEYS.href),
    intro: t(GUARDRAILS_KEYS.intro),
    outro: t(GUARDRAILS_KEYS.outro),
    hero: {
      id: 'hero',
      title: t(HERO_DEFINITION.titleKey),
      content: t(HERO_DEFINITION.markdownKey),
    },
    items: buildGuardrailItems(t),
  };
};
