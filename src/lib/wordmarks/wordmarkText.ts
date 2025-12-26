const TOKEN_REGEX = /\[wordmark:([^\]]+)\]/;

export type WordmarkTemplateParts = {
  beforeText: string;
  afterText: string;
  wordmarkText: string;
  fullText: string;
};

export function parseWordmarkTemplate(template: string): WordmarkTemplateParts {
  const match = template.match(TOKEN_REGEX);

  if (!match || match.index === undefined) {
    const trimmed = template.trim();
    return {
      beforeText: trimmed,
      afterText: '',
      wordmarkText: '',
      fullText: trimmed,
    };
  }

  const token = match[0];
  const wordmarkText = match[1]?.trim() || '';
  const beforeText = template.slice(0, match.index).trim() || '';
  const afterText = template
    .slice(match.index + token.length)
    .trim() || '';
  const fullText = [
    beforeText,
    wordmarkText,
    afterText,
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    beforeText,
    afterText,
    wordmarkText,
    fullText,
  };
}
