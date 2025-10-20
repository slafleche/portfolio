import type { Messages } from '@/data/locales';
import type { Translator } from './helpers.locale';

type MessageKey = keyof Messages;

export const MENU_KEYS = {
	skipNav: 'menu-skip_nav',
	leftLabel: 'menu-left_label',
	rightLabel: 'menu-right_label',
	languageLabel: 'localeChange',
} as const satisfies Record<string, MessageKey>;

export const buildMenuCopy = (t: Translator) => ({
	skipNavLabel: t(MENU_KEYS.skipNav),
	leftLabel: t(MENU_KEYS.leftLabel),
	rightLabel: t(MENU_KEYS.rightLabel),
	languageLabel: t(MENU_KEYS.languageLabel),
});
