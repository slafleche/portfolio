'use client';

type ParsedTargetScenario = {
  scenarioId: string | null;
};

/**
 * Parse a hash fragment of the form:
 *   #<targetId>&scenario=<id>&key=value
 *
 * For example:
 *   #contact-form&scenario=visualtest_name
 */
export function parseHashForTarget(
  targetId: string,
  hash: string,
): ParsedTargetScenario {
  if (!hash || hash[0] !== '#') {
    return { scenarioId: null };
  }

  const fragment = hash.slice(1);
  if (!fragment) {
    return { scenarioId: null };
  }

  const segments = fragment.split('&');
  const [firstSegment, ...rest] = segments;

  if (firstSegment !== targetId) {
    return { scenarioId: null };
  }

  let scenarioId: string | null = null;

  rest.forEach((segment) => {
    const [key, rawValue] = segment.split('=');
    if (key === 'scenario' && typeof rawValue === 'string') {
      try {
        // Allow simple quoting: scenario="visualtest_name"
        const trimmed = rawValue.trim().replace(/^"+|"+$/g, '');
        if (trimmed) {
          scenarioId = trimmed;
        }
      } catch {
        // Ignore parse failures; scenarioId stays null.
      }
    }
  });

  return { scenarioId };
}

