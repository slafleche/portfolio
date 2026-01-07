import { resolveLocale } from '@/lib/locales/locale';
import type { Translator } from '@/lib/locales/sections/helpers.locale';

import { canonicalToLocalizedSlugs } from './localeSlugs';

export type SystemsLink = {
  href: string;
  label: string;
};

export function buildSystemsLink(
  localeParam: string,
  translator: Translator,
): SystemsLink {
  const locale = resolveLocale(localeParam);
  const slug =
    canonicalToLocalizedSlugs[locale]?.systems ?? 'systems';
  const href = `/${locale}/${slug}`;
  return {
    href,
    label: translator('systems-link-label'),
  };
}
