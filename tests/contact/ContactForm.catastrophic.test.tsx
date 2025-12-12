import { describe, it, expect, vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import type { FormStatusKey } from '@/lib/locales/sections/form.locale';
import type {
  ContactFormFlowSubmitHelper,
} from '@/components/contact/types/form.types';
import { renderContactFormShellHarness } from './helpers/contactFormShell.harness';

// NOTE:
// These tests will cover *catastrophic* contact-form failures — cases where
// the user cannot realistically fix or retry from the form UI itself.
//
// The intent is to verify that:
// - The form switches to the dedicated error view (`data-form="error"`).
// - The form view (`data-form="form"`) is no longer rendered.
// - Retry affordances (submit button, jump-to-first-issue) are not shown.
// - The error copy matches the appropriate status message.

const STATUS_MESSAGES: Record<FormStatusKey, string> = {
  sending: 'sending',
  success: 'success',
  generic: 'generic',
  validation_error: 'validation_error',
  rate_limited: 'rate_limited',
  service_unavailable: 'service_unavailable',
  not_configured: 'not_configured',
  blocked: 'blocked',
};

describe('ContactForm — catastrophic failures (error view)', () => {
  it('treats a no-blocks configuration as not_configured and surfaces a catastrophic-style summary', async () => {
    const submitHelper: ContactFormFlowSubmitHelper = vi
      .fn()
      .mockResolvedValue('success');

    const {
      submit,
      container,
      getByRole,
      queryByTestId,
    } = renderContactFormShellHarness({
      blocks: [],
      submitHelper,
      statusMessages: STATUS_MESSAGES,
    });

    submit();

    await waitFor(() => {
      const inlineRegion = container.querySelector(
        '[role="status"][aria-atomic="true"]',
      ) as HTMLElement | null;
      expect(inlineRegion).not.toBeNull();
      if (!inlineRegion) return;
      expect(inlineRegion.textContent ?? '').toContain(
        'not_configured',
      );
    });

    const toastRegion = container.querySelector(
      '[role="status"]:not([aria-atomic])',
    );
    expect(toastRegion?.textContent ?? '').toContain(
      'not_configured',
    );

    expect(submitHelper).not.toHaveBeenCalled();

    const submitButton = getByRole('button', { name: 'Submit' });
    expect(submitButton).toBeDisabled();

    const jumpButton = queryByTestId('jump-to-first-issue');
    expect(jumpButton).toBeNull();
  });

  /*
   * TODO: not_configured
   *
   * Scenario:
   * - Mock /api/contact to return { ok: false, code: 'not_configured' }.
   * - Fill all fields with valid values and submit once.
   *
   * Expectations:
   * - fetchMock called exactly once.
   * - The error view is rendered: container.querySelector('[data-form="error"]') is not null.
   * - The error view text contains copy.statuses.not_configured.
   * - The live form is gone: container.querySelector('[data-form="form"]') is null.
   * - No jump-to-first-issue button or submit button is visible.
   */

  /*
   * TODO: blocked
   *
   * Scenario:
   * - Mock /api/contact to return { ok: false, code: 'blocked' }.
   * - Fill all fields with valid values and submit once.
   *
   * Expectations:
   * - fetchMock called exactly once.
   * - The error view is rendered with data-form="error".
   * - The error view text contains copy.statuses.blocked.
   * - The form view is removed and no retry controls are available.
   */
});
