import { sharedStrings } from '@/lib/sharedStrings';

let contactFormScenarioConsumed = false;

export function resolveContactFormScenarioIdFromLocation():
  | string
  | null {
  if (process.env.NODE_ENV === 'production') return null;
  if (typeof window === 'undefined') return null;
  if (contactFormScenarioConsumed) return null;

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

  contactFormScenarioConsumed = true;
  return trimmed;
}

