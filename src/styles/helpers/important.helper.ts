// Lightweight helper to append !important to all string-valued CSS properties
// on a style object (for example, outputs from paddings/margins/borders).
export const important = <T extends Record<string, unknown>>(
  styles: T,
): T =>
  Object.fromEntries(
    Object.entries(styles).map(
      ([
        key,
        value,
      ]) => [
        key,
        typeof value === 'string' ? `${value} !important` : value,
      ],
    ),
  ) as T;
