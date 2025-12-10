import type { Messages } from '@/data/locales';
import type { Translator } from './helpers.locale';

type MessageKey = keyof Messages;

type MarkdownSectionDefinition = {
  titleKey: MessageKey;
  markdownKey: MessageKey;
  subTitleKey?: MessageKey;
  hrefKey?: MessageKey;
} & {
  [key: string]: unknown;
};

type ResolvedMarkdownSection<Def extends MarkdownSectionDefinition> =
  Omit<
    Def,
    'titleKey' | 'markdownKey' | 'subTitleKey' | 'hrefKey'
  > & {
    title: string;
    content: string;
    subTitle?: string;
    href?: string;
  };

export function translateMarkdownSections<
  Defs extends readonly MarkdownSectionDefinition[],
>(
  translator: Translator,
  definitions: Defs,
): { [Index in keyof Defs]: ResolvedMarkdownSection<Defs[Index]> } {
  return definitions.map(
    ({ titleKey, markdownKey, subTitleKey, hrefKey, ...rest }) => ({
      ...rest,
      title: translator(titleKey),
      content: translator(markdownKey),
      ...(subTitleKey ? { subTitle: translator(subTitleKey) } : {}),
      ...(hrefKey ? { href: translator(hrefKey) } : {}),
    }),
  ) as {
    [Index in keyof Defs]: ResolvedMarkdownSection<Defs[Index]>;
  };
}

export type { MarkdownSectionDefinition };
