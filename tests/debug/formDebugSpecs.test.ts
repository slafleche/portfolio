import { describe, expect, it } from 'vitest';
import { debugCardSpecs } from '../../app/[LOCALE]/debug/formelements/formDebugSpecs';
import type { FormServerResponseCode } from '@/modules/contactForm/mockSubmit';
import type { ApiScenarioId } from '../../app/[LOCALE]/debug/formelements/formDebugApiScenarios';

const RESPONSE_CODES: readonly FormServerResponseCode[] = [
  'success',
  'validation_error',
  'rate_limited',
  'service_unavailable',
  'not_configured',
  'blocked',
  'generic_error',
];

const isServerResponseCode = (
  id: ApiScenarioId,
): id is FormServerResponseCode =>
  RESPONSE_CODES.includes(id as FormServerResponseCode);

describe('form debug specs', () => {
  it('expose a card for every server response code', () => {
    const covered = new Set<FormServerResponseCode>();
    for (const spec of debugCardSpecs) {
      if (
        spec.apiScenarioId &&
        isServerResponseCode(spec.apiScenarioId)
      ) {
        covered.add(spec.apiScenarioId);
      }
    }
    const missing = RESPONSE_CODES.filter(
      (code) => !covered.has(code),
    );
    expect(missing).toEqual([]);
  });
});
