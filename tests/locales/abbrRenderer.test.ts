import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import type { RendererThis, TokenizerThis, TokensList } from 'marked';
import { createAbbrShortcodeExtension } from '@/lib/markdown/abbrShortcode';
import { renderAbbreviation } from '@/lib/locales/translations/abbrRenderer';
import { abbrSlug } from '@/lib/stringUtils';
import { installTestEnv } from '../helpers/testEnvVars';

const lookup = (slug: string) =>
  ({
    'abbr-ai': {
      label: 'AI',
      definition: 'Artificial Intelligence',
    },
  })[slug];

let restoreEnv: (() => void) | null = null;

beforeEach(() => {
  restoreEnv = installTestEnv();
});

afterEach(() => {
  restoreEnv?.();
  restoreEnv = null;
});

describe('abbr renderer', () => {
  it('renders abbreviations with escaped label + definition', () => {
    const html = renderAbbreviation({
      locale: 'en',
      term: 'AI',
      lookup,
    });
    expect(html).toBe(
      '<abbr title="Artificial Intelligence">AI</abbr>',
    );
  });

  it('throws when slugs are missing in development', () => {
    expect(() =>
      renderAbbreviation({
        locale: 'en',
        term: 'R&D',
        lookup,
      }),
    ).toThrow(/Missing abbreviation definition/);
  });

  it('tokenizes [abbr:TERM] shortcodes for marked', () => {
    const extension = createAbbrShortcodeExtension({
      locale: 'en',
      lookup,
    });

    const tokenizerContext = {
      lexer: {} as TokenizerThis['lexer'],
    } as TokenizerThis;
    const tokens = [] as unknown as TokensList;
    const token = extension.tokenizer?.call(
      tokenizerContext,
      '[abbr:AI] rocks!',
      tokens,
    );
    expect(token).toEqual({
      type: 'abbr-shortcode',
      raw: '[abbr:AI]',
      term: 'AI',
      slug: abbrSlug('AI'),
    });

    const rendererContext = {
      parser: {} as RendererThis['parser'],
    } as RendererThis;
    const rendered = extension.renderer?.call(
      rendererContext,
      token as any,
    );
    expect(rendered).toContain('<abbr');
  });
});
