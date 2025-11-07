import type { FontVariantDefinition } from './fontVariants/core';
import { composeFontVariantStyles } from './fontVariants/core';
import { bodyVariants } from './fontVariants/body';
import { headingVariants } from './fontVariants/headings';
import { heroVariants } from './fontVariants/hero';
import { menuVariants } from './fontVariants/menu';

const fontVariantMap = {
  ...menuVariants,
  ...heroVariants,
  ...headingVariants,
  ...bodyVariants,
} as const satisfies Record<string, FontVariantDefinition>;

export const fontVariants = fontVariantMap;

export type FontVariantKey = keyof typeof fontVariants;

export function getFontVariant<Key extends FontVariantKey>(
  key: Key,
): (typeof fontVariants)[Key] {
  return fontVariants[key];
}

type ComposeVariantConfig = Parameters<
  typeof composeFontVariantStyles
>[1];

export function fontVariantStyles<Key extends FontVariantKey>(
  key: Key,
  extraConfig?: ComposeVariantConfig,
) {
  return composeFontVariantStyles(fontVariants[key], extraConfig);
}

export { composeFontVariantStyles };
export type { FontVariantDefinition };
