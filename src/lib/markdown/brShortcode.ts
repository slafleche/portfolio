import type {
  RendererExtension,
  TokenizerExtension,
  Tokens,
} from 'marked';

const SHORTCODE_PATTERN = /^\[br(?:\|([^\]]*))?\]/i;
const TOKEN_TYPE = 'br-shortcode';

type BrToken = Tokens.Generic & {
  type: typeof TOKEN_TYPE;
  count: number;
};

type BrShortcodeExtension = TokenizerExtension & RendererExtension;

const parseBrCount = (raw: string | undefined): number => {
  if (raw === undefined) return 1;
  const trimmed = raw.trim();
  if (!/^[1-9]\d*$/.test(trimmed)) {
    throw new Error(
      `[markdown] Invalid [br] shortcode value "${raw}". Expected [br] or [br|<positive integer>].`,
    );
  }
  return Number(trimmed);
};

export const createBrShortcodeExtension =
  (): BrShortcodeExtension => ({
    name: TOKEN_TYPE,
    level: 'inline',
    start(src) {
      const index = src.toLowerCase().indexOf('[br');
      return index >= 0 ? index : undefined;
    },
    tokenizer(src) {
      const match = SHORTCODE_PATTERN.exec(src);
      if (!match) return undefined;

      const count = parseBrCount(match[1]);

      return {
        type: TOKEN_TYPE,
        raw: match[0],
        count,
      } satisfies BrToken;
    },
    renderer() {
      return '';
    },
  });

