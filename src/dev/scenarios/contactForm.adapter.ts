import { sharedStrings } from '@/lib/sharedStrings';

import { isRelease, notRelease } from '../../lib/runtimeEnv';

export function resolveContactFormScenarioIdFromLocation():
  | string
  | null {
  if (isRelease()) return null;
  if (typeof window === 'undefined') return null;

  const { hash, search } = window.location;
  const normalizedHash =
    typeof hash === 'string' ? hash.trim().toLowerCase() : '';

  const contactHash = sharedStrings.contactFormHash.toLowerCase();
  if (!normalizedHash || !normalizedHash.startsWith(contactHash)) {
    return null;
  }

  const params = new URLSearchParams(search || '');
  const rawId = params.get('scenario');
  if (!rawId) return null;

  const trimmed = rawId.trim();
  if (!trimmed) return null;

  return trimmed;
}

const stripScenarioParamFromUrl = (scenarioId: string) => {
  try {
    if (typeof window === 'undefined') return;
    const previousHref = window.location.href;
    const url = new URL(previousHref);
    url.searchParams.delete('scenario');

    const nextHref = url.toString();

    if (
      typeof window.history !== 'undefined' &&
      typeof window.history.replaceState === 'function'
    ) {
      window.history.replaceState(window.history.state, '', nextHref);
    }

    if (notRelease()) {
      // Dev-only debug log so scenarios remain traceable when they are stripped.
      console.log('[contact][dev-scenario][stripped]', {
        scenarioId,
        previousHref,
        nextHref,
      });
    }
  } catch {
    // Best-effort cleanup only; ignore URL/History failures.
  }
};

export function stripContactFormScenarioFromLocation(): void {
  if (isRelease()) return;
  if (typeof window === 'undefined') return;

  try {
    const { search } = window.location;
    const params = new URLSearchParams(search || '');
    const rawId = params.get('scenario');
    if (!rawId) return;
    const trimmed = rawId.trim();
    if (!trimmed) return;
    stripScenarioParamFromUrl(trimmed);
  } catch {
    // Ignore URL parsing failures; stripping is best-effort only.
  }
}
