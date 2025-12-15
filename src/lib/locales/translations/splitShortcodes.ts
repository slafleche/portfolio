const SPLIT_MARKER = '[split]';

export type SplitResult = {
  first: string;
  second: string;
  hasSplit: boolean;
  label: string;
};

export function parseSplit(value: string): SplitResult {
  if (!value.includes(SPLIT_MARKER)) {
    const trimmed = value.trim();
    return {
      first: trimmed,
      second: '',
      hasSplit: false,
      label: trimmed,
    };
  }

  const [rawFirst, rawRest] = value.split(SPLIT_MARKER);
  const first = (rawFirst ?? '').trim();
  const second = (rawRest ?? '').trim();
  const label = [first, second].filter(Boolean).join(' ').trim();

  return {
    first,
    second,
    hasSplit: Boolean(second),
    label,
  };
}

