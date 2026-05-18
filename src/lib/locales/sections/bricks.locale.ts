import type { MessageKey, Translator } from './helpers.locale';

type BrickDefinition = {
  titleKey: MessageKey;
  markdownKey: MessageKey;
};

const HERO_DEFINITION: BrickDefinition = {
  titleKey: 'bricks-hero-title',
  markdownKey: 'bricks-hero-content',
};

const ITEM_DEFINITIONS = {
  item1: {
    titleKey: 'bricks-01-title',
    markdownKey: 'bricks-01-content',
  },
  item2: {
    titleKey: 'bricks-02-title',
    markdownKey: 'bricks-02-content',
  },
  item3: {
    titleKey: 'bricks-03-title',
    markdownKey: 'bricks-03-content',
  },
  item4: {
    titleKey: 'bricks-04-title',
    markdownKey: 'bricks-04-content',
  },
} as const satisfies Record<string, BrickDefinition>;

export type BrickItemId = keyof typeof ITEM_DEFINITIONS;

export type BrickListItem = {
  id: BrickItemId | 'hero';
  title: string;
  content: string;
};

export type BricksItems = {
  [Key in BrickItemId]: BrickListItem;
};

export type BricksCopy = {
  hero: BrickListItem;
  items: BricksItems;
};

const buildBrickItems = (t: Translator): BricksItems => {
  return (
    Object.entries(ITEM_DEFINITIONS) as [
      BrickItemId,
      BrickDefinition,
    ][]
  ).reduce<BricksItems>((acc, [id, definition]) => {
    acc[id] = {
      id,
      title: t(definition.titleKey),
      content: t(definition.markdownKey),
    };
    return acc;
  }, {} as BricksItems);
};

export const buildBricksCopy = (t: Translator): BricksCopy => {
  return {
    hero: {
      id: 'hero',
      title: t(HERO_DEFINITION.titleKey),
      content: t(HERO_DEFINITION.markdownKey),
    },
    items: buildBrickItems(t),
  };
};
