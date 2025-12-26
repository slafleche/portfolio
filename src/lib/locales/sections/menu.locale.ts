import type { Messages } from '@/data/locales';
import type { Translator } from './helpers.locale';

type MessageKey = keyof Messages;

export const MENU_KEYS = {
  skipNav: 'menu-skip_nav',
  leftLabel: 'menu-left_label',
  rightLabel: 'menu-right_label',
  languageLabel: 'localeChange',
  anchorLabel: 'menu-anchor_label',
  homeLabel: 'menu-home_label',
  navLabel: 'menu-nav_label',
} as const satisfies Record<string, MessageKey>;

export const buildMenuCopy = (t: Translator) => ({
  skipNavLabel: t(MENU_KEYS.skipNav),
  leftLabel: t(MENU_KEYS.leftLabel),
  rightLabel: t(MENU_KEYS.rightLabel),
  languageLabel: t(MENU_KEYS.languageLabel),
  anchorLabel: t(MENU_KEYS.anchorLabel),
  homeLabel: t(MENU_KEYS.homeLabel),
  navLabel: t(MENU_KEYS.navLabel),
});
