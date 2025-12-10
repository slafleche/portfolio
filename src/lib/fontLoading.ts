const DEFAULT_TIMEOUT_MS = 1500;

export type WaitForFontsOptions = {
  timeoutMs?: number;
};

export function waitForFonts(
  fonts: readonly string[] = [],
  options: WaitForFontsOptions = {},
): Promise<boolean> {
  if (typeof document === 'undefined' || !('fonts' in document)) {
    return Promise.resolve(true);
  }

  const uniqueFonts = Array.from(
    new Set((fonts ?? []).map((font) => font.trim()).filter(Boolean)),
  );
  if (uniqueFonts.length === 0) {
    return Promise.resolve(true);
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  return new Promise<boolean>((resolve) => {
    let settled = false;
    const finish = (result: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      resolve(result);
    };

    const timeoutId = window.setTimeout(() => {
      finish(false);
    }, timeoutMs);

    Promise.all(
      uniqueFonts.map((font) =>
        document.fonts.load(`48px "${font}"`).catch(() => undefined),
      ),
    )
      .then(() => finish(true))
      .catch(() => finish(false));
  });
}

export function collectWaitForFonts(
  ...sources: Array<
    | {
        waitForFonts?: readonly string[];
        waitForFontsTimeoutMs?: number;
      }
    | undefined
    | null
  >
): {
  fonts: string[];
  timeoutMs?: number;
} {
  const fontsSet = new Set<string>();
  let timeoutMs: number | undefined;

  for (const source of sources) {
    if (!source) continue;
    const list = source.waitForFonts ?? [];
    for (const font of list) {
      if (typeof font === 'string' && font.trim().length > 0) {
        fontsSet.add(font.trim());
      }
    }
    if (source.waitForFontsTimeoutMs !== undefined) {
      timeoutMs =
        Math.max(timeoutMs ?? 0, source.waitForFontsTimeoutMs ?? 0) ||
        timeoutMs;
    }
  }

  return {
    fonts: Array.from(fontsSet),
    timeoutMs,
  };
}
