import type {
  RendererExtension,
  TokenizerExtension,
  Tokens,
} from 'marked';

const SHORTCODE_PATTERN = /^\[element:([^\]]+)\]/i;
const TOKEN_TYPE = 'element-shortcode';

type ElementToken = Tokens.Generic & {
  type: typeof TOKEN_TYPE;
  name: string;
};

type ElementShortcodeExtension = TokenizerExtension &
  RendererExtension;

const sanitizeValue = (value: string | null | undefined) => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

export const createElementShortcodeExtension =
  (): ElementShortcodeExtension => ({
    name: TOKEN_TYPE,
    level: 'inline',
    start(src) {
      const index = src.indexOf('[element:');
      return index >= 0 ? index : undefined;
    },
    tokenizer(src) {
      const match = SHORTCODE_PATTERN.exec(src);
      if (!match) return undefined;

      const name = sanitizeValue(match[1]);
      if (!name) return undefined;

      return {
        type: TOKEN_TYPE,
        raw: match[0],
        name,
      } satisfies ElementToken;
    },
    renderer() {
      return '';
    },
  });
