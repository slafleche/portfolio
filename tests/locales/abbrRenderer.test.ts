import { describe, expect, it } from 'vitest';
import { createAbbrShortcodeExtension } from '@/lib/markdown/abbrShortcode';
import { renderAbbreviation } from '@/lib/locales/translations/abbrRenderer';
import { abbrSlug } from '@/lib/stringUtils';

const lookup = (slug: string) =>
  ({
    'abbr-ai': {
      label: 'AI',
      definition: 'Artificial Intelligence',
    },
  }[slug]);

describe('abbr renderer', () => {
  it('renders abbreviations with escaped label + definition', () => {
    const html = renderAbbreviation({
      locale: 'en',
      term: 'AI',
      lookup,
    });
    expect(html).toBe('<abbr title="Artificial Intelligence">AI</abbr>');
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

    const token = extension.tokenizer?.('[abbr:AI] rocks!');
    expect(token).toEqual({
      type: 'abbr-shortcode',
      raw: '[abbr:AI]',
      term: 'AI',
      slug: abbrSlug('AI'),
    });

    const rendered = extension.renderer?.(token as any);
    expect(rendered).toContain('<abbr');
  });
});
