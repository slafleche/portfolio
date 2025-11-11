export function toTrimmedOrNull(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  return trimmed.replace(/\s+/g, ' ');
}

const NON_SLUG_CHARACTERS = /[^a-z0-9&\s-]+/g;
const WHITESPACE = /\s+/g;
const DUPLICATE_DASHES = /-+/g;
const DASH_EDGES = /^-+|-+$/g;

export function abbrSlug(term: string): string {
  const base = term ?? '';
  const normalized = base
    .trim()
    .toLowerCase()
    .replace(NON_SLUG_CHARACTERS, '')
    .replace(WHITESPACE, '-')
    .replace(DUPLICATE_DASHES, '-')
    .replace(DASH_EDGES, '');

  const fallback = base.trim().toLowerCase().replace(WHITESPACE, '-');
  const suffix = normalized.length > 0 ? normalized : fallback;
  return `abbr-${suffix}`;
}

export type EscapeHtmlOptions = {
  escapeAmpersands?: boolean;
  escapeLessThan?: boolean;
  escapeGreaterThan?: boolean;
  escapeDoubleQuotes?: boolean;
  escapeSingleQuotes?: boolean;
  convertLineBreaks?: boolean;
};

export function escapeHtml(
  value: string,
  {
    escapeAmpersands = true,
    escapeLessThan = true,
    escapeGreaterThan = true,
    escapeDoubleQuotes = true,
    escapeSingleQuotes = true,
    convertLineBreaks = true,
  }: EscapeHtmlOptions = {},
): string {
  let result = value;

  if (escapeAmpersands) {
    result = result.replace(/&/g, '&amp;');
  }
  if (escapeLessThan) {
    result = result.replace(/</g, '&lt;');
  }
  if (escapeGreaterThan) {
    result = result.replace(/>/g, '&gt;');
  }
  if (escapeDoubleQuotes) {
    result = result.replace(/"/g, '&quot;');
  }
  if (escapeSingleQuotes) {
    result = result.replace(/'/g, '&#39;');
  }
  if (convertLineBreaks) {
    result = result.replace(/\n/g, '<br />');
  }

  return result;
}

export type LocaleRichText = string & {
  readonly __localeRichText: true;
};

export const isLocaleRichText = (value: unknown): value is LocaleRichText =>
  typeof value === 'string' && value.includes('<abbr');

export const toLocaleRichText = (value: string): LocaleRichText =>
  value as LocaleRichText;
