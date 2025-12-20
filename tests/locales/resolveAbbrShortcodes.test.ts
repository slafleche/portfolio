import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { resolveAbbrShortcodes } from '@/lib/locales/translations/resolveAbbrShortcodes';
import { isLocaleRichText } from '@/lib/stringUtils';
import { installTestEnv } from '../helpers/testEnvVars';

let restoreEnv: (() => void) | null = null;

beforeEach(() => {
  restoreEnv = installTestEnv();
});

afterEach(() => {
  restoreEnv?.();
  restoreEnv = null;
});

describe('resolveAbbrShortcodes', () => {
  it('replaces [abbr:TERM] tokens with <abbr> markup', () => {
    const data = {
      'abbr-ai': {
        label: 'AI',
        definition: 'Artificial Intelligence',
      },
      intro: 'Working with [abbr:AI] daily.',
      items: [
        'No shorthand here',
        'Another [abbr:AI] mention',
      ],
    };

    const result = resolveAbbrShortcodes(data, 'en');
    expect(isLocaleRichText(result.intro)).toBe(true);
    expect(result.intro).toContain('<abbr');
    expect(result.items[1]).toContain('<abbr');
  });

  it('throws in development when abbreviation slug is missing', () => {
    const data = {
      unrelated: 'Check [abbr:UNKNOWN]',
    };
    expect(() => resolveAbbrShortcodes(data, 'en')).toThrow(
      /Missing abbreviation definition/,
    );
  });
});
