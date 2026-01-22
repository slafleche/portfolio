import type {
  RendererExtension,
  TokenizerExtension,
  Tokens,
} from 'marked';

const SHORTCODE_PATTERN = /^\[ExampleSites\|([^\]]+)\](?:\s*\n|$)/;
const TOKEN_TYPE = 'example-sites-shortcode';

type ExampleSitesToken = Tokens.Generic & {
  type: typeof TOKEN_TYPE;
  locale: string;
};

type ExampleSitesShortcodeExtension = TokenizerExtension &
  RendererExtension;

const sanitizeValue = (value: string | null | undefined) => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

const parseLocale = (raw: string | undefined): string => {
  const locale = sanitizeValue(raw).toLowerCase();
  if (locale !== 'en' && locale !== 'fr') {
    throw new Error(
      `[markdown] Invalid [ExampleSites] shortcode locale "${raw}". Expected "[ExampleSites|en]" or "[ExampleSites|fr]".`,
    );
  }
  return locale;
};

export const createExampleSitesShortcodeExtension =
  (): ExampleSitesShortcodeExtension => ({
    name: TOKEN_TYPE,
    level: 'block',
    start(src) {
      const index = src.indexOf('[ExampleSites|');
      return index >= 0 ? index : undefined;
    },
    tokenizer(src) {
      const match = SHORTCODE_PATTERN.exec(src);
      if (!match) return undefined;

      return {
        type: TOKEN_TYPE,
        raw: match[0],
        locale: parseLocale(match[1]),
      } satisfies ExampleSitesToken;
    },
    renderer() {
      return '';
    },
  });

