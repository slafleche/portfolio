import type {
  RendererExtension,
  TokenizerExtension,
  Tokens,
} from 'marked';

const SHORTCODE_PATTERN =
  /^\[MockCode\|([^\]\r\n]+)\]([^\r\n]*)\r?\n([\s\S]*?)\r?\n?\[\/MockCode\](?:\s*\r?\n|$)/i;
const TOKEN_TYPE = 'mock-code-shortcode';

type MockCodeToken = Tokens.Generic & {
  type: typeof TOKEN_TYPE;
  lang: string;
  text: string;
};

type MockCodeShortcodeExtension = TokenizerExtension &
  RendererExtension;

const sanitizeValue = (value: string | null | undefined) => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

export const createMockCodeShortcodeExtension =
  (): MockCodeShortcodeExtension => ({
    name: TOKEN_TYPE,
    level: 'block',
    start(src) {
      const index = src.indexOf('[MockCode|');
      return index >= 0 ? index : undefined;
    },
    tokenizer(src) {
      const match = SHORTCODE_PATTERN.exec(src);
      if (!match) return undefined;

      const lang = sanitizeValue(match[1]).toLowerCase();
      const trailing = match[2] ?? '';
      const body = match[3] ?? '';
      const openingLine = trailing.replace(/^\s+/, '');
      const text = openingLine ? `${openingLine}\n${body}` : body;

      return {
        type: TOKEN_TYPE,
        raw: match[0],
        lang,
        text,
      } satisfies MockCodeToken;
    },
    renderer() {
      return '';
    },
  });
