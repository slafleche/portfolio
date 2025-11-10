import { globalStyle } from '@vanilla-extract/css';

type GlobalStyleRule = Parameters<typeof globalStyle>[1];

export type SupportsFallbackConfig = {
  selector: string | string[];
  supported: GlobalStyleRule;
  fallback: GlobalStyleRule;
};

const wrapQuery = (query: string): string => {
  const trimmed = query.trim();
  if (!trimmed.length) {
    throw new Error('createSupportsFallback requires a non-empty query.');
  }
  if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
    return trimmed;
  }
  return `(${trimmed})`;
};

export const createSupportsFallback = (query: string) => {
  const normalized = wrapQuery(query);
  const negated = `not ${normalized}`;

  return ({ selector, supported, fallback }: SupportsFallbackConfig) => {
    const selectors = Array.isArray(selector) ? selector : [selector];
    selectors.forEach((target) => {
      globalStyle(target, {
        '@supports': {
          [normalized]: supported,
          [negated]: fallback,
        },
      });
    });
  };
};
