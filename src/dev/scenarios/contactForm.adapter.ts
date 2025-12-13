import { sharedStrings } from '@/lib/sharedStrings';

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

    if (process.env.NODE_ENV !== 'production') {
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

export function resolveContactFormScenarioIdFromLocation():
  | string
  | null {
  if (process.env.NODE_ENV === 'production') return null;
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

  stripScenarioParamFromUrl(trimmed);
  return trimmed;
}
